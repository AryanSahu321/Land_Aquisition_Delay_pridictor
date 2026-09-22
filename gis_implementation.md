# Production GIS Implementation Architecture (Point 7)

## High-Risk Infrastructure Corridor & Cadastral Mapping System

This document outlines the complete, production-grade architectural specification for **Point 7 (GIS-enabled visualization of high-risk projects on digital maps)**. This specification details how to move beyond static prototypes into a scalable, high-throughput geospatial engine integrated with the ML delay prediction pipeline.

---

## 1. High-Level Architecture Overview

The production system decouples geospatial calculations from ML predictive modeling, uniting them through standardized **RFC 7946 GeoJSON** payloads:

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                                   EXTERNAL DATA SOURCES                                │
│   • PM GatiShakti (Centerline GPS)      • State BhuNaksha / Bhulekh (Khasra Polygons)  │
│   • BhoomiRashi (Sec 3D Gazette Tables) • e-Courts NJDG (Court Injunctions)            │
└───────────────────────────────────────────┬────────────────────────────────────────────┘
                                            │
                                            ▼
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                   BACKEND GEOSPATIAL & ML PIPELINE (FastAPI + GeoPandas)               │
│                                                                                        │
│   [1. Highway Alignment] ───► [2. 120m RoW Metric Buffer] ───► [3. Cadastral Join]     │
│       (LineString EPSG:4326)      (PyProj UTM Projection)          (Spatial Intersect)  │
│                                                                        │               │
│   [4. Feature Assembly] ────► [5. ML Ensemble Predictor] ──────────────┘               │
│       (Statutes, Funds, DFO)      (XGBoost + TreeSHAP + Kaplan-Meier)                  │
│                                            │                                           │
│                                            ▼                                           │
│   [6. Production GeoJSON FeatureCollection with Analytical Properties Payload]         │
└───────────────────────────────────────────┬────────────────────────────────────────────┘
                                            │ REST API: /api/project/{id}/corridor-gis
                                            ▼
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                   FRONTEND MULTI-SCALE GIS VIEWER (React + Leaflet / MapLibre)         │
│                                                                                        │
│   • Layer 1 (Macro Zoom 6-10)  : Corridor Spine + Dynamic Hotspot Clusters (🔴/🟡/🟢)   │
│   • Layer 2 (Package Zoom 11-13): Milestone Interchanges + District Boundaries         │
│   • Layer 3 (Micro Zoom 14-19)  : True 120m Khasra Parcels + Satellite Ortho-overlay   │
│   • Interactive Inspector Drawer: Live Revenue, Khatedar, PFMS Escrow, and AI Delay    │
└────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Technical Stack Specification

| Component                  | Production Technology                              | Justification                                                                                |
| :------------------------- | :------------------------------------------------- | :------------------------------------------------------------------------------------------- |
| **Frontend Map Rendering** | `Leaflet` + `React-Leaflet` / `MapLibre GL`        | Lightweight, open-source, zero API-key dependencies, hardware-accelerated WebGL.             |
| **Geospatial Processing**  | `GeoPandas`, `Shapely`, `PyProj`                   | Industry standard for vector buffering, coordinate reprojections, and polygon intersections. |
| **Spatial Database**       | `PostgreSQL` + `PostGIS`                           | Spatial indexing (R-Tree `GIST`), spatial joins (`ST_Intersects`), and bounding box queries. |
| **Tile Providers**         | OpenStreetMap (Vector/Raster) + ESRI World Imagery | High-resolution, zero watermark, reliable CDN uptime.                                        |
| **API Transport**          | `FastAPI` (Streaming GeoJSON)                      | Async, ultra-fast JSON serialization with spatial GeoJSON schemas.                           |

---

## 3. Step-by-Step Data Engineering Pipeline

### Step 3.1: Alignment Ingestion & Metric Reprojection

Highway alignments are ingested as **WGS84 LineStrings** (`EPSG:4326`). However, geographic coordinates (degrees) cannot be buffered in meters directly due to longitudinal convergence away from the equator.

- **Metric Reprojection**:
  1. Determine the appropriate UTM Zone for the corridor (e.g., UTM Zone 44N, `EPSG:32644` for Uttar Pradesh / Purvanchal).
  2. Project alignment from `EPSG:4326` to `EPSG:32644`.
  3. Execute bilateral metric buffering:

     ```python
     import geopandas as gpd
     from shapely.geometry import LineString

     def generate_corridor_row(alignment_coords, row_width_meters=120):
         # 1. Create LineString in geographic coords
         line_geom = LineString(alignment_coords)
         gdf = gpd.GeoDataFrame(geometry=[line_geom], crs="EPSG:4326")

         # 2. Reproject to local UTM metric CRS (UTM 44N)
         gdf_utm = gdf.to_crs("EPSG:32644")

         # 3. Buffer by half-width (60m each side for 120m total RoW)
         row_buffer_utm = gdf_utm.buffer(row_width_meters / 2.0, cap_style=2) # flat caps

         # 4. Reproject back to WGS84 for GeoJSON web delivery
         row_buffer_wgs84 = row_buffer_utm.to_crs("EPSG:4326")
         return row_buffer_wgs84.iloc[0]
     ```

### Step 3.2: Cadastral Khasra Integration & Spatial Clipping

Cadastral parcel polygons obtained from State BhuNaksha shapefiles or reconstructed from Section 3D Gazette schedules are spatially clipped against the 120m RoW corridor polygon:

```sql
-- PostGIS Spatial Intersection Query
SELECT
    k.khasra_no,
    k.village_name,
    k.tehsil_name,
    k.district_name,
    k.khatedar_name,
    k.area_hectares,
    ST_Intersection(k.geom, c.row_buffer) AS geom
FROM cadastral_parcels k
JOIN expressway_corridors c ON ST_Intersects(k.geom, c.row_buffer)
WHERE c.project_id = 'PURVANCHAL-EXP-01';
```

---

## 4. ML Predictive Integration Pipeline

Each parcel feature in the GIS layer is joined with our ML inference engine output.

### 4.1 Feature Construction per Parcel:

- `disbursed_pct`: Current PFMS compensation disbursed to Khatedar (0–100%).
- `court_stay_active`: Boolean flag from e-Courts NJDG (1 = Injunction active, 0 = Clear).
- `forest_clearance_stage`: Categorical (Stage-1, Stage-2, Non-forest, Pending DFO).
- `arbitration_3g5_filed`: Boolean (Landowner arbitration under Section 3G(5) of NH Act).
- `mutation_disputed`: Boolean (Title dispute or succession partition pending in Tehsil).

### 4.2 GeoJSON Feature Schema

The backend returns a standardized GeoJSON `FeatureCollection` where each parcel includes an `analytical_payload`:

```json
{
  "type": "Feature",
  "id": "PKG-06-PAR-601",
  "geometry": {
    "type": "Polygon",
    "coordinates": [[[82.979, 26.081], [82.981, 26.079], ...]]
  },
  "properties": {
    "khasra": "Khasra #428/B",
    "village": "Phoolpur Pawai",
    "district": "Azamgarh",
    "package": "Package 6 (km 218 to km 246)",
    "chainage": "km 226+600",
    "khatedar": "Ram Naresh Singh & 12 Heirs",
    "area_ha": 3.40,
    "disbursed_pct": 25.0,
    "amount_locked": "₹1.15 Crore",
    "court_stay": "Stay Order: Fruit-Bearing Tree Valuation Dispute",
    "statutory_stage": "Escrow Deposited in Azamgarh District Court",
    "ml_prediction": {
      "delay_probability": 0.94,
      "predicted_delay_days": 95,
      "risk_grade": "CRITICAL",
      "color_hex": "#ef4444",
      "top_shap_driver": "court_stay_injunction"
    }
  }
}
```

---

## 5. Multi-Scale Map Rendering Strategy

To provide an optimal user experience for executive reviewers and field officers alike, the map implements a **3-tier zoom architecture**:

```
Macro Zoom (Zoom 6–10)     ──►  Cluster Markers & Hotspot Halos (🔴/🟡/🟢)
Package Zoom (Zoom 11–13)  ──►  Package Stretches, Mile Markers, Major Interchanges
Cadastral Zoom (Zoom 14–19) ──►  Surveyed 120m Khasra Polygons + High-Res Satellite View
```

### Scale 1: Macro View (State Level: Zoom 6 to 10)

- **Visual Problem**: When viewing an entire state (e.g., 340 km from Lucknow to Ghazipur), a 120m polygon is smaller than 0.5 screen pixels, making individual plots invisible.
- **Production Solution**:
  1. Render the main alignment centerline with an energetic glowing dash-array.
  2. Render **Hotspot Circle Markers** (`L.circleMarker` or MapLibre GL circle layers) at the centroid of each parcel/cluster.
  3. Dynamic circle sizing:
     - 🔴 **Critical Risk ($P \ge 0.65$)**: Radius 9–11px with glowing pulse halo (`#ef4444`).
     - 🟡 **Moderate Risk ($0.30 \le P < 0.65$)**: Radius 7–8px (`#f59e0b`).
     - 🟢 **Low Risk ($P < 0.30$)**: Radius 6–7px (`#10b981`).
  4. Allows judges and DM/NHAI leadership to immediately identify the cluster of delays (e.g., Azamgarh cluster vs Sultanpur cleared stretch) without searching.

### Scale 2: Package View (Sub-Corridor Level: Zoom 11 to 13)

- Displays EPC Contract package boundaries (Package 1 to Package 8).
- Displays key highway interchanges, river bridge crossings, and airstrips (e.g., Purvanchal Emergency Landing Strip at km 178).

### Scale 3: Cadastral View (Plot Level: Zoom 14 to 19)

- Displays the true **120-metre Right-of-Way boundary polygons** directly hugging the surveyed road curves.
- Supports dual basemaps:
  - **🗺️ Clean Street Map**: For reading village names, canal crossings, and railway intersections.
  - **🛰️ High-Resolution Satellite**: For visually inspecting the physical road carriageway against agricultural fields.
- Clicking any parcel triggers the **Statutory Inspector Panel** with full legal records.

---

## 6. Frontend Component Architecture

### Component Hierarchy (`frontend/src/components/CorridorMap.jsx`):

```
<CorridorMap>
  ├── <MapContainer> (Leaflet instance with auto-bounds controller)
  │     ├── <TileLayer> (Clean OSM or ESRI World Imagery)
  │     ├── <Polyline> (Corridor Centerline Spine)
  │     ├── <MilestoneMarkersLayer> (Interchange pins)
  │     ├── <HotspotCircleMarkersLayer> (Macro-zoom risk circles)
  │     └── <CadastralPolygonsLayer> (Micro-zoom 120m RoW strips)
  │
  ├── <CorridorControlsOverlay>
  │     ├── <RiskFilterTabs> (All / Critical / Moderate / Cleared)
  │     ├── <BasemapSwitcher> (Satellite vs Clean Map)
  │     └── <FitFullCorridorButton> (Auto-fits entire km span)
  │
  └── <StatutoryInspectorDrawer> (Slide-out panel for selected parcel)
        ├── Khatedar Title & Succession Status
        ├── Statutory Acquisition Section (3A/3D/3G/3H)
        ├── PFMS Compensation & Escrow Lock Amount
        └── ML Delay Prediction & Recommended Action SOP
```

---

## 7. Performance & Optimization Guidelines

1. **Geometry Simplification for Macro Zooms**:
   - For corridors exceeding 300 km (thousands of coordinate vertices), apply the **Douglas-Peucker algorithm** (`ST_Simplify(geom, 0.0005)`) at lower zoom levels to reduce GeoJSON payload size by over $80\%$.
2. **Spatial Indexing & Viewport Caching**:
   - Implement spatial R-Tree bounding-box queries (`map.getBounds()`).
   - If a project contains $20,000+$ Khasra records, only stream parcel geometries that intersect the active map viewport (`bbox=minLon,minLat,maxLon,maxLat`).
3. **Hardware Acceleration**:
   - For national-scale deployments with hundreds of concurrent projects, use **MapLibre GL / Deck.gl** vector tile rendering (MVT) utilizing WebGL shaders for rendering 50,000+ parcels at 60 FPS.
