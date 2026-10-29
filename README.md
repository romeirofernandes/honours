# GlycoStrat AI: CDC Diabetes Risk Prediction & Explainability Dashboard

An end-to-end Healthcare AI/ML Clinical Decision Support prototype built on the official **CDC Diabetes Health Indicators Dataset (UCI Machine Learning Repository ID: 891, N = 253,680 patients, 21 survey indicators of which 20 are used by the model)**.

Developed for the **BE Comps Healthcare AI/ML Mini Project** (Suggested Topic 1: *Disease Risk Prediction Dashboard*, mapped to Experiments 1, 2, 6, and 8 and Course Outcomes CO1 to CO6).

---

## Key Highlights & Engineering Architecture

1. **Real UCI Dataset Pipeline (`N = 253,680` records)**:
   - Programmatically fetches and caches the official **CDC BRFSS Diabetes Health Indicators Dataset (`id=891`)** via `ucimlrepo` into `backend/data/cdc_diabetes_health_indicators.csv`.
   - Performs automated Exploratory Data Analysis (EDA) across age brackets, WHO clinical BMI tiers, comorbidity relative risk multipliers, and socioeconomic income gradients.
   - Models **20 of the 21 survey indicators**. `CholCheck` (cholesterol check in the last 5 years) is omitted because it records contact with the health system, not the underlying risk of diabetes. The API still accepts `CholCheck` for backward compatibility, but it is ignored because the model's `feature_order` excludes it.
2. **Multi-Model Training & Clinical Screening Calibration**:
   - Benchmarks **Histogram-Based Gradient Boosted Decision Trees (`HistGradientBoostingClassifier`, Primary Model: ROC-AUC = `0.8201`, PR-AUC = `0.4081`, Brier Score = `0.1006`)**, **Random Forest (`ROC-AUC = 0.8223`, PR-AUC = `0.4179`)**, and **Standardized Logistic Regression (`ROC-AUC = 0.8176`, PR-AUC = `0.3926`)** on a stratified 80/20 split (`202,944` train / `50,736` held-out test records; `7,069` positives and `43,667` negatives).
   - Calibrates a sensitivity-aware **Clinical Screening Cut-Point ($\tau = 0.28$)** to address the `6.18 : 1` class imbalance (`13.93%` positive), lifting screening Recall/Sensitivity for the primary model from `24.73%` (at $\tau = 0.50$) to **`53.56%`** (Accuracy `82.12%`, Specificity `86.74%`, Precision `39.53%`, F1-Score `0.4549`, Negative Predictive Value `92.02%`).
   - Random Forest ranks marginally higher on threshold-free ROC-AUC/PR-AUC and Brier loss, but the boosted-tree primary model is retained because it catches more cases at the screening cut-point (`53.56%` vs `48.83%` recall, F1 `0.4549` vs `0.4487`) and supports monotonic clinical constraints.
3. **Real-Time Counterfactual Explainable AI (Local & Global XAI)**:
   - **Local Patient Attribution**: Executes a vectorized 22-row counterfactual ablation per patient in `< 3ms` to compute the exact percentage-point risk contribution ($\Delta P_i$) of each of the 20 model features relative to healthy clinical reference values. Row 0 is the actual feature vector, rows 1 to 20 are one-feature ablations, and row 21 is the optimized modifiable profile.
   - **Counterfactual "What-If" Intervention Pathway**: Simulates the exact risk reduction achieved when modifiable lifestyle and clinical factors (`BMI`, `HighBP`, `HighChol`, `PhysActivity`, `Smoker`, `Fruits`, `Veggies`) are optimized.
4. **Plain-language, accessible UI (`React 18 + Tailwind CSS + motion/react`)**:
   - A four-step check-up — *Who you are*, *Your body*, *Your daily habits*, *How you're feeling* — with a live result card that explains the estimate in plain language, shows the strongest drivers, and projects what could lower it.
   - **The whole check-up fits on one screen and the page never scrolls.** The shell is a `h-dvh` flex column; every region owns its own scroll, and a fade at the scroll edge signals that more is below. On a wide screen the estimate sits beside the form; on a narrow one it opens as a bottom sheet while a summary bar keeps the number on screen.
   - **The layout adapts to its box, not to the device.** Container queries on the section card and on each field decide when a two-column grid and an inline yes/no pair collapse; viewport height queries tighten the vertical rhythm on short windows and drop the framing text before they drop the questions.
   - **Motion from `motion/react`, one voice.** Shared curves and springs live in `frontend/src/lib/motion.js`: the tab pill slides, the step panel fades and rises, the estimate and BMI count up, the risk marker and driver bars fill, the disclosure expands, and the BMI silhouette widens as the number changes. `MotionConfig reducedMotion="user"` gives the same end state without the travel.
   - BMI is entered as height (cm) and weight (kg) and the BMI is calculated, rather than set with a slider.
   - A floating pill navigation, a warm bone/forest palette with Bricolage Grotesque and Instrument Sans, Hugeicons line icons, 16px cards, and a Skiper UI-style circular reveal (`900ms`, `blur(10px)` to `blur(0)`) for the dark/light theme toggle.
   - Verified at a true 320px viewport, at 200% zoom, and in both themes with no page scroll and no horizontal overflow; fully keyboard operable, with Lighthouse accessibility 100 and WCAG contrast-checked text and control borders in both themes. The footer reads "© 2026 GlycoStrat. All rights reserved." with squiggly GitHub links for both authors.

---

## Repository Structure

```text
Honours/
├── AGENTS.md                        # Karpathy & Ponytail engineering guidelines
├── DESIGN.md                        # UI design system: color, type, layout, motion & accessibility
├── README.md                        # Project documentation & setup instructions
├── backend/
│   ├── data/
│   │   ├── cdc_diabetes_health_indicators.csv  # Cached 253,680-row UCI #891 dataset
│   │   └── uci_metadata.json                   # Official UCI repository metadata
│   ├── artifacts/
│   │   ├── diabetes_model_bundle.joblib        # Trained HistGBM & LogisticRegression bundle
│   │   └── dashboard_metadata.json             # Precomputed EDA & 50,736-test evaluation metrics
│   ├── train_and_eda.py             # UCI dataset fetcher, EDA calculator, ML trainer & figure generator
│   ├── main.py                      # FastAPI server (/api/health, /api/metadata, /api/presets, /api/predict)
│   ├── test_backend.py              # Assert-based self-check verifying data, models, XAI & validation
│   ├── generate_report.py           # Generates DOCX, HTML, and Markdown Project Reports (TNR 12pt Justified)
│   └── requirements.txt             # Python dependencies
├── frontend/
│   ├── src/
│   │   ├── App.jsx                  # App shell, floating pill nav, tab routing & data fetching
│   │   ├── index.css                # OKLCH tokens, dark theme, controls, container queries & density tiers
│   │   ├── main.jsx                 # React root, MotionConfig (reduced motion)
│   │   ├── components/
│   │   │   ├── Checkup.jsx          # Four-step check-up, height/weight BMI, mobile result sheet
│   │   │   ├── ResultCard.jsx       # Live estimate, drivers, factor list & what-if projection
│   │   │   ├── ExploreData.jsx      # Survey statistics, age/BMI/income/general-health charts & factor dictionary
│   │   │   ├── HowItWorks.jsx       # Method, ROC and threshold charts, trust metrics & optional technical details
│   │   │   ├── PageGrid.jsx         # Blueprint grid backdrop & shared scroll cue
│   │   │   ├── ThemeToggle.jsx      # Skiper-style circular dark/light reveal
│   │   │   ├── inputs.jsx           # Sliders, choice cards, body figure, day meters & selects
│   │   │   └── Icon.jsx             # Hugeicons wrapper (decorative by default)
│   │   └── lib/
│   │       ├── icons.js             # Verified Hugeicons catalog
│   │       ├── labels.js            # Plain-language feature/action labels
│   │       └── motion.js            # Shared motion curves, springs & animated values
│   ├── package.json
│   ├── tailwind.config.js
│   └── vite.config.js
└── docs/
    ├── Project_Report_CDC_Diabetes_Risk_Dashboard.docx  # MS Word Report (Times New Roman, 12pt, Justified, No Em Dashes)
    ├── Project_Report_CDC_Diabetes_Risk_Dashboard.html  # Print-to-PDF HTML Report
    ├── PROJECT_REPORT.md                                # Markdown Report
    └── figures/                                         # High-res EDA/ROC charts & live UI screenshots
```

---

## Quick Start Instructions

### 1. Backend Setup (FastAPI + Python ML)

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate        # Windows: .venv\Scripts\activate
pip install -r requirements.txt

# (Optional) Re-run dataset EDA, model training, and report figure generation
python train_and_eda.py

# Run assert-based verification suite
python test_backend.py

# Start FastAPI server on http://127.0.0.1:8000
python -m uvicorn main:app --host 127.0.0.1 --port 8000
```

### 2. Frontend Setup (React + Vite + Tailwind CSS)

```bash
cd frontend
npm install

# Start Vite development server on http://127.0.0.1:5173
npm run dev
```

Open **`http://127.0.0.1:5173`** in your browser to interact with the live application.

---

## Academic & Clinical Disclaimer

This application is an academic prototype developed for the BE (AI&DS) Healthcare AI/ML Mini Project and is **not** a substitute for professional medical advice, clinical diagnosis, or treatment.
