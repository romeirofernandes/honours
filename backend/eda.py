"""
Exploratory Data Analysis (EDA) module for CDC Diabetes Health Indicators (N = 253,680).
"""
import pandas as pd
from schema import FEATURE_META, AGE_LABELS, GENHLTH_LABELS, INCOME_LABELS


def compute_eda(X: pd.DataFrame, y: pd.Series) -> dict:
    df = X.copy()
    df["Diabetes_binary"] = y
    total = len(df)
    pos_count = int(y.sum())
    neg_count = int(total - pos_count)

    feature_stats = []
    for col in X.columns:
        series = df[col]
        corr = float(series.corr(y))
        meta = FEATURE_META.get(col, {})
        feature_stats.append({
            "feature": col,
            "label": meta.get("label", col),
            "category": meta.get("category", "Clinical"),
            "type": meta.get("type", "numeric"),
            "unit": meta.get("unit", ""),
            "modifiable": meta.get("modifiable", False),
            "healthy_ref": meta.get("healthy_ref", 0),
            "monotonic_cst": meta.get("monotonic_cst", 0),
            "description": meta.get("description", ""),
            "mean": round(float(series.mean()), 4),
            "std": round(float(series.std()), 4),
            "min": float(series.min()),
            "median": float(series.median()),
            "max": float(series.max()),
            "mean_no_diabetes": round(float(df.loc[y == 0, col].mean()), 4),
            "mean_diabetes": round(float(df.loc[y == 1, col].mean()), 4),
            "correlation": round(corr, 4),
        })

    feature_stats_sorted = sorted(
        feature_stats, key=lambda item: abs(item["correlation"]), reverse=True
    )

    age_breakdown = []
    for age_code in range(1, 14):
        sub = df[df["Age"] == age_code]
        count = len(sub)
        diab = int(sub["Diabetes_binary"].sum())
        age_breakdown.append({
            "age_code": age_code,
            "age_group": AGE_LABELS[age_code],
            "total": count,
            "diabetes_cases": diab,
            "prevalence_pct": round((diab / count * 100) if count else 0.0, 2),
        })

    bmi_bins = [
        ("Underweight (<18.5)", df["BMI"] < 18.5),
        ("Normal (18.5-24.9)", (df["BMI"] >= 18.5) & (df["BMI"] < 25)),
        ("Overweight (25-29.9)", (df["BMI"] >= 25) & (df["BMI"] < 30)),
        ("Obese I (30-34.9)", (df["BMI"] >= 30) & (df["BMI"] < 35)),
        ("Obese II (35-39.9)", (df["BMI"] >= 35) & (df["BMI"] < 40)),
        ("Obese III (>=40)", df["BMI"] >= 40),
    ]
    bmi_breakdown = []
    for label, mask in bmi_bins:
        sub = df[mask]
        count = len(sub)
        diab = int(sub["Diabetes_binary"].sum())
        bmi_breakdown.append({
            "category": label,
            "total": count,
            "share_pct": round(count / total * 100, 2),
            "diabetes_cases": diab,
            "prevalence_pct": round((diab / count * 100) if count else 0.0, 2),
        })

    genhlth_breakdown = []
    for code in range(1, 6):
        sub = df[df["GenHlth"] == code]
        count = len(sub)
        diab = int(sub["Diabetes_binary"].sum())
        genhlth_breakdown.append({
            "code": code,
            "label": GENHLTH_LABELS[code],
            "total": count,
            "diabetes_cases": diab,
            "prevalence_pct": round((diab / count * 100) if count else 0.0, 2),
        })

    binary_risk_comparison = []
    for col in [
        "HighBP", "HighChol", "HeartDiseaseorAttack", "DiffWalk", "Stroke",
        "PhysActivity", "Smoker", "Fruits", "Veggies", "HvyAlcoholConsump",
    ]:
        sub_yes = df[df[col] == 1]
        sub_no = df[df[col] == 0]
        prev_yes = float(sub_yes["Diabetes_binary"].mean() * 100)
        prev_no = float(sub_no["Diabetes_binary"].mean() * 100)
        binary_risk_comparison.append({
            "feature": col,
            "label": FEATURE_META[col]["label"],
            "prevalence_when_present_pct": round(prev_yes, 2),
            "prevalence_when_absent_pct": round(prev_no, 2),
            "relative_risk_ratio": round(prev_yes / max(prev_no, 0.01), 2),
            "population_rate_pct": round(float(df[col].mean() * 100), 2),
        })

    income_breakdown = []
    for code in range(1, 9):
        sub = df[df["Income"] == code]
        count = len(sub)
        diab = int(sub["Diabetes_binary"].sum())
        income_breakdown.append({
            "code": code,
            "label": INCOME_LABELS[code],
            "total": count,
            "prevalence_pct": round((diab / count * 100) if count else 0.0, 2),
        })

    return {
        "total_records": total,
        "num_features": int(X.shape[1]),
        "missing_values": int(df.isna().sum().sum()),
        "duplicate_rows": int(df.duplicated().sum()),
        "class_distribution": {
            "no_diabetes_count": neg_count,
            "no_diabetes_pct": round(neg_count / total * 100, 2),
            "diabetes_or_prediabetes_count": pos_count,
            "diabetes_or_prediabetes_pct": round(pos_count / total * 100, 2),
            "imbalance_ratio": round(neg_count / max(pos_count, 1), 2),
        },
        "feature_stats": feature_stats_sorted,
        "age_breakdown": age_breakdown,
        "bmi_breakdown": bmi_breakdown,
        "genhlth_breakdown": genhlth_breakdown,
        "binary_risk_comparison": binary_risk_comparison,
        "income_breakdown": income_breakdown,
    }
