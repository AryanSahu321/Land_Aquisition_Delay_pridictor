"""
Distributed Celery Tasks for Asynchronous ML Inference & TreeSHAP Attribution
Recalculates high-volume bulk parcel updates and caches high-risk parcels in Redis.
"""

import json
import os
import time
import redis
import numpy as np
import pandas as pd
from celery_app import celery
import main

# Redis client for caching
REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379/0")

def get_redis_client():
    try:
        return redis.from_url(REDIS_URL, decode_responses=True)
    except Exception as e:
        print(f"Warning: Redis not connected: {e}")
        return None

def ensure_models_loaded():
    """Ensures production ensemble and TreeSHAP models are loaded in memory."""
    if main.DATA_STORE.get("regressor") is None or not main.DATA_STORE.get("is_production_model"):
        main.initialize_data_store()

@celery.task(bind=True, name="tasks.recalculate_project_risks")
def recalculate_project_risks(self, project_id: str, updates: list):
    """
    Celery worker task:
    1. Receives bulk parcel updates
    2. Recalculates delay probabilities using 47-feature XGBoost + LightGBM production ensemble
    3. Computes TreeSHAP factor attributions for high-risk parcels
    4. Attaches statutory SOP action prescriptions
    5. Caches the updated high-risk parcel list directly in Redis for <10ms retrieval
    """
    ensure_models_loaded()
    start_time = time.perf_counter()
    total_records = len(updates)
    processed_results = []
    high_risk_parcels = []

    r_client = get_redis_client()
    explainer = main.DATA_STORE.get("explainer")

    for idx, item in enumerate(updates):
        parcel_id = item.get("parcel_id", f"PARCEL-{idx}")
        
        # 1. Run inference through 47-feature production ensemble
        pred = main.compute_prediction(item)
        pred_delay = pred["predicted_delay_days"]
        delay_prob = pred["delay_probability"]
        risk_cat = pred["risk_category"]
        conf_score = pred.get("confidence_score", 0.85)

        # 2. Derive primary bottleneck and SHAP attribution
        primary_bottleneck = "On Schedule"
        top_drivers = []

        # Use TreeSHAP if available
        if explainer is not None and (risk_cat in ["High", "Medium"] or item.get("pending_court_injunctions", 0) > 0):
            try:
                X_mat = main.encode_record_47(item)
                shap_vals = explainer.shap_values(X_mat)
                shap_row = shap_vals[0] if isinstance(shap_vals, (list, np.ndarray)) else shap_vals
                if hasattr(shap_row, "values"):
                    shap_row = shap_row.values
                if len(shap_row.shape) > 1:
                    shap_row = shap_row[0]

                feature_names = main.DATA_STORE.get("feature_names", list(X_mat.columns))
                drivers = []
                for feat, val in zip(feature_names, shap_row):
                    impact = float(val)
                    fname, fdesc = main.FRIENDLY_NAMES_47.get(feat, (feat.replace('_', ' ').title(), feat))
                    drivers.append({
                        "feature": feat,
                        "display_name": fname,
                        "impact_days": round(impact, 1),
                        "direction": "increase" if impact > 0 else "decrease"
                    })
                drivers.sort(key=lambda x: abs(x["impact_days"]), reverse=True)
                top_drivers = drivers[:3]
                if top_drivers and top_drivers[0]["impact_days"] > 0:
                    primary_bottleneck = f"{top_drivers[0]['display_name']} (+{top_drivers[0]['impact_days']}d)"
            except Exception as e:
                # Fallback to statutory heuristics if SHAP encounters edge case
                injunctions = int(item.get("pending_court_injunctions", 0))
                sec_3h = bool(item.get("sec_3h_escrow_deposited", False))
                disbursed = float(item.get("compensation_disbursed_pct", 50.0))
                if injunctions > 0 and not sec_3h:
                    primary_bottleneck = f"Civil Stay without Sec 3H Escrow ({injunctions} stays)"
                elif disbursed < 40:
                    primary_bottleneck = "Disbursement Stalled (<40%)"
                elif not bool(item.get("jms_completed", True)):
                    primary_bottleneck = "JMS Incomplete Block"
                else:
                    primary_bottleneck = "Statutory Procedural Lag"
        else:
            # Deterministic statutory bottleneck
            injunctions = int(item.get("pending_court_injunctions", 0))
            sec_3h = bool(item.get("sec_3h_escrow_deposited", False))
            disbursed = float(item.get("compensation_disbursed_pct", 50.0))
            if injunctions > 0 and not sec_3h:
                primary_bottleneck = f"Civil Stay without Sec 3H Escrow ({injunctions} stays)"
            elif disbursed < 40:
                primary_bottleneck = "Disbursement Stalled (<40%)"
            elif not bool(item.get("jms_completed", True)):
                primary_bottleneck = "JMS Incomplete Block"
            else:
                primary_bottleneck = "On Schedule"

        # 3. Generate statutory prescriptive actions
        prescriptions = [p.dict() for p in main.generate_statutory_prescriptions(item)]

        record_summary = {
            "parcel_id": parcel_id,
            "khasra_no": item.get("khasra_no", "101/1"),
            "predicted_delay_days": pred_delay,
            "delay_probability": delay_prob,
            "risk_category": risk_cat,
            "confidence_score": conf_score,
            "primary_bottleneck": primary_bottleneck,
            "top_drivers": top_drivers,
            "prescriptions_count": len(prescriptions),
            "prescriptions": prescriptions[:2],
            "updated_at": time.time()
        }

        processed_results.append(record_summary)
        if risk_cat == "High":
            high_risk_parcels.append(record_summary)

        # Update celery task progress
        if self is not None and hasattr(self, "update_state") and idx % 50 == 0:
            try:
                self.update_state(
                    state="PROGRESS",
                    meta={"current": idx, "total": total_records, "percent": int((idx / max(1, total_records)) * 100)}
                )
            except Exception:
                pass

    elapsed_ms = round((time.perf_counter() - start_time) * 1000, 2)

    # Cache high-risk parcels and project summary in Redis
    if r_client:
        try:
            cache_key = f"project:{project_id}:high_risk"
            r_client.setex(
                cache_key,
                3600,  # 1 hour TTL
                json.dumps({
                    "project_id": project_id,
                    "total_updated": total_records,
                    "high_risk_count": len(high_risk_parcels),
                    "processing_time_ms": elapsed_ms,
                    "parcels": high_risk_parcels
                })
            )
            # Also cache project summary key
            r_client.setex(
                f"project:{project_id}:summary",
                3600,
                json.dumps({
                    "project_id": project_id,
                    "avg_delay_days": round(float(np.mean([p["predicted_delay_days"] for p in processed_results])), 1) if processed_results else 0.0,
                    "high_risk_count": len(high_risk_parcels),
                    "total_processed": total_records
                })
            )
        except Exception as e:
            print(f"Redis cache write error: {e}")

    return {
        "status": "COMPLETED",
        "project_id": project_id,
        "processed_count": total_records,
        "high_risk_count": len(high_risk_parcels),
        "execution_time_ms": elapsed_ms,
        "high_risk_parcels": high_risk_parcels[:20]
    }


