"""
Report Figure Generation Module for CDC Diabetes Health Indicators.
"""
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
from data_loader import FIGURES_DIR


def generate_report_figures(eda: dict, ml_summary: dict) -> None:
    FIGURES_DIR.mkdir(parents=True, exist_ok=True)
    plt.rcParams["font.family"] = "serif"
    plt.rcParams["font.size"] = 10

    # Figure 1: Class Distribution & General Health Prevalence
    fig, axes = plt.subplots(1, 2, figsize=(11, 4.5), dpi=220)
    cd = eda["class_distribution"]
    bars = axes[0].bar(
        ["No Diabetes (0)", "Prediabetes / Diabetes (1)"],
        [cd["no_diabetes_count"], cd["diabetes_or_prediabetes_count"]],
        color=["#0F766E", "#B45309"],
        edgecolor="#0F172A",
        width=0.55,
    )
    axes[0].set_title("A. CDC BRFSS Target Class Distribution (N = 253,680)", fontweight="bold")
    axes[0].set_ylabel("Number of Respondents")
    axes[0].grid(axis="y", linestyle="--", alpha=0.4)
    for bar, pct in zip(bars, [cd["no_diabetes_pct"], cd["diabetes_or_prediabetes_pct"]]):
        h = bar.get_height()
        axes[0].text(
            bar.get_x() + bar.get_width() / 2,
            h + 3500,
            f"{h:,}\n({pct}%)",
            ha="center",
            va="bottom",
            fontsize=9,
            fontweight="bold",
        )
    axes[0].set_ylim(0, 255000)

    gh_labels = [g["label"] for g in eda["genhlth_breakdown"]]
    gh_prev = [g["prevalence_pct"] for g in eda["genhlth_breakdown"]]
    bars2 = axes[1].bar(
        gh_labels,
        gh_prev,
        color=["#15803D", "#0F766E", "#D97706", "#B45309", "#B91C1C"],
        edgecolor="#0F172A",
        width=0.6,
    )
    axes[1].set_title("B. Diabetes Prevalence by Self-Reported General Health", fontweight="bold")
    axes[1].set_ylabel("Diabetes Prevalence (%)")
    axes[1].grid(axis="y", linestyle="--", alpha=0.4)
    for bar in bars2:
        h = bar.get_height()
        axes[1].text(bar.get_x() + bar.get_width() / 2, h + 0.8, f"{h:.1f}%", ha="center", fontsize=9)
    axes[1].set_ylim(0, 42)

    plt.tight_layout()
    plt.savefig(FIGURES_DIR / "fig1_class_and_genhlth.png", bbox_inches="tight")
    plt.close(fig)

    # Figure 2: Age & BMI Category Prevalence
    fig, axes = plt.subplots(1, 2, figsize=(11.5, 4.5), dpi=220)
    age_groups = [a["age_group"] for a in eda["age_breakdown"]]
    age_prev = [a["prevalence_pct"] for a in eda["age_breakdown"]]
    axes[0].plot(age_groups, age_prev, marker="o", linewidth=2.2, color="#0F766E", markersize=6)
    axes[0].fill_between(range(len(age_groups)), age_prev, color="#0F766E", alpha=0.12)
    axes[0].set_title("A. Diabetes Prevalence Across 13 BRFSS Age Tiers", fontweight="bold")
    axes[0].set_ylabel("Prevalence (%)")
    axes[0].set_xlabel("Age Group (Years)")
    axes[0].tick_params(axis="x", rotation=40)
    axes[0].grid(True, linestyle="--", alpha=0.4)

    bmi_cats = [b["category"].split(" (")[0] for b in eda["bmi_breakdown"]]
    bmi_prev = [b["prevalence_pct"] for b in eda["bmi_breakdown"]]
    bars_bmi = axes[1].bar(bmi_cats, bmi_prev, color="#1E293B", edgecolor="#0F172A", width=0.58)
    axes[1].set_title("B. Diabetes Prevalence Across Clinical BMI Tiers", fontweight="bold")
    axes[1].set_ylabel("Prevalence (%)")
    axes[1].tick_params(axis="x", rotation=25)
    axes[1].grid(axis="y", linestyle="--", alpha=0.4)
    for bar in bars_bmi:
        h = bar.get_height()
        axes[1].text(bar.get_x() + bar.get_width() / 2, h + 0.7, f"{h:.1f}%", ha="center", fontsize=8.5)
    axes[1].set_ylim(0, 38)

    plt.tight_layout()
    plt.savefig(FIGURES_DIR / "fig2_age_and_bmi.png", bbox_inches="tight")
    plt.close(fig)

    # Figure 3: Feature Importance & Correlations
    fig, axes = plt.subplots(1, 2, figsize=(11.5, 5.2), dpi=220)
    top_fi = ml_summary["feature_importances"][:12][::-1]
    axes[0].barh(
        [f["label"] for f in top_fi],
        [f["importance_share_pct"] for f in top_fi],
        color="#0F766E",
        edgecolor="#0F172A",
    )
    axes[0].set_title("A. Top 12 Features by Permutation Importance (%)", fontweight="bold")
    axes[0].set_xlabel("Share of Total ROC-AUC Attribution (%)")
    axes[0].grid(axis="x", linestyle="--", alpha=0.4)

    corrs = eda["feature_stats"][:12][::-1]
    colors_corr = ["#B91C1C" if c["correlation"] > 0 else "#15803D" for c in corrs]
    axes[1].barh(
        [c["label"] for c in corrs],
        [c["correlation"] for c in corrs],
        color=colors_corr,
        edgecolor="#0F172A",
    )
    axes[1].axvline(0, color="#0F172A", linewidth=1)
    axes[1].set_title("B. Top 12 Features by Pearson Correlation with Diabetes", fontweight="bold")
    axes[1].set_xlabel("Correlation Coefficient (r)")
    axes[1].grid(axis="x", linestyle="--", alpha=0.4)

    plt.tight_layout()
    plt.savefig(FIGURES_DIR / "fig3_feature_importance.png", bbox_inches="tight")
    plt.close(fig)

    # Figure 4: ROC & PR Curves
    fig, axes = plt.subplots(1, 2, figsize=(11, 4.5), dpi=220)
    model_colors = {
        "HistGradientBoosting": "#0F766E",
        "LogisticRegression": "#B45309",
        "RandomForest": "#1E293B",
    }
    for m_name, m_data in ml_summary["models"].items():
        std = m_data["standard_threshold_050"]
        roc_pts = std["roc_curve"]
        pr_pts = std["pr_curve"]
        axes[0].plot(
            [p["fpr"] for p in roc_pts],
            [p["tpr"] for p in roc_pts],
            label=f"{m_name} (AUC = {std['roc_auc']:.4f})",
            linewidth=2,
            color=model_colors.get(m_name, "#334155"),
        )
        axes[1].plot(
            [p["recall"] for p in pr_pts],
            [p["precision"] for p in pr_pts],
            label=f"{m_name} (PR-AUC = {std['pr_auc']:.4f})",
            linewidth=2,
            color=model_colors.get(m_name, "#334155"),
        )

    axes[0].plot([0, 1], [0, 1], linestyle="--", color="#94A3B8", label="Random Baseline (0.5000)")
    axes[0].set_title("A. Receiver Operating Characteristic (ROC) Curve", fontweight="bold")
    axes[0].set_xlabel("False Positive Rate (1 - Specificity)")
    axes[0].set_ylabel("True Positive Rate (Sensitivity)")
    axes[0].legend(loc="lower right", fontsize=8.5)
    axes[0].grid(True, linestyle="--", alpha=0.4)

    axes[1].set_title("B. Precision-Recall Curve (Held-out Test N = 50,736)", fontweight="bold")
    axes[1].set_xlabel("Recall (Sensitivity)")
    axes[1].set_ylabel("Precision (Positive Predictive Value)")
    axes[1].legend(loc="upper right", fontsize=8.5)
    axes[1].grid(True, linestyle="--", alpha=0.4)

    plt.tight_layout()
    plt.savefig(FIGURES_DIR / "fig4_roc_and_pr_curves.png", bbox_inches="tight")
    plt.close(fig)
