import os
from pathlib import Path

# Define root and output structure
ROOT_DIR = Path(".")
OUTPUT_DIR = Path("project_architecture_audit")
OUTPUT_DIR.mkdir(exist_ok=True)

# Files to map and explain
TARGET_FILES = [
    "README.md",
    "docker-compose.yml",
    ".gitignore",
    "backend/main.py",
    "backend/celery_app.py",
    "backend/tasks.py",
    "backend/etl_pipeline.py",
    "backend/survival_analysis.py",
    "backend/database.py",
    "backend/models.py",
    "backend/mock_data.py",
    "backend/seed_data.py",
    "backend/test_api.py",
    "dags/daily_litigation_ingest_dag.py",
    "frontend/package.json",
]

def generate_audit_report():
    report_path = OUTPUT_DIR / "system_architecture_breakdown.md"
    print(f"[*] Generating architectural audit report at: {report_path.absolute()}")
    
    with open(report_path, "w", encoding="utf-8") as f:
        f.write("# PM GatiShakti Land Acquisition Platform: System Architecture Blueprint\n\n")
        f.write("This document details the exact file-by-file breakdown of the distributed intelligence platform, explaining its ETL pipeline, machine learning engine, geospatial database, and frontend dashboards.\n\n")
        
        for file_path_str in TARGET_FILES:
            file_path = ROOT_DIR / file_path_str
            f.write(f"## File: `{file_path_str}`\n\n")
            
            if file_path.exists():
                # Explain role based on path
                role = get_file_role(file_path_str)
                f.write(f"**Architectural Role:** {role}\n\n")
                f.write("```text\n")
                try:
                    content = file_path.read_text(encoding="utf-8")
                    # Write first 50 lines or full content if short
                    lines = content.splitlines()
                    snippet = "\n".join(lines[:60])
                    f.write(snippet)
                    if len(lines) > 60:
                        f.write("\n\n... [Remaining content truncated for audit brevity] ...")
                except Exception as e:
                    f.write(f"Error reading file: {e}")
                f.write("\n```\n\n---\n\n")
            else:
                f.write(f"*Status: File not found in workspace directory.*\n\n---\n\n")
                
    print("[+] Audit documentation successfully generated!")

def get_file_role(path: str) -> str:
    roles = {
        "README.md": "Master system documentation, statutory compliance guidelines (NH Act 1956 / RFCTLARR Act 2013), and execution instructions.",
        "docker-compose.yml": "Production container orchestrator spinning up PostGIS, Redis, Celery, Airflow, and FastAPI microservices.",
        ".gitignore": "Excludes heavy local dependencies, virtual environments, and cached build artifacts from Git history.",
        "backend/main.py": "FastAPI core application gateway serving REST endpoints, managing startup ML model training, and handling live inference requests.",
        "backend/celery_app.py": "Configures the asynchronous Celery background task queue using Redis as the message broker.",
        "backend/tasks.py": "Defines heavy background workers that execute bulk XGBoost inferences and SHAP calculations asynchronously.",
        "backend/etl_pipeline.py": "Layer 1 Data Ingestion Engine: Handles fuzzy string matching, milestone date normalization, bounds clamping, and RoW spatial overlap math.",
        "backend/survival_analysis.py": "Lifelines Cox Proportional Hazards survival model computing time-to-clearance probabilities for right-censored administrative tasks.",
        "backend/database.py": "Establishes SQLAlchemy database session connectivity with PostgreSQL and PostGIS extensions.",
        "backend/models.py": "Relational and spatial database schema models mapping parcels, administrative logs, and geometric polygon coordinates.",
        "backend/mock_data.py": "Generates domain-authentic synthetic records adhering to real regional tehsils (Prayagraj, Varanasi, Mirzapur).",
        "backend/seed_data.py": "Database initialization script that populates initial statutory records.",
        "backend/test_api.py": "Automated regression and endpoint test suite validating API response times and predictive accuracy.",
        "dags/daily_litigation_ingest_dag.py": "Apache Airflow DAG orchestrating scheduled midnight extractions from state revenue portals and e-courts.",
        "frontend/package.json": "Node.js configuration file defining frontend dependencies (React, Vite, Tailwind CSS, Leaflet, ECharts)."
    }
    return roles.get(path, "Core project component.")

if __name__ == "__main__":
    generate_audit_report()

 # C:\Users\aryan\OneDrive\Desktop\land> python generate_project_audit.py 