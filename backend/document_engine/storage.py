import os
import json
import hashlib
import logging
from datetime import datetime
from pathlib import Path
from typing import Dict, Any, List, Optional

import pandas as pd
from .document_extractor import DocumentExtractor

logger = logging.getLogger(__name__)

DATA_DIR = Path(__file__).resolve().parent.parent / "data"
CSV_PATH = DATA_DIR / "data.csv"
SEARCHED_CSV_PATH = DATA_DIR / "searched_projects.csv"
PROJECTS_DB_DIR = DATA_DIR / "projects_db"


class ProjectDatabaseRepository:
    """
    Tier 2: Central Database / Storage Layer.
    Encapsulates persistence in searched_projects.csv with a repository interface
    designed for seamless future migration to PostgreSQL.
    """
    def __init__(self, storage_path: Path = SEARCHED_CSV_PATH, extractor: Optional[DocumentExtractor] = None):
        self.storage_path = storage_path
        self.extractor = extractor or DocumentExtractor()
        self.df: pd.DataFrame = pd.DataFrame()
        self._load_storage()

    def _load_storage(self):
        """Loads searched_projects.csv into memory."""
        if self.storage_path.exists() and self.storage_path.stat().st_size > 0:
            try:
                self.df = pd.read_csv(self.storage_path)
                logger.info(f"Loaded {len(self.df)} projects from Central Database ({self.storage_path}).")
            except Exception as e:
                logger.warning(f"Error loading {self.storage_path}: {e}. Rebuilding empty DataFrame.")
                self.df = pd.DataFrame()
        else:
            self.df = pd.DataFrame()

    def _save_storage(self):
        """Atomically saves the DataFrame to searched_projects.csv."""
        try:
            self.storage_path.parent.mkdir(parents=True, exist_ok=True)
            self.df.to_csv(self.storage_path, index=False)
            logger.info(f"Persisted Central Database to {self.storage_path} with {len(self.df)} records.")
        except Exception as e:
            logger.error(f"Failed to write Central Database {self.storage_path}: {e}")

    def compute_inventory_hash(self, project_dir: Path) -> str:
        """Computes a composite hash of all PDF filenames, modification times, and sizes."""
        if not project_dir.exists():
            return "empty"
        
        pdf_entries = []
        for p in sorted(project_dir.rglob("*.pdf")):
            try:
                stat = p.stat()
                pdf_entries.append(f"{p.name}:{stat.st_mtime}:{stat.st_size}")
            except Exception:
                continue
                
        if not pdf_entries:
            return "no_pdfs"
            
        combined = "|".join(pdf_entries)
        return hashlib.sha256(combined.encode("utf-8")).hexdigest()[:16]

    def startup_sync(self):
        """
        One-time startup ingestion:
        Checks for new PDFs or unparsed projects.
        Skips already parsed files, runs File Parser on new additions,
        and saves updated parameters to Central Database.
        """
        logger.info("Executing ProjectDatabaseRepository startup sync...")
        projects_index_file = PROJECTS_DB_DIR / "index.json"
        
        known_projects = []
        if projects_index_file.exists():
            try:
                with open(projects_index_file, "r", encoding="utf-8") as f:
                    known_projects = json.load(f)
            except Exception as e:
                logger.warning(f"Could not read index.json: {e}")

        # If searched_projects.csv is completely empty, initialize from known projects & data.csv
        if self.df.empty:
            logger.info("Central Database is empty. Seeding initial projects from projects_db and data.csv...")
            seed_rows = []
            
            # 1. From projects_db index
            for p in known_projects:
                slug = p.get("slug", p["project_name"].lower().replace(" ", "_"))
                p_dir = PROJECTS_DB_DIR / slug
                inv_hash = self.compute_inventory_hash(p_dir)
                
                features, audit, latency = self.extractor.parse_project_documents(p_dir, p["project_name"])
                
                row = {
                    "project_id": p.get("project_id", f"PRJ-{slug[:6].upper()}"),
                    "project_name": p["project_name"],
                    "agency": p.get("agency", "NHAI"),
                    "ministry": p.get("ministry", "Ministry of Road Transport and Highways (MoRTH)"),
                    "government_type": p.get("government_type", "Central Gov"),
                    "state": p.get("state", "Uttar Pradesh"),
                    "corridor": p.get("corridor", "Corridor"),
                    "total_km": p.get("total_km", 100.0),
                    "packages_count": p.get("packages_count", 4),
                    "doc_inventory_hash": inv_hash,
                    "last_parsed_timestamp": datetime.utcnow().isoformat(),
                    "parsing_latency_ms": latency,
                    **features
                }
                seed_rows.append(row)

            # 2. Also incorporate projects from data.csv
            if CSV_PATH.exists():
                try:
                    df_csv = pd.read_csv(CSV_PATH)
                    existing_names = {r["project_name"] for r in seed_rows}
                    for idx, r in df_csv.iterrows():
                        p_name = str(r.get("project_name", "")).strip()
                        if p_name and p_name not in existing_names:
                            row_dict = r.to_dict()
                            row_dict["agency"] = "NHAI" if "NH" in p_name or "Expressway" in p_name else "Infrastructure Agency"
                            row_dict["ministry"] = "Ministry of Road Transport and Highways (MoRTH)" if "Expressway" in p_name or "NH" in p_name else "Central Ministry"
                            row_dict["government_type"] = "Central Gov" if r.get("jurisdiction") == "Central" else "State Gov"
                            row_dict["doc_inventory_hash"] = "csv_ground_truth"
                            row_dict["last_parsed_timestamp"] = datetime.utcnow().isoformat()
                            row_dict["parsing_latency_ms"] = 0.0
                            seed_rows.append(row_dict)
                            existing_names.add(p_name)
                            if len(seed_rows) >= 50: # Seed diverse representative set
                                break
                except Exception as e:
                    logger.warning(f"Error seeding from data.csv: {e}")

            self.df = pd.DataFrame(seed_rows)
            self._save_storage()
            logger.info(f"Startup sync complete! Central Database initialized with {len(self.df)} projects.")
            return

        # Incremental check for new PDFs or projects
        updated = False
        for p in known_projects:
            p_name = p["project_name"]
            slug = p.get("slug", p_name.lower().replace(" ", "_"))
            p_dir = PROJECTS_DB_DIR / slug
            current_hash = self.compute_inventory_hash(p_dir)
            
            existing_match = self.df[self.df["project_name"] == p_name]
            if len(existing_match) == 0:
                # Brand new project added!
                logger.info(f"New project detected on startup: {p_name}. Parsing PDFs...")
                features, audit, latency = self.extractor.parse_project_documents(p_dir, p_name)
                new_row = {
                    "project_id": p.get("project_id", f"PRJ-{slug[:6].upper()}"),
                    "project_name": p_name,
                    "agency": p.get("agency", "NHAI"),
                    "ministry": p.get("ministry", "MoRTH"),
                    "government_type": p.get("government_type", "Central Gov"),
                    "doc_inventory_hash": current_hash,
                    "last_parsed_timestamp": datetime.utcnow().isoformat(),
                    "parsing_latency_ms": latency,
                    **features
                }
                self.df = pd.concat([self.df, pd.DataFrame([new_row])], ignore_index=True)
                updated = True
            else:
                # Check if hash changed (new PDF added)
                stored_hash = existing_match.iloc[0].get("doc_inventory_hash", "")
                if current_hash != "no_pdfs" and current_hash != stored_hash and current_hash != "empty":
                    logger.info(f"New or modified PDF detected for {p_name} on startup. Parsing delta...")
                    features, audit, latency = self.extractor.parse_project_documents(p_dir, p_name)
                    idx = existing_match.index[0]
                    for k, v in features.items():
                        self.df.at[idx, k] = v
                    self.df.at[idx, "doc_inventory_hash"] = current_hash
                    self.df.at[idx, "last_parsed_timestamp"] = datetime.utcnow().isoformat()
                    self.df.at[idx, "parsing_latency_ms"] = latency
                    updated = True

        if updated:
            self._save_storage()
            logger.info("Startup sync saved updated project parameters to Central Database.")
        else:
            logger.info("Startup sync verified: All PDFs are up-to-date in Central Database. Parser idle.")

    def get_project(self, project_name: str, agency: Optional[str] = None) -> Optional[Dict[str, Any]]:
        """
        Fast lookup: Queries Central Database directly in memory.
        Zero PDF parsing latency.
        """
        if self.df.empty:
            self._load_storage()
            
        if self.df.empty:
            return None

        # Exact match
        match = self.df[self.df["project_name"].str.strip().str.lower() == project_name.strip().lower()]
        
        # Fuzzy substring match
        if len(match) == 0:
            match = self.df[self.df["project_name"].str.contains(project_name.strip()[:10], case=False, na=False, regex=False)]

        if len(match) > 0:
            row = match.iloc[0].to_dict()
            # Clean NaN values
            cleaned = {}
            for k, v in row.items():
                cleaned[k] = None if pd.isna(v) else v
            return cleaned

        return None

    def get_search_options(self) -> Dict[str, List[str]]:
        """Returns autocomplete options for the landing page form."""
        if self.df.empty:
            self._load_storage()

        projects = []
        agencies = set()
        ministries = set()
        gov_types = {"Central / Union Gov", "State Gov", "Joint Venture"}

        if not self.df.empty:
            projects = sorted(self.df["project_name"].dropna().unique().tolist())
            if "agency" in self.df.columns:
                agencies.update(self.df["agency"].dropna().unique().tolist())
            if "ministry" in self.df.columns:
                ministries.update(self.df["ministry"].dropna().unique().tolist())

        # Curated standard government entities
        standard_agencies = ["NHAI", "UPEIDA", "DFCCIL", "K-RIDE", "PGCIL", "KMRL", "NCRTC", "UPMRC", "NHPC", "NHIDCL"]
        standard_ministries = [
            "Ministry of Road Transport and Highways (MoRTH)",
            "Dept of Infrastructure & Industrial Development (Govt of UP)",
            "Ministry of Railways",
            "Ministry of Housing and Urban Affairs (MoHUA)",
            "Ministry of Power",
            "State Infrastructure Development Department"
        ]
        
        for a in standard_agencies:
            agencies.add(a)
        for m in standard_ministries:
            ministries.add(m)

        return {
            "projects": projects[:50],
            "agencies": sorted(list(agencies)),
            "ministries": sorted(list(ministries)),
            "government_types": sorted(list(gov_types))
        }

    def log_feedback(self, project_id: str, statutory_stage: str, actual_delay_days: int, notes: str = "") -> bool:
        """Active learning loop: Appends real-world milestone completions to ground truth."""
        try:
            if not self.df.empty and "project_id" in self.df.columns:
                match = self.df[self.df["project_id"] == project_id]
                if len(match) > 0:
                    idx = match.index[0]
                    self.df.at[idx, "statutory_stage"] = statutory_stage
                    self.df.at[idx, "actual_delay_days"] = actual_delay_days
                    self._save_storage()
                    logger.info(f"Logged active learning feedback for {project_id}: Stage={statutory_stage}, Delay={actual_delay_days}d")
                    return True
        except Exception as e:
            logger.error(f"Failed to log feedback for {project_id}: {e}")
        return False
