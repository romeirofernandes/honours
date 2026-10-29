import { FaceHappy, FaceMeh, FaceNeutral, FaceSad, FaceSmile } from './icons.js';

export const AGE_OPTIONS = [
  { value: 1, label: '18–24' },
  { value: 2, label: '25–29' },
  { value: 3, label: '30–34' },
  { value: 4, label: '35–39' },
  { value: 5, label: '40–44' },
  { value: 6, label: '45–49' },
  { value: 7, label: '50–54' },
  { value: 8, label: '55–59' },
  { value: 9, label: '60–64' },
  { value: 10, label: '65–69' },
  { value: 11, label: '70–74' },
  { value: 12, label: '75–79' },
  { value: 13, label: '80+' },
];

export const AGE_LABELS = Object.fromEntries(AGE_OPTIONS.map((o) => [o.value, o.label]));

export const GENHLTH_OPTIONS = [
  { value: 1, label: 'Excellent', icon: FaceHappy },
  { value: 2, label: 'Very good', icon: FaceSmile },
  { value: 3, label: 'Good', icon: FaceNeutral },
  { value: 4, label: 'Fair', icon: FaceMeh },
  { value: 5, label: 'Poor', icon: FaceSad },
];

export const GENHLTH_LABELS = Object.fromEntries(
  GENHLTH_OPTIONS.map((o) => [o.value, o.label]),
);

export const EDUCATION_OPTIONS = [
  { value: 1, label: 'Never attended school' },
  { value: 2, label: 'Elementary school' },
  { value: 3, label: 'Some high school' },
  { value: 4, label: 'High school graduate' },
  { value: 5, label: 'Some college' },
  { value: 6, label: 'College graduate' },
];

export const INCOME_OPTIONS = [
  { value: 1, label: 'Under ₹8.5 Lakh' },
  { value: 2, label: '₹8.5 Lakh – ₹12.5 Lakh' },
  { value: 3, label: '₹12.5 Lakh – ₹17 Lakh' },
  { value: 4, label: '₹17 Lakh – ₹21 Lakh' },
  { value: 5, label: '₹21 Lakh – ₹30 Lakh' },
  { value: 6, label: '₹30 Lakh – ₹42.5 Lakh' },
  { value: 7, label: '₹42.5 Lakh – ₹64 Lakh' },
  { value: 8, label: '₹64 Lakh or more' },
];

export const INCOME_LABELS = Object.fromEntries(INCOME_OPTIONS.map((o) => [o.value, o.label]));

/** Plain-language names for the 21 model inputs. */
export const FEATURE_LABELS = {
  HighBP: 'Blood pressure',
  HighChol: 'Cholesterol',
  CholCheck: 'Cholesterol check',
  BMI: 'Body weight',
  Smoker: 'Smoking',
  Stroke: 'Stroke history',
  HeartDiseaseorAttack: 'Heart disease',
  PhysActivity: 'Physical activity',
  Fruits: 'Fruit',
  Veggies: 'Vegetables',
  HvyAlcoholConsump: 'Heavy drinking',
  AnyHealthcare: 'Health coverage',
  NoDocbcCost: 'Cost barriers to care',
  GenHlth: 'Overall health',
  MentHlth: 'Poor mental health days',
  PhysHlth: 'Poor physical health days',
  DiffWalk: 'Walking difficulty',
  Sex: 'Sex',
  Age: 'Age',
  Education: 'Education',
  Income: 'Income',
};

export function formatFeatureValue(feature, value) {
  if (feature === 'Age') return `${AGE_LABELS[value] ?? value} yrs`;
  if (feature === 'GenHlth') return GENHLTH_LABELS[value] ?? String(value);
  if (feature === 'Income') return INCOME_LABELS[value] ?? `Tier ${value}`;
  if (feature === 'Education') {
    return EDUCATION_OPTIONS.find((o) => o.value === Number(value))?.label ?? String(value);
  }
  if (feature === 'Sex') return Number(value) === 1 ? 'Male' : 'Female';
  if (feature === 'BMI') return `${Number(value).toFixed(1)} kg/m²`;
  if (feature === 'MentHlth' || feature === 'PhysHlth') return `${value} days a month`;
  return Number(value) === 1 ? 'Yes' : 'No';
}

const ACTION_MAP = [
  [/^Control High Blood Pressure/i, 'Keep blood pressure in a healthy range'],
  [/^Control High Cholesterol/i, 'Keep cholesterol in a healthy range'],
  [/^Reduce BMI/i, 'Move toward a healthier weight'],
  [/^Stop History of Smoking/i, 'Stop smoking'],
  [/^Stop Heavy Alcohol/i, 'Cut back on heavy drinking'],
  [/^Adopt Regular Physical Activity/i, 'Add regular movement'],
  [/^Adopt Daily Fruit Intake/i, 'Eat fruit every day'],
  [/^Adopt Daily Vegetable Intake/i, 'Eat vegetables every day'],
];

export function friendlyAction(action) {
  const match = ACTION_MAP.find(([pattern]) => pattern.test(action));
  if (match) return match[1];
  if (/^Maintain/i.test(action)) return 'Keep up your current healthy habits';
  return action;
}

export function bmiBand(bmi) {
  const value = Number(bmi);
  if (value < 18.5) return { label: 'Underweight', tone: 'warn' };
  if (value < 25) return { label: 'Healthy weight', tone: 'good' };
  if (value < 30) return { label: 'Overweight', tone: 'warn' };
  return { label: 'Obesity', tone: 'risk' };
}
