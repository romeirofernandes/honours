"""
Local Patient-Specific Counterfactual Explainability & What-If Pathway Engine.
"""
from typing import List
import pandas as pd
from schema import FEATURE_META, AGE_LABELS, GENHLTH_LABELS, INCOME_LABELS, PatientIndicators


def classify_risk_tier(prob: float) -> dict:
    pct = prob * 100
    if pct < 20.0:
        return {
            "tier": "Low Risk",
            "code": "low",
            "screening_positive": False,
            "clinical_summary": "Predicted probability is below the 20% preventive threshold. Continue routine annual checkups and healthy lifestyle habits.",
        }
    if pct < 28.0:
        return {
            "tier": "Borderline Watch",
            "code": "moderate",
            "screening_positive": False,
            "clinical_summary": "Moderately elevated above baseline (<20%) and approaching the 28% clinical screening cut-point. Preventive lifestyle optimization advised.",
        }
    if pct < 50.0:
        return {
            "tier": "Elevated Screening Risk",
            "code": "moderate",
            "screening_positive": True,
            "clinical_summary": "Exceeds the 28% F1-optimal screening threshold. Confirmatory HbA1c / fasting plasma glucose test and lifestyle intervention recommended.",
        }
    return {
        "tier": "High Clinical Risk",
        "code": "high",
        "screening_positive": True,
        "clinical_summary": "High predicted probability (>=50%) driven by converging cardiometabolic risk factors. Prompt clinical evaluation (HbA1c, OGTT) recommended.",
    }


def format_feature_value(feature: str, val: float) -> str:
    if feature == "Age":
        return f"{AGE_LABELS.get(int(val), str(val))} yrs"
    if feature == "GenHlth":
        return f"{GENHLTH_LABELS.get(int(val), str(val))} ({int(val)}/5)"
    if feature == "Income":
        return f"{INCOME_LABELS.get(int(val), str(val))}"
    if feature == "Sex":
        return "Male" if int(val) == 1 else "Female"
    if feature == "BMI":
        return f"{val:.1f} kg/m²"
    if feature in ("MentHlth", "PhysHlth"):
        return f"{int(val)} days/mo"
    if FEATURE_META[feature]["type"] == "binary":
        return "Yes" if int(val) == 1 else "No"
    return str(val)


def compute_counterfactual_reference(feature: str, current_val: float) -> tuple[float, bool]:
    """
    Returns (counterfactual_value, is_protective_state) so we can measure both:
    - How much a present risk factor INCREASES risk vs its healthy reference.
    - How much an active healthy habit PROTECTS (reduces risk) vs the unhealthy state.
    """
    if feature in ("HighBP", "HighChol", "Smoker", "Stroke", "HeartDiseaseorAttack", "HvyAlcoholConsump", "NoDocbcCost", "DiffWalk"):
        if int(current_val) == 1:
            return 0, False  # Compare present risk factor (1) vs healthy absence (0)
        return 0, True

    if feature in ("PhysActivity", "Fruits", "Veggies"):
        if int(current_val) == 0:
            return 1, False  # Sedentary/no-veg (0) increases risk vs active/healthy (1)
        return 0, True       # Active/healthy (1) protects vs sedentary/no-veg (0)

    if feature == "BMI":
        if current_val > 24.5:
            return 23.0, False
        return 29.0, True

    if feature == "GenHlth":
        if current_val > 2:
            return 2, False
        return 3, True

    if feature in ("MentHlth", "PhysHlth"):
        if current_val > 0:
            return 0, False
        return 0, True

    if feature == "Age":
        if current_val > 4:
            return 4, False
        return 4, True

    if feature in ("Education", "Income"):
        healthy = FEATURE_META[feature]["healthy_ref"]
        if current_val < healthy:
            return healthy, False
        return healthy, True

    return FEATURE_META[feature]["healthy_ref"], True


def run_patient_inference(indicators: PatientIndicators, bundle: dict, metadata: dict) -> dict:
    primary_model = bundle["primary_model"]
    logistic_model = bundle["logistic_model"]
    feature_order: List[str] = bundle["feature_order"]

    raw_dict = indicators.model_dump()
    base_row = [raw_dict[col] for col in feature_order]

    batch_rows = [base_row]
    cf_protective_flags = []

    for idx, col in enumerate(feature_order):
        ablation = list(base_row)
        cf_val, is_prot = compute_counterfactual_reference(col, base_row[idx])
        ablation[idx] = cf_val
        batch_rows.append(ablation)
        cf_protective_flags.append(is_prot)

    # Row 22: All modifiable clinical & lifestyle risk factors optimized
    optimized_row = list(base_row)
    modifiable_changes = []
    for idx, col in enumerate(feature_order):
        meta = FEATURE_META[col]
        if not meta["modifiable"]:
            continue
        current_val = base_row[idx]
        if col == "BMI" and current_val > 24.5:
            new_bmi = max(23.5, round(current_val - 5.0, 1))
            optimized_row[idx] = new_bmi
            modifiable_changes.append(f"Reduce BMI from {current_val:.1f} to {new_bmi:.1f} kg/m²")
        elif col in ("HighBP", "HighChol", "Smoker", "HvyAlcoholConsump", "DiffWalk") and int(current_val) == 1:
            optimized_row[idx] = 0
            action_verb = "Stop" if col in ("Smoker", "HvyAlcoholConsump") else "Control"
            modifiable_changes.append(f"{action_verb} {meta['label']}")
        elif col in ("PhysActivity", "Fruits", "Veggies") and int(current_val) == 0:
            optimized_row[idx] = 1
            modifiable_changes.append(f"Adopt {meta['label']}")
        elif col == "GenHlth" and current_val > 2:
            optimized_row[idx] = max(2, int(current_val) - 1)
        elif col in ("MentHlth", "PhysHlth") and current_val > 2:
            optimized_row[idx] = 0

    batch_rows.append(optimized_row)

    batch_df = pd.DataFrame(batch_rows, columns=feature_order)
    all_probs = primary_model.predict_proba(batch_df)[:, 1]
    lr_probs = logistic_model.predict_proba(batch_df.iloc[[0, -1]])[:, 1]

    patient_prob = float(all_probs[0])
    optimized_prob = float(all_probs[-1])
    lr_prob = float(lr_probs[0])

    contributions = []
    for idx, col in enumerate(feature_order):
        meta = FEATURE_META[col]
        cf_prob = float(all_probs[idx + 1])
        is_prot = cf_protective_flags[idx]
        raw_diff_pct = (patient_prob - cf_prob) * 100

        if abs(raw_diff_pct) < 0.005:
            delta_pct = 0.0
            direction = "neutral"
        elif not is_prot:
            delta_pct = round(max(0.05, raw_diff_pct), 2)
            direction = "risk_increasing"
        else:
            delta_pct = round(min(-0.05, raw_diff_pct), 2)
            direction = "protective"

        contributions.append({
            "feature": col,
            "label": meta["label"],
            "category": meta["category"],
            "modifiable": meta["modifiable"],
            "patient_value": raw_dict[col],
            "formatted_value": format_feature_value(col, raw_dict[col]),
            "healthy_reference": meta["healthy_ref"],
            "risk_contribution_pct": delta_pct,
            "counterfactual_prob_pct": round(cf_prob * 100, 2),
            "direction": direction,
        })

    contributions_sorted = sorted(
        contributions, key=lambda item: abs(item["risk_contribution_pct"]), reverse=True
    )

    risk_tier_info = classify_risk_tier(patient_prob)
    pop_base = metadata["eda"]["class_distribution"]["diabetes_or_prediabetes_pct"]

    return {
        "probability": round(patient_prob, 6),
        "probability_pct": round(patient_prob * 100, 2),
        "logistic_regression_prob_pct": round(lr_prob * 100, 2),
        "population_baseline_pct": pop_base,
        "relative_to_population": round((patient_prob * 100) / max(pop_base, 0.1), 2),
        "risk_tier": risk_tier_info["tier"],
        "risk_code": risk_tier_info["code"],
        "screening_positive": risk_tier_info["screening_positive"],
        "screening_threshold_pct": 28.0,
        "clinical_summary": risk_tier_info["clinical_summary"],
        "feature_contributions": contributions_sorted,
        "top_risk_drivers": [c for c in contributions_sorted if c["risk_contribution_pct"] > 0.10][:6],
        "top_protective_factors": [c for c in contributions_sorted if c["risk_contribution_pct"] < -0.10][:5],
        "intervention_pathway": {
            "current_risk_pct": round(patient_prob * 100, 2),
            "optimized_risk_pct": round(optimized_prob * 100, 2),
            "absolute_reduction_pct": round(max(0.0, (patient_prob - optimized_prob) * 100), 2),
            "recommended_actions": modifiable_changes[:6] if modifiable_changes else [
                "Maintain current healthy BMI, regular physical activity, and annual checkups."
            ],
        },
    }
