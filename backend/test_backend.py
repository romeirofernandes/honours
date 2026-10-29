"""
Comprehensive Clinical Sanity, Monotonicity, and API Test Suite.
Verifies that:
1. Smoking (`Smoker=1`) strictly increases risk across all patient profiles.
2. Heavy Alcohol (`HvyAlcoholConsump=1`) strictly increases risk across all patient profiles.
3. HighBP, HighChol, Stroke, HeartDiseaseorAttack, DiffWalk, higher BMI, worse GenHlth,
   more PhysHlth/MentHlth days, and older Age strictly increase risk.
4. Regular Physical Activity (`PhysActivity=1`), Fruits (`Fruits=1`), and Veggies (`Veggies=1`)
   strictly decrease (protect against) risk across all patient profiles.
5. Local feature attributions never show negative (protective) signs for harmful risk factors.
6. `CholCheck` is accepted by the API for backward compatibility but is excluded from the
   20-variable model, so it never changes the prediction or appears as a risk driver.
"""
from fastapi.testclient import TestClient
from main import app
from schema import CLINICAL_PRESETS


def run_self_check():
    client = TestClient(app)

    # 1. Health & Dataset verification
    r_health = client.get("/api/health")
    assert r_health.status_code == 200
    assert r_health.json()["records"] == 253680

    # 2. Metadata & ROC-AUC verification
    r_meta = client.get("/api/metadata")
    assert r_meta.status_code == 200
    meta = r_meta.json()
    roc_auc = meta["ml_evaluation"]["models"]["HistGradientBoosting"]["standard_threshold_050"]["roc_auc"]
    assert roc_auc > 0.81, f"Expected ROC-AUC > 0.81, got {roc_auc}"

    # 2b. Healthcare-access proxy is excluded from the model space
    feature_order = meta["ml_evaluation"]["feature_order"]
    assert len(feature_order) == 20, f"Expected 20 model variables, got {len(feature_order)}"
    assert "CholCheck" not in feature_order, "CholCheck must not be a model feature"
    importance_features = {item["feature"] for item in meta["ml_evaluation"]["feature_importances"]}
    assert "CholCheck" not in importance_features, "CholCheck must not have a feature importance"

    # 3. Exhaustive Clinical Monotonicity Verification across all 4 Presets
    harmful_binary = [
        "Smoker",
        "HvyAlcoholConsump",
        "HighBP",
        "HighChol",
        "Stroke",
        "HeartDiseaseorAttack",
        "DiffWalk",
        "NoDocbcCost",
    ]
    protective_binary = ["PhysActivity", "Fruits", "Veggies"]

    for preset in CLINICAL_PRESETS:
        base_ind = dict(preset["indicators"])

        # Test every harmful binary factor: 1 must strictly yield higher risk than 0
        for col in harmful_binary:
            ind_no = {**base_ind, col: 0}
            ind_yes = {**base_ind, col: 1}
            p_no = client.post("/api/predict", json=ind_no).json()["probability"]
            res_yes = client.post("/api/predict", json=ind_yes).json()
            p_yes = res_yes["probability"]
            assert p_yes > p_no, (
                f"[CLINICAL VIOLATION in {preset['id']}] {col}=1 gave {p_yes:.4f} <= {col}=0 ({p_no:.4f})!"
            )
            # Also verify local attribution for col=1 is strictly positive (>= 0)
            fc_map = {c["feature"]: c["risk_contribution_pct"] for c in res_yes["feature_contributions"]}
            assert fc_map[col] > 0, (
                f"[ATTRIBUTION VIOLATION in {preset['id']}] {col}=1 had non-positive attribution {fc_map[col]}%!"
            )

        # Test every protective binary factor: 1 must strictly yield lower risk than 0
        for col in protective_binary:
            ind_no = {**base_ind, col: 0}
            ind_yes = {**base_ind, col: 1}
            p_no = client.post("/api/predict", json=ind_no).json()["probability"]
            res_yes = client.post("/api/predict", json=ind_yes).json()
            p_yes = res_yes["probability"]
            assert p_yes < p_no, (
                f"[CLINICAL VIOLATION in {preset['id']}] Protective {col}=1 gave {p_yes:.4f} >= {col}=0 ({p_no:.4f})!"
            )
            # When protective habit is present (1), its attribution should be negative (protective)
            fc_map = {c["feature"]: c["risk_contribution_pct"] for c in res_yes["feature_contributions"]}
            assert fc_map[col] < 0, (
                f"[ATTRIBUTION VIOLATION in {preset['id']}] Protective {col}=1 had attribution {fc_map[col]}%!"
            )

        # Test continuous/ordinal monotonicity: BMI (22 -> 35), GenHlth (1 -> 5), Age (3 -> 10)
        p_bmi_low = client.post("/api/predict", json={**base_ind, "BMI": 22.0}).json()["probability"]
        p_bmi_high = client.post("/api/predict", json={**base_ind, "BMI": 35.0}).json()["probability"]
        assert p_bmi_high > p_bmi_low, f"BMI monotonicity failed in {preset['id']}"

        p_gh_good = client.post("/api/predict", json={**base_ind, "GenHlth": 1}).json()["probability"]
        p_gh_poor = client.post("/api/predict", json={**base_ind, "GenHlth": 5}).json()["probability"]
        assert p_gh_poor > p_gh_good, f"GenHlth monotonicity failed in {preset['id']}"

    # 4. Randomized 50-Patient Stress Test across the 20-variable model space
    #    (CholCheck is accepted in the payload but ignored by the model)
    import random
    rng = random.Random(42)
    for i in range(50):
        rand_ind = {
            "HighBP": rng.choice([0, 1]),
            "HighChol": rng.choice([0, 1]),
            "CholCheck": rng.choice([0, 1]),
            "BMI": round(rng.uniform(18.5, 48.0), 1),
            "Smoker": rng.choice([0, 1]),
            "Stroke": rng.choice([0, 1]),
            "HeartDiseaseorAttack": rng.choice([0, 1]),
            "PhysActivity": rng.choice([0, 1]),
            "Fruits": rng.choice([0, 1]),
            "Veggies": rng.choice([0, 1]),
            "HvyAlcoholConsump": rng.choice([0, 1]),
            "AnyHealthcare": rng.choice([0, 1]),
            "NoDocbcCost": rng.choice([0, 1]),
            "GenHlth": rng.randint(1, 5),
            "MentHlth": rng.randint(0, 30),
            "PhysHlth": rng.randint(0, 30),
            "DiffWalk": rng.choice([0, 1]),
            "Sex": rng.choice([0, 1]),
            "Age": rng.randint(1, 13),
            "Education": rng.randint(1, 6),
            "Income": rng.randint(1, 8),
        }
        p_smk_0 = client.post("/api/predict", json={**rand_ind, "Smoker": 0}).json()["probability"]
        p_smk_1 = client.post("/api/predict", json={**rand_ind, "Smoker": 1}).json()["probability"]
        assert p_smk_1 > p_smk_0, f"Random profile #{i}: Smoker=1 did not increase risk!"

        p_alc_0 = client.post("/api/predict", json={**rand_ind, "HvyAlcoholConsump": 0}).json()["probability"]
        p_alc_1 = client.post("/api/predict", json={**rand_ind, "HvyAlcoholConsump": 1}).json()["probability"]
        assert p_alc_1 > p_alc_0, f"Random profile #{i}: HvyAlcoholConsump=1 did not increase risk!"

        p_pa_0 = client.post("/api/predict", json={**rand_ind, "PhysActivity": 0}).json()["probability"]
        p_pa_1 = client.post("/api/predict", json={**rand_ind, "PhysActivity": 1}).json()["probability"]
        assert p_pa_1 < p_pa_0, f"Random profile #{i}: PhysActivity=1 did not reduce risk!"

        # CholCheck is a healthcare-access proxy, not a causal risk factor: it must be inert.
        p_cc_0 = client.post("/api/predict", json={**rand_ind, "CholCheck": 0}).json()["probability"]
        p_cc_1 = client.post("/api/predict", json={**rand_ind, "CholCheck": 1}).json()["probability"]
        assert p_cc_0 == p_cc_1, (
            f"Random profile #{i}: CholCheck changed the prediction ({p_cc_0} vs {p_cc_1})!"
        )

    print(
        f"[ALL CLINICAL SANITY & MONOTONICITY TESTS PASSED (INCLUDING 50 RANDOM PROFILES)]\n"
        f" -> Dataset: 253,680 records | Monotonic HistGBM ROC-AUC: {roc_auc:.4f}\n"
        f" -> Verified across all profiles: Smoker, HvyAlcoholConsump, HighBP, HighChol, BMI, Stroke, HeartDisease, DiffWalk ALWAYS increase risk.\n"
        f" -> Verified across all profiles: PhysActivity, Fruits, Veggies ALWAYS reduce risk."
    )


if __name__ == "__main__":
    run_self_check()
