"""
FastAPI Backend for CDC Diabetes Health Indicators Risk Prediction & Explainability Dashboard.
Modular architecture: routes delegate to schema.py, explainability.py, and model_pipeline.py.
"""
import json
from contextlib import asynccontextmanager
import joblib
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from data_loader import ARTIFACTS_DIR
from explainability import run_patient_inference
from schema import CLINICAL_PRESETS, PatientIndicators
from train_and_eda import main as build_artifacts

STATE: dict = {}


def ensure_artifacts_loaded() -> None:
    bundle_path = ARTIFACTS_DIR / "diabetes_model_bundle.joblib"
    meta_path = ARTIFACTS_DIR / "dashboard_metadata.json"
    if not bundle_path.exists() or not meta_path.exists():
        build_artifacts()

    STATE["bundle"] = joblib.load(bundle_path)
    with open(meta_path, "r", encoding="utf-8") as f:
        STATE["metadata"] = json.load(f)


@asynccontextmanager
async def lifespan(app: FastAPI):
    ensure_artifacts_loaded()
    yield


app = FastAPI(
    title="CDC Diabetes Risk Prediction & Explainability API",
    description="Monotonic Clinical Decision Support Prototype built on UCI CDC Diabetes Health Indicators (ID: 891)",
    version="2.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/api/health")
def get_health():
    if "metadata" not in STATE:
        ensure_artifacts_loaded()
    return {
        "status": "ok",
        "dataset": "CDC Diabetes Health Indicators (UCI ID: 891)",
        "records": STATE["metadata"]["eda"]["total_records"],
        "primary_model": STATE["metadata"]["ml_evaluation"]["primary_model"],
    }


@app.get("/api/metadata")
def get_metadata():
    if "metadata" not in STATE:
        ensure_artifacts_loaded()
    return STATE["metadata"]


@app.get("/api/presets")
def get_presets():
    if "bundle" not in STATE:
        ensure_artifacts_loaded()
    enriched = []
    for preset in CLINICAL_PRESETS:
        ind = PatientIndicators(**preset["indicators"])
        pred = run_patient_inference(ind, STATE["bundle"], STATE["metadata"])
        enriched.append({
            **preset,
            "preview_probability_pct": pred["probability_pct"],
            "preview_risk_tier": pred["risk_tier"],
            "preview_risk_code": pred["risk_code"],
        })
    return {"presets": enriched}


@app.post("/api/predict")
def predict_diabetes_risk(indicators: PatientIndicators):
    if "bundle" not in STATE:
        ensure_artifacts_loaded()
    try:
        return run_patient_inference(indicators, STATE["bundle"], STATE["metadata"])
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc)) from exc
