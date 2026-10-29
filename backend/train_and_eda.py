"""
Orchestrator script for Dataset Loading, EDA, Monotonic ML Training, and Report Figure Generation.
"""
import json
import joblib
from data_loader import ARTIFACTS_DIR, load_or_fetch_dataset
from eda import compute_eda
from figures import generate_report_figures
from model_pipeline import train_and_evaluate_models
from schema import FEATURE_META


def main():
    ARTIFACTS_DIR.mkdir(parents=True, exist_ok=True)
    X, y, uci_meta = load_or_fetch_dataset()
    eda = compute_eda(X, y)

    # CholCheck ("cholesterol check in past 5 years") is a healthcare-access proxy, not a
    # causal risk factor: its raw association is confounded by screening behaviour (only
    # ~9.5k records have CholCheck=0). Excluded from training so it can never be presented
    # as a risk driver. It remains in FEATURE_META / PatientIndicators / CLINICAL_PRESETS for
    # API backward compatibility; explainability iterates `feature_order`, so it is ignored.
    model_X = X.drop(columns=["CholCheck"])

    trained_models, ml_summary = train_and_evaluate_models(model_X, y)
    generate_report_figures(eda, ml_summary)

    joblib.dump(
        {
            "primary_model": trained_models["HistGradientBoosting"][0],
            "logistic_model": trained_models["LogisticRegression"][0],
            "feature_order": list(model_X.columns),
            "feature_meta": FEATURE_META,
            "feature_importances": ml_summary["feature_importances"],
        },
        ARTIFACTS_DIR / "diabetes_model_bundle.joblib",
    )

    dashboard_payload = {
        "uci_metadata": uci_meta,
        "feature_metadata": FEATURE_META,
        "eda": eda,
        "ml_evaluation": ml_summary,
    }
    with open(ARTIFACTS_DIR / "dashboard_metadata.json", "w", encoding="utf-8") as f:
        json.dump(dashboard_payload, f, indent=2)

    print(
        f"[TRAIN DONE] Primary Monotonic HistGBM ROC-AUC: "
        f"{ml_summary['models']['HistGradientBoosting']['standard_threshold_050']['roc_auc']:.4f}"
    )


if __name__ == "__main__":
    main()
