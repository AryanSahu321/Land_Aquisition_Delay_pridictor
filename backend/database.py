"""
Spatial Database Connection & Session Management
Supports PostgreSQL + PostGIS with graceful fallback to SQLite for local execution.
"""

import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

# Environment variable with PostgreSQL default
DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "sqlite:///./land_intelligence.db"
)

# For SQLite, enable check_same_thread=False
if DATABASE_URL.startswith("sqlite"):
    engine = create_engine(
        DATABASE_URL,
        connect_args={"check_same_thread": False}
    )
else:
    engine = create_engine(
        DATABASE_URL,
        pool_size=20,
        max_overflow=10,
        pool_pre_ping=True
    )

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    """Dependency generator for database sessions."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

