"""
Seed data generator script for Land Acquisition Intelligence Platform.
Generates domain-authentic datasets adhering to:
- NH Act 1956 (Sections 3A, 3D, 3G, 3E, 3H)
- RFCTLARR Act 2013
- UP Bhulekh / Bhoomi Rashi revenue format

Outputs:
- data/parcels.json (and parcels_200.json)
- data/corridor.geojson (and corridor_25.geojson)
"""

import os
import json
from pathlib import Path
from mock_data import generate_synthetic_dataset, generate_corridor_geojson

def main():
    output_dir = Path(__file__).resolve().parent / "data"
    output_dir.mkdir(parents=True, exist_ok=True)

    print("Generating 220 statutory land acquisition records with authentic legal mechanics...")
    records = generate_synthetic_dataset(num_records=220, seed=42)

    # Save to both parcels.json and parcels_200.json for compatibility
    for filename in ["parcels.json", "parcels_200.json"]:
        records_file = output_dir / filename
        with open(records_file, "w", encoding="utf-8") as f:
            json.dump(records, f, indent=2)
        print(f"Saved {len(records)} records to {records_file}")

    print("Generating 25-parcel contiguous GeoJSON right-of-way corridor...")
    corridor_geojson = generate_corridor_geojson(records, count=25)

    for filename in ["corridor.geojson", "corridor_25.geojson"]:
        geojson_file = output_dir / filename
        with open(geojson_file, "w", encoding="utf-8") as f:
            json.dump(corridor_geojson, f, indent=2)
        print(f"Saved GeoJSON corridor to {geojson_file}")

if __name__ == "__main__":
    main()
