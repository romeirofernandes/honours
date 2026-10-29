"""
Clinical Schema, Feature Metadata, Monotonicity Constraints, and Presets.
"""
from pydantic import BaseModel, Field

# Monotonicity constraint per feature:
# +1 = increasing feature value MUST NOT decrease diabetes risk
# -1 = increasing feature value (healthy habit/socioeconomic access) MUST NOT increase diabetes risk
#  0 = unconstrained demographic indicator (e.g., Sex)
FEATURE_META = {
    "HighBP": {
        "label": "High Blood Pressure",
        "category": "Clinical",
        "type": "binary",
        "unit": "0=No, 1=Yes",
        "healthy_ref": 0,
        "modifiable": True,
        "monotonic_cst": 1,
        "clinical_prior_logit": 0.55,
        "description": "Diagnosed with high blood pressure by a doctor or health professional.",
    },
    "HighChol": {
        "label": "High Cholesterol",
        "category": "Clinical",
        "type": "binary",
        "unit": "0=No, 1=Yes",
        "healthy_ref": 0,
        "modifiable": True,
        "monotonic_cst": 1,
        "clinical_prior_logit": 0.42,
        "description": "Ever told by a health professional that blood cholesterol is elevated.",
    },
    "CholCheck": {
        "label": "Cholesterol Check (5 Yrs)",
        "category": "Healthcare",
        "type": "binary",
        "unit": "0=No, 1=Yes",
        "healthy_ref": 1,
        "modifiable": False,
        "monotonic_cst": 0,
        "clinical_prior_logit": 0.0,
        "description": "Had blood cholesterol screening within the past 5 years.",
    },
    "BMI": {
        "label": "Body Mass Index (BMI)",
        "category": "Clinical",
        "type": "continuous",
        "unit": "kg/m²",
        "min": 12,
        "max": 98,
        "healthy_ref": 23.0,
        "modifiable": True,
        "monotonic_cst": 1,
        "clinical_prior_logit": 0.045,  # per BMI unit above 23.0
        "description": "Body Mass Index calculated from weight and height (kg/m²).",
    },
    "Smoker": {
        "label": "History of Smoking",
        "category": "Lifestyle",
        "type": "binary",
        "unit": "0=No, 1=Yes",
        "healthy_ref": 0,
        "modifiable": True,
        "monotonic_cst": 1,
        "clinical_prior_logit": 0.24,  # ~1.27x odds ratio in clinical meta-analyses
        "description": "Smoked at least 100 cigarettes (5 packs) in entire lifetime.",
    },
    "Stroke": {
        "label": "History of Stroke",
        "category": "Clinical",
        "type": "binary",
        "unit": "0=No, 1=Yes",
        "healthy_ref": 0,
        "modifiable": False,
        "monotonic_cst": 1,
        "clinical_prior_logit": 0.30,
        "description": "Ever told patient had a cerebrovascular stroke.",
    },
    "HeartDiseaseorAttack": {
        "label": "Heart Disease or Attack",
        "category": "Clinical",
        "type": "binary",
        "unit": "0=No, 1=Yes",
        "healthy_ref": 0,
        "modifiable": False,
        "monotonic_cst": 1,
        "clinical_prior_logit": 0.38,
        "description": "Coronary heart disease (CHD) or myocardial infarction (MI).",
    },
    "PhysActivity": {
        "label": "Regular Physical Activity",
        "category": "Lifestyle",
        "type": "binary",
        "unit": "0=No, 1=Yes",
        "healthy_ref": 1,
        "modifiable": True,
        "monotonic_cst": -1,
        "clinical_prior_logit": -0.26,  # Protective when PhysActivity=1
        "description": "Physical activity or exercise during the past 30 days outside regular job.",
    },
    "Fruits": {
        "label": "Daily Fruit Intake",
        "category": "Lifestyle",
        "type": "binary",
        "unit": "0=No, 1=Yes",
        "healthy_ref": 1,
        "modifiable": True,
        "monotonic_cst": -1,
        "clinical_prior_logit": -0.10,  # Protective when Fruits=1
        "description": "Consumes fruit 1 or more times per day.",
    },
    "Veggies": {
        "label": "Daily Vegetable Intake",
        "category": "Lifestyle",
        "type": "binary",
        "unit": "0=No, 1=Yes",
        "healthy_ref": 1,
        "modifiable": True,
        "monotonic_cst": -1,
        "clinical_prior_logit": -0.12,  # Protective when Veggies=1
        "description": "Consumes vegetables 1 or more times per day.",
    },
    "HvyAlcoholConsump": {
        "label": "Heavy Alcohol Consumption",
        "category": "Lifestyle",
        "type": "binary",
        "unit": "0=No, 1=Yes",
        "healthy_ref": 0,
        "modifiable": True,
        "monotonic_cst": 1,
        "clinical_prior_logit": 0.28,  # Corrects BRFSS sick-quitter bias; heavy drinking increases metabolic risk
        "description": "Heavy drinking (adult men >=14 drinks/week, adult women >=7 drinks/week).",
    },
    "AnyHealthcare": {
        "label": "Healthcare Coverage",
        "category": "Healthcare",
        "type": "binary",
        "unit": "0=No, 1=Yes",
        "healthy_ref": 1,
        "modifiable": False,
        "monotonic_cst": 0,
        "clinical_prior_logit": 0.0,
        "description": "Has health insurance, HMO, or government healthcare coverage.",
    },
    "NoDocbcCost": {
        "label": "Deferred Doctor Due to Cost",
        "category": "Healthcare",
        "type": "binary",
        "unit": "0=No, 1=Yes",
        "healthy_ref": 0,
        "modifiable": False,
        "monotonic_cst": 1,
        "clinical_prior_logit": 0.12,
        "description": "Needed to see a doctor in past 12 months but could not due to cost.",
    },
    "GenHlth": {
        "label": "General Health Rating",
        "category": "Health Status",
        "type": "ordinal",
        "unit": "1=Excellent to 5=Poor",
        "min": 1,
        "max": 5,
        "healthy_ref": 2,
        "modifiable": True,
        "monotonic_cst": 1,
        "clinical_prior_logit": 0.35,  # per step above 2
        "description": "Self-reported general health (1=Excellent, 2=Very Good, 3=Good, 4=Fair, 5=Poor).",
    },
    "MentHlth": {
        "label": "Poor Mental Health Days",
        "category": "Health Status",
        "type": "continuous",
        "unit": "Days (0-30)",
        "min": 0,
        "max": 30,
        "healthy_ref": 0,
        "modifiable": True,
        "monotonic_cst": 1,
        "clinical_prior_logit": 0.005,
        "description": "Days in past 30 days that mental health (stress, depression) was not good.",
    },
    "PhysHlth": {
        "label": "Poor Physical Health Days",
        "category": "Health Status",
        "type": "continuous",
        "unit": "Days (0-30)",
        "min": 0,
        "max": 30,
        "healthy_ref": 0,
        "modifiable": True,
        "monotonic_cst": 1,
        "clinical_prior_logit": 0.008,
        "description": "Days in past 30 days that physical health (illness/injury) was not good.",
    },
    "DiffWalk": {
        "label": "Difficulty Walking / Stairs",
        "category": "Health Status",
        "type": "binary",
        "unit": "0=No, 1=Yes",
        "healthy_ref": 0,
        "modifiable": True,
        "monotonic_cst": 1,
        "clinical_prior_logit": 0.25,
        "description": "Serious difficulty walking or climbing stairs.",
    },
    "Sex": {
        "label": "Biological Sex",
        "category": "Demographics",
        "type": "binary",
        "unit": "0=Female, 1=Male",
        "healthy_ref": 0,
        "modifiable": False,
        "monotonic_cst": 0,
        "clinical_prior_logit": 0.08,
        "description": "Biological sex of respondent (0=Female, 1=Male).",
    },
    "Age": {
        "label": "Age Category (13 Tiers)",
        "category": "Demographics",
        "type": "ordinal",
        "unit": "1 (18-24) to 13 (80+)",
        "min": 1,
        "max": 13,
        "healthy_ref": 4,
        "modifiable": False,
        "monotonic_cst": 1,
        "clinical_prior_logit": 0.12,
        "description": "13-level age category from BRFSS (1=18-24, ..., 7=50-54, ..., 13=80+).",
    },
    "Education": {
        "label": "Education Level (1-6)",
        "category": "Demographics",
        "type": "ordinal",
        "unit": "1=Never to 6=College Grad",
        "min": 1,
        "max": 6,
        "healthy_ref": 6,
        "modifiable": False,
        "monotonic_cst": -1,
        "clinical_prior_logit": -0.05,
        "description": "Education scale 1-6 (4=High school grad, 5=Some college, 6=College graduate).",
    },
    "Income": {
        "label": "Household Income Tier (1-8)",
        "category": "Demographics",
        "type": "ordinal",
        "unit": "1 (<$10k) to 8 (>=$75k)",
        "min": 1,
        "max": 8,
        "healthy_ref": 7,
        "modifiable": False,
        "monotonic_cst": -1,
        "clinical_prior_logit": -0.06,
        "description": "Household income scale 1-8 (1=<$10k, 5=<$35k, 8=$75k or more).",
    },
}

AGE_LABELS = {
    1: "18-24", 2: "25-29", 3: "30-34", 4: "35-39", 5: "40-44",
    6: "45-49", 7: "50-54", 8: "55-59", 9: "60-64", 10: "65-69",
    11: "70-74", 12: "75-79", 13: "80+",
}

GENHLTH_LABELS = {
    1: "Excellent", 2: "Very Good", 3: "Good", 4: "Fair", 5: "Poor",
}

INCOME_LABELS = {
    1: "<$10k", 2: "$10k-$15k", 3: "$15k-$20k", 4: "$20k-$25k",
    5: "$25k-$35k", 6: "$35k-$50k", 7: "$50k-$75k", 8: ">=$75k",
}


class PatientIndicators(BaseModel):
    HighBP: int = Field(0, ge=0, le=1)
    HighChol: int = Field(0, ge=0, le=1)
    CholCheck: int = Field(1, ge=0, le=1)
    BMI: float = Field(26.0, ge=10.0, le=98.0)
    Smoker: int = Field(0, ge=0, le=1)
    Stroke: int = Field(0, ge=0, le=1)
    HeartDiseaseorAttack: int = Field(0, ge=0, le=1)
    PhysActivity: int = Field(1, ge=0, le=1)
    Fruits: int = Field(1, ge=0, le=1)
    Veggies: int = Field(1, ge=0, le=1)
    HvyAlcoholConsump: int = Field(0, ge=0, le=1)
    AnyHealthcare: int = Field(1, ge=0, le=1)
    NoDocbcCost: int = Field(0, ge=0, le=1)
    GenHlth: int = Field(2, ge=1, le=5)
    MentHlth: int = Field(2, ge=0, le=30)
    PhysHlth: int = Field(2, ge=0, le=30)
    DiffWalk: int = Field(0, ge=0, le=1)
    Sex: int = Field(0, ge=0, le=1)
    Age: int = Field(7, ge=1, le=13)
    Education: int = Field(5, ge=1, le=6)
    Income: int = Field(6, ge=1, le=8)


CLINICAL_PRESETS = [
    {
        "id": "optimal-baseline",
        "name": "Healthy Baseline",
        "subtitle": "35-39 yr, normal BMI (22.5), active, non-smoker",
        "clinical_tag": "Low Risk",
        "indicators": {
            "HighBP": 0, "HighChol": 0, "CholCheck": 1, "BMI": 22.5,
            "Smoker": 0, "Stroke": 0, "HeartDiseaseorAttack": 0, "PhysActivity": 1,
            "Fruits": 1, "Veggies": 1, "HvyAlcoholConsump": 0, "AnyHealthcare": 1,
            "NoDocbcCost": 0, "GenHlth": 1, "MentHlth": 0, "PhysHlth": 0,
            "DiffWalk": 0, "Sex": 0, "Age": 4, "Education": 6, "Income": 8,
        },
    },
    {
        "id": "modifiable-prediabetic",
        "name": "Pre-Diabetic Lifestyle Risk",
        "subtitle": "50-54 yr, BMI 32, smoker, sedentary, high BP",
        "clinical_tag": "Moderate Risk",
        "indicators": {
            "HighBP": 1, "HighChol": 1, "CholCheck": 1, "BMI": 32.0,
            "Smoker": 1, "Stroke": 0, "HeartDiseaseorAttack": 0, "PhysActivity": 0,
            "Fruits": 0, "Veggies": 0, "HvyAlcoholConsump": 0, "AnyHealthcare": 1,
            "NoDocbcCost": 0, "GenHlth": 3, "MentHlth": 5, "PhysHlth": 6,
            "DiffWalk": 0, "Sex": 1, "Age": 7, "Education": 5, "Income": 5,
        },
    },
    {
        "id": "cardiometabolic-high",
        "name": "High Comorbidity Profile",
        "subtitle": "65-69 yr, BMI 36, hypertension, high chol, heart disease",
        "clinical_tag": "High Risk",
        "indicators": {
            "HighBP": 1, "HighChol": 1, "CholCheck": 1, "BMI": 36.0,
            "Smoker": 1, "Stroke": 0, "HeartDiseaseorAttack": 1, "PhysActivity": 0,
            "Fruits": 0, "Veggies": 0, "HvyAlcoholConsump": 1, "AnyHealthcare": 1,
            "NoDocbcCost": 0, "GenHlth": 4, "MentHlth": 8, "PhysHlth": 15,
            "DiffWalk": 1, "Sex": 1, "Age": 10, "Education": 4, "Income": 4,
        },
    },
    {
        "id": "resilient-senior",
        "name": "Active Senior Profile",
        "subtitle": "70-74 yr, BMI 24, daily exercise & nutrition, normal BP",
        "clinical_tag": "Preventive Aging",
        "indicators": {
            "HighBP": 0, "HighChol": 0, "CholCheck": 1, "BMI": 24.0,
            "Smoker": 0, "Stroke": 0, "HeartDiseaseorAttack": 0, "PhysActivity": 1,
            "Fruits": 1, "Veggies": 1, "HvyAlcoholConsump": 0, "AnyHealthcare": 1,
            "NoDocbcCost": 0, "GenHlth": 2, "MentHlth": 1, "PhysHlth": 2,
            "DiffWalk": 0, "Sex": 0, "Age": 11, "Education": 6, "Income": 7,
        },
    },
]
