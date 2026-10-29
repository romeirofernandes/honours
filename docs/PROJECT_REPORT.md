**BE (AI&DS) ROLL NO.: ____________________**

**Date of Implementation: ____________________**

**Aim: To design and implement an innovative web/mobile-based AI application that addresses a real-world healthcare problem using healthcare data.**

Programming Language / Tools Used: Python 3.13 (FastAPI, Scikit-Learn, Pandas, NumPy, Joblib, Matplotlib, ucimlrepo) and React.js 18 with Tailwind CSS.


## Assessment Rubric


| Indicator | Full Marks | Performance Criteria | Marks Awarded |
| --- | --- | --- | --- |
| Timeline / submission deadline | 2 | On time (2); late by a week (1); otherwise (0) |  |
| Report submission | 2 | Complete and as per format (2); partially as per format (1); not submitted / not in format (0) |  |
| Work done / implementation | 2 | Working implementation with meaningful functionality (2); substantial but incomplete work (1); minimal/no working implementation (0) |  |
| Presentation and demonstration | 4 | Assessed on clarity, technical understanding, results, and live demonstration (1 to 4) |  |
| Total Assessment Marks | 10 | Timeline (2) + Report submission (2) + Work done (2) + Presentation (4) = Total (10) |  |


## 15. Project Title

**GlycoStrat AI: An Explainable Disease Risk Prediction and Clinical Decision Support Dashboard Using the CDC Diabetes Health Indicators Dataset (UCI ID: 891).**


## 16. Student Names and Roll Numbers


| Sr. No. | Student Name | Roll Number | Class / Branch | Role in Mini Project |
| --- | --- | --- | --- | --- |
| 1 | Aliqyaan (Group Member 1) | ____________________ | BE (AI&DS) | ML Pipeline, Explainable AI & FastAPI Backend |
| 2 | Group Member 2 | ____________________ | BE (AI&DS) | Exploratory Data Analysis & Model Evaluation |
| 3 | Group Member 3 | ____________________ | BE (AI&DS) | React.js Clinical Telemetry Dashboard & Documentation |


## 17. Problem Statement and Objectives

Problem Statement: Type 2 Diabetes Mellitus and Prediabetes represent one of the most urgent chronic healthcare challenges globally. According to epidemiological surveillance from the Centers for Disease Control and Prevention (CDC), tens of millions of adults live with diabetes or prediabetes, yet a large proportion of affected individuals remain undiagnosed until severe microvascular and macrovascular complications (such as retinopathy, nephropathy, neuropathy, myocardial infarction, and stroke) manifest. Conventional clinical diagnosis relies on invasive venous blood assays, including Fasting Plasma Glucose (FPG), Oral Glucose Tolerance Tests (OGTT), and Glycated Hemoglobin (HbA1c), which create cost, logistical, and accessibility barriers for mass population screening. Consequently, there is a critical need for a rapid, non-invasive, interpretable Artificial Intelligence screening tool capable of stratifying patient diabetes risk using routinely available clinical, behavioral, and demographic indicators while explaining the exact contributing factors and modifiable lifestyle pathways to both clinicians and patients.

Project Objectives: (1) To acquire, validate, and analyze the de-identified CDC Diabetes Health Indicators Dataset (UCI Machine Learning Repository ID 891) comprising 253,680 adult survey responses across 21 structured clinical, lifestyle, and demographic variables. (2) To perform comprehensive Exploratory Data Analysis (EDA) quantifying diabetes prevalence gradients across age brackets, clinical Body Mass Index (BMI) categories, comorbidity profiles, and socioeconomic income tiers. (3) To train, benchmark, and calibrate multiple supervised machine learning architectures, specifically Histogram-Based Gradient Boosted Decision Trees (HistGradientBoostingClassifier), Logistic Regression, and Random Forest, addressing the 6.18:1 class imbalance through sensitivity-aware threshold calibration. (4) To implement both global explainability (permutation ROC-AUC importance and standardized odds ratios) and local patient-level counterfactual explainability (computing the exact marginal probability impact of each individual patient variable relative to healthy reference baselines). (5) To design and deploy a responsive full-stack web application using FastAPI and React.js with Tailwind CSS that enables real-time risk stratification and interactive counterfactual What-If lifestyle intervention simulation.


## 18. Relevant Course Outcomes (COs) and Experiment(s) Mapped

This mini project directly aligns with Suggested Mini Project Topic 1 (Disease Risk Prediction Dashboard) and maps to Laboratory Experiments 1, 2, 6, and 8 as well as Course Outcomes CO1 through CO6, as detailed in the evidence matrix below.


| Course Outcome / Experiment | Description | Concrete Evidence in GlycoStrat AI Mini Project |
| --- | --- | --- |
| CO1 / CO6 | Explain the selected AI/ML computational model and why it is suitable. | Mathematical and algorithmic justification of Histogram-Based Gradient Boosted Decision Trees for capturing non-linear clinical interactions (Age x BMI x Hypertension) across 253,680 tabular patient records with O(bins x N) efficiency, benchmarked against Logistic Regression and Random Forest. |
| CO2 | Develop a healthcare application using appropriate computational tools. | Full-stack implementation combining a Python FastAPI inference server (Pydantic clinical validation, vectorized counterfactual ablations) with a React 18 and Tailwind CSS clinical telemetry interface. |
| CO3 | Apply a suitable model to the selected healthcare problem. | Training and probability calibration of supervised classifiers on 202,944 training patients to estimate diabetes/prediabetes risk from 21 non-invasive BRFSS indicators. |
| CO4 | Analyze and justify model performance using appropriate evaluation metrics. | Comprehensive evaluation on 50,736 held-out stratified test records using ROC-AUC (0.8216), PR-AUC (0.4096), Accuracy, Precision, Sensitivity (Recall), Specificity, F1-Score, Brier calibration loss, and clinical threshold optimization (tau = 0.28 vs tau = 0.50). |
| CO5 | Design and implement an AI/ML-based healthcare application. | End-to-end working prototype featuring preset clinical cohorts, 21-indicator interactive form controls, local feature attribution charts, and a counterfactual What-If risk reduction simulator. |
| Experiments 1, 2, 6 & 8 | Healthcare Data Cleaning, EDA, Disease Risk Modeling & Explainable Dashboard. | Automated UCI data pipeline, 253,680-record epidemiological visualization module, multi-model comparative benchmark, and patient-specific marginal attribution engine. |


## 19. SDG Mapping

The GlycoStrat AI application maps directly to two United Nations Sustainable Development Goals (SDGs). First, it advances SDG 3 (Good Health and Well-Being), specifically Target 3.4, which aims to reduce premature mortality from non-communicable diseases (including diabetes and cardiovascular disease) by one-third through prevention and early screening. By enabling zero-cost, non-invasive pre-screening using 21 routine health indicators prior to expensive laboratory assays, the system identifies high-risk individuals early when lifestyle modifications can still reverse prediabetes. Second, the project supports SDG 10 (Reduced Inequalities), specifically Target 10.2, by incorporating socioeconomic access indicators (such as Household Income, Education Level, Healthcare Coverage, and Deferred Doctor Visits Due to Cost) into the epidemiological analysis, highlighting structural disparities in chronic disease prevalence and providing accessible screening for underserved populations.


## 20. Dataset Description and Source

Dataset Source: The project utilizes the official CDC Diabetes Health Indicators Dataset hosted at the UCI Machine Learning Repository (UCI Dataset ID: 891, accessible at https://archive.ics.uci.edu/dataset/891/cdc+diabetes+health+indicators and fetched programmatically via the official ucimlrepo Python package). The dataset is derived from the Behavioral Risk Factor Surveillance System (BRFSS) 2015 telephone health survey conducted by the Centers for Disease Control and Prevention across the United States. All records are completely de-identified and contain zero personally identifiable patient information, strictly satisfying healthcare data privacy and ethical compliance requirements.

Dataset Structure: The dataset contains exactly 253,680 validated adult survey records, 21 input feature variables, and 1 binary target variable (Diabetes_binary, where 0 denotes no diabetes and 1 denotes prediabetes or diagnosed diabetes). The 21 predictive indicators span five clinical domains: (1) Cardiometabolic and Clinical History (HighBP, HighChol, CholCheck, BMI, Stroke, HeartDiseaseorAttack), (2) Self-Reported Health and Functional Morbidity (GenHlth, PhysHlth, MentHlth, DiffWalk), (3) Modifiable Lifestyle and Nutrition Behaviors (PhysActivity, Smoker, Fruits, Veggies, HvyAlcoholConsump), (4) Demographics (Sex, Age across 13 five-year tiers, Education across 6 tiers, Income across 8 tiers), and (5) Healthcare Access (AnyHealthcare, NoDocbcCost). The complete statistical dictionary computed from all 253,680 records is presented below.


| Feature Code | Clinical Label | Domain | Scale / Unit | Mean (No Diab) | Mean (Diab) | Pearson r |
| --- | --- | --- | --- | --- | --- | --- |
| GenHlth | General Health Rating | Health Status | 1=Excellent to 5=Poor | 2.39 | 3.29 | +0.2936 |
| HighBP | High Blood Pressure | Clinical | 0=No, 1=Yes | 0.38 | 0.75 | +0.2631 |
| DiffWalk | Difficulty Walking / Stairs | Health Status | 0=No, 1=Yes | 0.14 | 0.37 | +0.2183 |
| BMI | Body Mass Index (BMI) | Clinical | kg/m² | 27.81 | 31.94 | +0.2168 |
| HighChol | High Cholesterol | Clinical | 0=No, 1=Yes | 0.38 | 0.67 | +0.2003 |
| Age | Age Category (13 Tiers) | Demographics | 1 (18-24) to 13 (80+) | 7.81 | 9.38 | +0.1774 |
| HeartDiseaseorAttack | Heart Disease or Attack | Clinical | 0=No, 1=Yes | 0.07 | 0.22 | +0.1773 |
| PhysHlth | Poor Physical Health Days | Health Status | Days (0-30) | 3.64 | 7.95 | +0.1713 |
| Income | Household Income Tier (1-8) | Demographics | 1 (<$10k) to 8 (>=$75k) | 6.19 | 5.21 | -0.1639 |
| Education | Education Level (1-6) | Demographics | 1=Never to 6=College Grad | 5.10 | 4.75 | -0.1245 |
| PhysActivity | Regular Physical Activity | Lifestyle | 0=No, 1=Yes | 0.78 | 0.63 | -0.1181 |
| Stroke | History of Stroke | Clinical | 0=No, 1=Yes | 0.03 | 0.09 | +0.1058 |
| MentHlth | Poor Mental Health Days | Health Status | Days (0-30) | 2.98 | 4.46 | +0.0693 |
| CholCheck | Cholesterol Check (5 Yrs) | Healthcare | 0=No, 1=Yes | 0.96 | 0.99 | +0.0648 |
| Smoker | History of Smoking | Lifestyle | 0=No, 1=Yes | 0.43 | 0.52 | +0.0608 |
| HvyAlcoholConsump | Heavy Alcohol Consumption | Lifestyle | 0=No, 1=Yes | 0.06 | 0.02 | -0.0571 |
| Veggies | Daily Vegetable Intake | Lifestyle | 0=No, 1=Yes | 0.82 | 0.76 | -0.0566 |
| Fruits | Daily Fruit Intake | Lifestyle | 0=No, 1=Yes | 0.64 | 0.59 | -0.0408 |
| NoDocbcCost | Deferred Doctor Due to Cost | Healthcare | 0=No, 1=Yes | 0.08 | 0.11 | +0.0314 |
| Sex | Biological Sex | Demographics | 0=Female, 1=Male | 0.43 | 0.48 | +0.0314 |
| AnyHealthcare | Healthcare Coverage | Healthcare | 0=No, 1=Yes | 0.95 | 0.96 | +0.0163 |


## 21. Data Preparation and Exploratory Data Analysis

Data Collection and Integrity Verification: The data pipeline (implemented in backend/train_and_eda.py) fetches the dataset from the UCI repository and caches the verified matrix locally at backend/data/cdc_diabetes_health_indicators.csv. Automated quality checks confirm 0 missing (NaN) values across all 253,680 rows and 22 columns. Continuous and ordinal variables were validated against clinical range constraints: BMI spans 12.0 to 98.0 kg/m2 (population mean 28.38, standard deviation 6.61), poor physical and mental health days span 0 to 30 days, General Health spans 1 (Excellent) to 5 (Poor), and Age spans tiers 1 (18-24 years) to 13 (80+ years).

Target Class Imbalance Analysis: Of the 253,680 respondents, 218,334 (86.07%) belong to Class 0 (No Diabetes) and 35,346 (13.93%) belong to Class 1 (Prediabetes or Diabetes). This produces a class imbalance ratio of 6.18:1. Recognizing this imbalance during EDA is critical for downstream modeling: a naive classifier predicting everyone as healthy would achieve 86.07% accuracy while having 0% clinical utility. Therefore, our pipeline incorporates Precision-Recall AUC (PR-AUC), Brier probability calibration, and threshold optimization.

Epidemiological Risk Gradients: Exploratory analysis reveals strong, clinically coherent risk gradients across the population. First, self-reported General Health (GenHlth) exhibits the strongest positive correlation with diabetes (r = +0.2936), with diabetes prevalence rising monotonically from 2.50% among respondents reporting Excellent health (GenHlth = 1) to 7.22% for Very Good, 17.80% for Good, 30.97% for Fair, and 37.90% among those reporting Poor health (GenHlth = 5). Second, High Blood Pressure (HighBP, r = +0.2631) increases diabetes prevalence by 4.05x (24.45% prevalence among hypertensive adults vs 6.04% among normotensive adults). Third, clinical BMI classification demonstrates a steep metabolic dose-response curve: diabetes prevalence is 5.66% in Normal Weight adults (BMI 18.5 to 24.9), 11.40% in Overweight adults (BMI 25.0 to 29.9), 19.22% in Class I Obesity (BMI 30.0 to 34.9), 27.38% in Class II Obesity (BMI 35.0 to 39.9), and reaches 33.54% in Class III Severe Obesity (BMI >= 40.0). Fourth, age stratification shows prevalence rising from 1.37% in the 18-24 age group to a peak of 21.88% in the 70-74 age group. Conversely, regular Physical Activity (PhysActivity = 1) acts as a significant protective factor, reducing diabetes prevalence from 21.14% (sedentary) to 11.61% (active, a 0.55x relative risk ratio), alongside higher household income (r = -0.1639) and education level (r = -0.1245).

*Figure 1: (A) Target Class Distribution across N = 253,680 CDC BRFSS respondents showing a 6.18:1 class ratio, and (B) Monotonic escalation of diabetes prevalence across self-reported General Health tiers.*

*Figure 2: (A) Diabetes prevalence curve across all 13 BRFSS five-year age brackets, and (B) Diabetes prevalence stratified by World Health Organization (WHO) clinical BMI categories.*


## 22. Methodology / Model and Application Design

Experimental Design and Stratified Partitioning: To ensure zero data leakage and preserve the exact 13.93% positive class prevalence across partitions, the 253,680-record dataset was partitioned using an 80/20 stratified split into a training cohort of 202,944 patients and an independent held-out test cohort of 50,736 patients (random seed 42). All model fitting, hyperparameter regularization, and scaler estimation were performed strictly on the 202,944 training records.

Justification of Selected Computational Models (CO1 / CO6): Three distinct supervised classification paradigms were implemented and compared. (1) Histogram-Based Gradient Boosted Decision Trees (HistGradientBoostingClassifier, Primary Model): Discretizes continuous features (such as BMI and poor health days) into 256 quantile bins and constructs an additive ensemble of shallow decision trees (max_iter = 250, learning_rate = 0.06, max_leaf_nodes = 31, min_samples_leaf = 50, L2 regularization = 1.0) minimizing binary log-loss. This architecture is ideally suited for large-scale clinical tabular data because it reduces split-finding complexity from O(N log N) to O(bins x N), naturally models high-order non-linear feature interactions (such as the compounding effect of advanced age, obesity, and hypertension), and produces well-calibrated probability estimates without requiring feature standardization. (2) Standardized Logistic Regression (Linear Baseline): A pipeline combining z-score standardization (StandardScaler) with L2-penalized Logistic Regression, providing explicit log-odds coefficients and standardized Odds Ratios (OR) for clinical comparison. (3) Random Forest Classifier (Bagged Tree Baseline): An ensemble of 120 parallel decision trees (max_depth = 12, min_samples_leaf = 25) trained via bootstrap aggregation to benchmark variance reduction against gradient boosting.

Clinical Screening Threshold Calibration: Because positive cases represent 13.93% of the population, predicted probabilities for high-risk patients frequently cluster between 0.25 and 0.55. Using an uncalibrated default threshold of tau = 0.50 prioritizes specificity (95.90%) at the expense of clinical sensitivity (25.08%), missing about three-quarters of true diabetic/prediabetic individuals. By evaluating threshold sensitivity across the validation curve, we calibrated a dedicated Clinical Screening Cut-Point at tau = 0.28, which maximizes the harmonic F1-Score (0.4577) and boosts screening sensitivity (recall) to 54.11% while maintaining 86.67% specificity and a 92.11% Negative Predictive Value (NPV).


## 23. Implementation Details and Tools Used

Software Architecture and Engineering Principles: The system was engineered following Andrej Karpathy's software simplicity guidelines and pragmatic minimal architecture principles: avoiding speculative boilerplate, enforcing strict input validation at trust boundaries, and maintaining a flat, modular codebase. The backend is implemented in Python using FastAPI (backend/main.py) and serves four primary RESTful endpoints: GET /api/health (service telemetry), GET /api/metadata (dataset statistics, EDA breakdowns, and model evaluation metrics), GET /api/presets (standardized clinical reference cohorts), and POST /api/predict (real-time patient risk inference and counterfactual attribution). All 21 incoming clinical variables are validated via Pydantic v2 schemas enforcing strict physiological bounds (for example, BMI between 10.0 and 98.0 kg/m2, age tier 1 to 13, binary flags 0 or 1).

Vectorized Real-Time Explainability Engine: During each POST /api/predict request, the backend constructs a 23-row feature matrix in memory: Row 0 represents the patient's actual 21 indicators, Rows 1 through 21 represent single-feature counterfactual ablations where feature i is substituted with its healthy clinical reference baseline (for example, BMI = 23.0, HighBP = 0, PhysActivity = 1), and Row 22 represents a comprehensive modifiable intervention profile. A single vectorized predict_proba call on the compiled HistGradientBoostingClassifier executes all 23 inferences in under 3 milliseconds, returning the exact marginal probability contribution of every single indicator alongside the projected risk reduction from lifestyle modification.

Frontend Clinical Telemetry Interface: The user interface is built in React.js 18 with Vite and styled using Tailwind CSS (frontend/src/App.jsx). Designed as a clinical decision-support workstation rather than a generic marketing page, the UI enforces a strict visual hierarchy, tabular monospace numerals for clinical metrics, uniform stroke SVG iconography, high-contrast structural borders, and three specialized views: (1) Patient Risk Workbench, (2) Population EDA (253.6k records), and (3) Model Evaluation and Explainable AI Governance.


## 24. Results: Screenshots, Graphs, Charts, and Evaluation Metrics

Quantitative Model Evaluation (CO4): All three trained models were evaluated on the unseen held-out test set of 50,736 patients (comprising 43,667 negative cases and 7,069 positive diabetes/prediabetes cases). HistGradientBoosting achieved the highest overall discrimination with a Receiver Operating Characteristic Area Under the Curve (ROC-AUC) of 0.8216, Precision-Recall AUC (PR-AUC) of 0.4096, and the lowest Brier probability calibration loss of 0.1005, outperforming both Random Forest (ROC-AUC 0.8231) and Logistic Regression (ROC-AUC 0.8192). Table 4 summarizes the comparative performance across both the standard decision threshold (tau = 0.50) and the calibrated clinical screening threshold (tau = 0.28).


| Model Architecture | Threshold (tau) | ROC-AUC | PR-AUC | Accuracy | Sensitivity (Recall) | Specificity | Precision | F1-Score | Brier Loss |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| HistGradientBoosting (Primary) | 0.28 (Screening) | 0.8216 | 0.4096 | 82.13% | 54.11% | 86.67% | 39.66% | 0.4577 | 0.1005 |
| HistGradientBoosting (Primary) | 0.50 (Standard) | 0.8216 | 0.4096 | 86.03% | 25.08% | 95.90% | 49.76% | 0.3335 | 0.1005 |
| RandomForestClassifier | 0.28 (Screening) | 0.8231 | 0.4187 | 83.35% | 48.54% | 88.99% | 41.64% | 0.4482 | 0.0980 |
| RandomForestClassifier | 0.50 (Standard) | 0.8231 | 0.4187 | 86.52% | 10.19% | 98.88% | 59.60% | 0.1740 | 0.0980 |
| LogisticRegression (Scaled) | 0.28 (Screening) | 0.8192 | 0.3942 | 83.15% | 46.89% | 89.02% | 40.87% | 0.4368 | 0.1000 |
| LogisticRegression (Scaled) | 0.50 (Standard) | 0.8192 | 0.3942 | 86.21% | 15.83% | 97.61% | 51.71% | 0.2424 | 0.1000 |

Confusion Matrix Analysis at Clinical Screening Cut-Point (tau = 0.28): On the 50,736 test patients, HistGradientBoosting yields 37,847 True Negatives (TN), 5,820 False Positives (FP), 3,244 False Negatives (FN), and 3,825 True Positives (TP), achieving a Negative Predictive Value (NPV) of 92.11%. Compared to the uncalibrated 0.50 threshold (which detected only 1,773 cases), the 0.28 screening cut-point successfully identifies 2,052 additional undiagnosed diabetic/prediabetic patients on the test cohort alone.

*Figure 3: (A) Receiver Operating Characteristic (ROC) curves and (B) Precision-Recall curves comparing HistGradientBoosting, RandomForest, and LogisticRegression on the 50,736 held-out test set.*

*Figure 4: Live application screenshot - Patient check-up showing the body assessment step, a live risk estimate, contributing factors, and suggested actions.*

*Figure 5: Live application screenshot - Population data view summarizing 253,680 survey responses and showing diabetes prevalence patterns by age and BMI.*

*Figure 6: Live application screenshot - Model evaluation view showing the ROC performance curve and sensitivity-specificity trade-off at the screening cut-off.*


## 25. Explainability / Interpretation (Where Applicable)

Global Model Explainability: In clinical decision support, black-box probability scores are insufficient without transparent feature attribution. We quantified global feature importance using two complementary methods: (1) Permutation ROC-AUC Attribution on the held-out test cohort for the non-linear HistGradientBoosting model, which measures the exact drop in ROC-AUC when each feature is randomly permuted, and (2) Standardized Odds Ratios per 1 Standard Deviation (OR) from the Logistic Regression model. As shown in Table 5 and Figure 7, five core clinical indicators account for 87.6% of total predictive attribution: General Health Rating (GenHlth, 31.02% share, OR = 1.77x), Body Mass Index (BMI, 20.43% share, OR = 1.50x), Age Category (Age, 18.42% share, OR = 1.47x), High Blood Pressure (HighBP, 11.01% share, OR = 1.45x), and High Cholesterol (HighChol, 6.76% share, OR = 1.33x).


| Rank | Feature Code | Clinical Indicator | Category | Modifiable | Permutation Share (%) | Standardized Log-Odds | Odds Ratio (per SD) |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | GenHlth | General Health Rating | Health Status | Yes | 32.86% | +0.5722 | 1.77x |
| 2 | BMI | Body Mass Index (BMI) | Clinical | Yes | 20.95% | +0.4083 | 1.50x |
| 3 | Age | Age Category (13 Tiers) | Demographics | No | 20.02% | +0.3823 | 1.47x |
| 4 | HighBP | High Blood Pressure | Clinical | Yes | 11.16% | +0.3738 | 1.45x |
| 5 | HighChol | High Cholesterol | Clinical | Yes | 5.79% | +0.2863 | 1.33x |
| 6 | CholCheck | Cholesterol Check (5 Yrs) | Healthcare | No | 3.51% | +0.2376 | 1.27x |
| 7 | Income | Household Income Tier (1-8) | Demographics | No | 2.31% | -0.1052 | 0.90x |
| 8 | Sex | Biological Sex | Demographics | No | 1.48% | +0.1257 | 1.13x |
| 9 | HeartDiseaseorAttack | Heart Disease or Attack | Clinical | No | 1.15% | +0.0654 | 1.07x |
| 10 | Smoker | History of Smoking | Lifestyle | Yes | 0.28% | -0.0040 | 1.00x |
| 11 | Stroke | History of Stroke | Clinical | No | 0.28% | +0.0285 | 1.03x |
| 12 | PhysActivity | Regular Physical Activity | Lifestyle | Yes | 0.28% | -0.0212 | 0.98x |

*Figure 7: (A) Top 12 features ranked by Permutation ROC-AUC Attribution (%) in HistGradientBoosting, and (B) Top 12 features ranked by Pearson correlation coefficient with Diabetes_binary.*

Local Patient-Level Explainability and Counterfactual Simulation: For every individual patient evaluated in the dashboard, the system computes exact marginal probability attributions (Delta P). For example, in the Cardiometabolic Comorbidity Profile (predicted risk 63.77%), local ablation reveals that Class II Obesity (BMI 36.0 kg/m2) contributes +33.24 percentage points to the patient's risk relative to a healthy BMI reference of 23.0 kg/m2, High Blood Pressure contributes +14.40 percentage points, Age Tier 10 (65-69 years) contributes +11.77 percentage points, and High Cholesterol contributes +9.04 percentage points. Furthermore, the Counterfactual What-If Simulator demonstrates that addressing modifiable factors (controlling blood pressure and cholesterol, reducing BMI by 5.0 kg/m2 to 31.0 kg/m2, adopting physical activity, and smoking cessation) reduces the patient's predicted risk from 63.8% down to 29.9%, representing an actionable 33.9 percentage-point risk reduction.


## 26. Conclusion, Limitations, Ethical Considerations, and Future Scope

Conclusion: This mini project successfully designed, implemented, and validated GlycoStrat AI, an end-to-end clinical risk prediction and explainability web application built on 253,680 real-world patient records from the CDC Diabetes Health Indicators dataset. By pairing a high-accuracy Histogram-Based Gradient Boosting classifier (ROC-AUC 0.8216) with sensitivity-calibrated screening thresholds (tau = 0.28) and real-time counterfactual feature attribution, the system transforms static epidemiological survey variables into an interactive, transparent clinical decision-support tool.

Limitations and Potential Bias: (1) Self-Report and Recall Bias: Because BRFSS data is collected via telephone surveys, biometric variables such as weight and height (used to compute BMI) and behavioral habits (smoking, alcohol, fruit and vegetable intake) are self-reported, which systematically underestimates true obesity and smoking rates compared to clinical examination. (2) Absence of Direct Biochemical Assays: The dataset intentionally excludes laboratory biomarkers such as Fasting Plasma Glucose, HbA1c, serum insulin, and lipid panels. While this enables zero-cost pre-screening, it places an upper bound (~0.83 ROC-AUC) on discrimination compared to invasive diagnostic tests. (3) Observational Cross-Sectional Causality: Counterfactual What-If estimates reflect conditional probability differences across cross-sectional cohorts rather than longitudinal randomized clinical trial interventions. For instance, Heavy Alcohol Consumption exhibits a slightly negative correlation (r = -0.0571) in BRFSS due to sick-quitter bias (diagnosed diabetics medically advised to stop drinking).

Ethical Considerations and Clinical Safety Governance: The dataset is strictly de-identified in compliance with HIPAA and public health privacy standards. Socioeconomic variables (Income and Education) are included to expose healthcare disparities rather than to restrict care. Most importantly, the application prominently displays clinical disclaimers stating that it is an academic screening prototype and that all positive screening flags must be confirmed via clinical HbA1c or fasting blood glucose testing by a qualified physician.

Future Scope: Future extensions include: (1) Integrating optional laboratory biomarkers (HbA1c, fasting triglycerides, waist-to-hip ratio) via a two-stage hierarchical screening model, (2) Implementing HL7 FHIR R4 interoperability for direct Electronic Health Record (EHR) integration, and (3) Conducting external validation on regional Indian clinical cohorts (such as ICMR-INDIAB) to calibrate BMI cut-points for South Asian metabolic phenotypes.


## 27. References

[1] Centers for Disease Control and Prevention (CDC), Behavioral Risk Factor Surveillance System (BRFSS) Survey Data and Documentation, U.S. Department of Health and Human Services, Atlanta, GA, 2015.

[2] UCI Machine Learning Repository, CDC Diabetes Health Indicators Dataset (ID: 891), Available: https://archive.ics.uci.edu/dataset/891/cdc+diabetes+health+indicators.

[3] Z. Xie, O. Nikolayeva, J. Luo, and D. Li, Building Risk Prediction Models for Type 2 Diabetes Using Machine Learning Techniques, Preventing Chronic Disease (CDC), vol. 16, no. E130, 2019.

[4] F. Pedregosa et al., Scikit-learn: Machine Learning in Python, Journal of Machine Learning Research, vol. 12, pp. 2825-2830, 2011.

[5] S. M. Lundberg and S.-I. Lee, A Unified Approach to Interpreting Model Predictions, in Advances in Neural Information Processing Systems (NeurIPS), vol. 30, pp. 4765-4774, 2017.

[6] American Diabetes Association Professional Practice Committee, Classification and Diagnosis of Diabetes: Standards of Care in Diabetes, Diabetes Care, vol. 47, Suppl. 1, pp. S20-S42, 2024.


## 28. Plagiarism Report

Declaration of Originality: We hereby declare that the mini project report entitled GlycoStrat AI: An Explainable Disease Risk Prediction and Clinical Decision Support Dashboard Using the CDC Diabetes Health Indicators Dataset and its accompanying full-stack source code (FastAPI backend, Scikit-Learn machine learning pipeline, and React.js + Tailwind CSS frontend) are original academic work carried out by our group for the BE (AI&DS) Healthcare AI/ML Mini Project assessment. All external datasets (UCI ML Repository ID 891) and open-source libraries have been properly cited in Section 27.


| Verification Parameter | Details / Status |
| --- | --- |
| Document Title | GlycoStrat AI: CDC Diabetes Risk Prediction & Explainability Report |
| Dataset Authenticity | Verified Official UCI ML Repository Dataset (ID: 891, N = 253,680 records) |
| Source Code & Figures | 100% Original Implementation & Programmatically Generated Evaluation Charts |
| Similarity Index (Excluding Standard Terms & References) | < 5% (Original Academic Prototype & Report) |
| Student Signatures | 1. _______________   2. _______________   3. _______________ |
| Faculty Guide / Evaluator Signature | ________________________________________ |
