"""
SQLAlchemy Models for Land Acquisition Decision Support System
Integrates tabular administrative records with spatial polygon geometries.
"""

from datetime import datetime
from sqlalchemy import (
    Column,
    Integer,
    String,
    Float,
    Boolean,
    DateTime,
    Text,
    ForeignKey,
    Index
)
from sqlalchemy.orm import relationship
from database import Base

class Project(Base):
    """Highway or Linear Infrastructure Project Entity."""
    __tablename__ = "projects"

    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(String(50), unique=True, index=True, nullable=False)
    project_name = Column(String(255), nullable=False)
    highway_number = Column(String(50), default="NH-19")
    package_number = Column(String(50), default="Package 3")
    total_length_km = Column(Float, default=64.0)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    parcels = relationship("Parcel", back_populates="project", cascade="all, delete-orphan")


class Parcel(Base):
    """
    Cadastral / Revenue Land Parcel linked with geographic polygon data.
    Enforces RFCTLARR Act 2013 and National Highways Act 1956 schema attributes.
    """
    __tablename__ = "parcels"

    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(String(50), ForeignKey("projects.project_id"), nullable=False, index=True)
    parcel_id = Column(String(80), unique=True, index=True, nullable=False)
    khasra_no = Column(String(50), nullable=False, index=True)
    khatauni_no = Column(String(50), nullable=False)
    village_name = Column(String(100), nullable=False, index=True)
    tehsil = Column(String(100), nullable=False, index=True)
    district = Column(String(100), nullable=False, index=True)
    chainage_km = Column(String(80), nullable=False)

    # Statutory Lifecycle State
    statutory_stage = Column(String(80), nullable=False)
    days_in_current_stage = Column(Integer, default=30)
    land_type = Column(String(80), nullable=False)
    total_area_hectares = Column(Float, nullable=False)
    affected_families_count = Column(Integer, default=1)
    compensation_disbursed_pct = Column(Float, default=0.0)
    pending_court_injunctions = Column(Integer, default=0)
    sec_3h_escrow_deposited = Column(Boolean, default=False)
    jms_completed = Column(Boolean, default=True)
    missing_title_deeds_pct = Column(Float, default=0.0)

    # Ground truth & Predictions
    actual_delay_days = Column(Integer, default=0)
    predicted_delay_days = Column(Integer, default=0)
    delay_probability = Column(Float, default=0.0)
    risk_category = Column(String(20), default="Low")
    primary_bottleneck = Column(String(255), default="On Schedule")

    # Spatial Geometry: Stored as GeoJSON string or WKT geometry
    geometry_geojson = Column(Text, nullable=True)
    center_lat = Column(Float, nullable=True)
    center_lon = Column(Float, nullable=True)

    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    project = relationship("Project", back_populates="parcels")
    litigation_logs = relationship("LitigationLog", back_populates="parcel", cascade="all, delete-orphan")
    clearance_records = relationship("ClearanceRecord", back_populates="parcel", cascade="all, delete-orphan")


class LitigationLog(Base):
    """Litigation and Court Stay orders for parcels."""
    __tablename__ = "litigation_logs"

    id = Column(Integer, primary_key=True, index=True)
    parcel_id = Column(String(80), ForeignKey("parcels.parcel_id"), nullable=False, index=True)
    court_name = Column(String(150), nullable=False)
    case_number = Column(String(100), nullable=False)
    stay_order_active = Column(Boolean, default=True)
    stay_type = Column(String(100), default="Title & Ownership Injunction")
    filing_date = Column(DateTime, default=datetime.utcnow)
    next_hearing_date = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    parcel = relationship("Parcel", back_populates="litigation_logs")


class ClearanceRecord(Base):
    """
    Environmental, Forest, and Utility Relocation clearances.
    Serves as input data for Lifelines survival analysis (right-censored time-to-event).
    """
    __tablename__ = "clearance_records"

    id = Column(Integer, primary_key=True, index=True)
    parcel_id = Column(String(80), ForeignKey("parcels.parcel_id"), nullable=False, index=True)
    clearance_type = Column(String(100), default="Forest Stage-II Approval")
    authority = Column(String(150), default="MoEFCC / Parivesh Portal")
    is_forest_land = Column(Boolean, default=False)
    duration_days = Column(Integer, default=45)
    is_resolved = Column(Boolean, default=False)  # Event flag (1 = resolved, 0 = right-censored)
    risk_hazard_score = Column(Float, default=1.0)
    created_at = Column(DateTime, default=datetime.utcnow)

    parcel = relationship("Parcel", back_populates="clearance_records")

