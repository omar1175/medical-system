// Curated gradient palette for MediSys — Clinic template aligned (blue/teal family).
// These mirror the CSS custom properties in src/styles/tokens.css so shared
// components can reference them directly inside MUI `sx` without var() quoting issues.

export const BRAND_GRADIENT = "linear-gradient(135deg, #175cdd 0%, #4a90e2 100%)";
export const BRAND_GRADIENT_DARK =
  "linear-gradient(135deg, #0c1445 0%, #1a237e 50%, #175cdd 100%)";
export const ACCENT_GRADIENT_TEAL =
  "linear-gradient(135deg, #0ea5e9 0%, #22d3ee 100%)";
export const ACCENT_GRADIENT_GREEN =
  "linear-gradient(135deg, #059669 0%, #10b981 100%)";
export const ACCENT_GRADIENT_INDIGO =
  "linear-gradient(135deg, #1e3a8a 0%, #175cdd 100%)";
export const ACCENT_GRADIENT_AMBER =
  "linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%)";

export const gradients = {
  blue: BRAND_GRADIENT,
  dark: BRAND_GRADIENT_DARK,
  teal: ACCENT_GRADIENT_TEAL,
  green: ACCENT_GRADIENT_GREEN,
  indigo: ACCENT_GRADIENT_INDIGO,
  amber: ACCENT_GRADIENT_AMBER,
};

export const statGradients = [
  BRAND_GRADIENT,
  BRAND_GRADIENT_DARK,
  ACCENT_GRADIENT_TEAL,
  ACCENT_GRADIENT_GREEN,
  ACCENT_GRADIENT_INDIGO,
  ACCENT_GRADIENT_AMBER,
];

export default gradients;
