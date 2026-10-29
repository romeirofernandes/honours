"""
UCI Dataset Loader & Local Cache Manager for CDC Diabetes Health Indicators (ID: 891).
"""
import io
import json
import zipfile
from pathlib import Path
import httpx
import pandas as pd
from ucimlrepo import fetch_ucirepo

BASE_DIR = Path(__file__).resolve().parent
DATA_DIR = BASE_DIR / "data"
ARTIFACTS_DIR = BASE_DIR / "artifacts"
FIGURES_DIR = BASE_DIR.parent / "docs" / "figures"


def load_or_fetch_dataset() -> tuple[pd.DataFrame, pd.Series, dict]:
    DATA_DIR.mkdir(parents=True, exist_ok=True)
    csv_path = DATA_DIR / "cdc_diabetes_health_indicators.csv"
    meta_path = DATA_DIR / "uci_metadata.json"

    # ponytail: cache raw UCI dataset to CSV on first fetch so re-runs take 0.3s instead of network I/O
    if csv_path.exists() and meta_path.exists():
        df = pd.read_csv(csv_path)
        with open(meta_path, "r", encoding="utf-8") as f:
            uci_meta = json.load(f)
        target_col = "Diabetes_binary"
        X = df.drop(columns=[target_col])
        y = df[target_col].astype(int)
        return X, y, uci_meta

    uci_meta = {
        "uci_id": 891,
        "name": "CDC Diabetes Health Indicators",
        "abstract": "The Diabetes Health Indicators Dataset contains healthcare statistics and lifestyle survey information about 253,680 adults along with their diagnosis of diabetes or prediabetes.",
        "num_instances": 253680,
        "num_features": 21,
        "repository_url": "https://archive.ics.uci.edu/dataset/891/cdc+diabetes+health+indicators",
    }

    X, y = None, None
    try:
        cdc = fetch_ucirepo(id=891)
        X = cdc.data.features.copy()
        y = cdc.data.targets.iloc[:, 0].astype(int).rename("Diabetes_binary")
    except Exception:
        zip_url = "https://archive.ics.uci.edu/static/public/891/cdc+diabetes+health+indicators.zip"
        with httpx.Client(timeout=120.0, follow_redirects=True) as client:
            resp = client.get(zip_url)
            resp.raise_for_status()
            with zipfile.ZipFile(io.BytesIO(resp.content)) as zf:
                csv_names = [n for n in zf.namelist() if n.endswith(".csv")]
                raw_df = pd.read_csv(zf.open(csv_names[0]))
                if "ID" in raw_df.columns:
                    raw_df = raw_df.drop(columns=["ID"])
                y = raw_df["Diabetes_binary"].astype(int).rename("Diabetes_binary")
                X = raw_df.drop(columns=["Diabetes_binary"])

    full_df = X.copy()
    full_df["Diabetes_binary"] = y
    full_df.to_csv(csv_path, index=False)
    with open(meta_path, "w", encoding="utf-8") as f:
        json.dump(uci_meta, f, indent=2)

    return X, y, uci_meta
