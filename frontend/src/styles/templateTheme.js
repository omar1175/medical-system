// Template theme tokens extracted from Clinic Bootstrap Template.
// Exposes light + dark variants. `templateColors` is a live proxy that
// resolves to the active theme at access time, so existing static usages
// (e.g. `templateColors.accent`) automatically follow the current mode.
// Inside components, prefer `useTemplateColors()` for reactivity.
import { getMode, useThemeMode } from "../context/ThemeModeContext";

export const lightTemplateColors = {
  background: "#ffffff",
  default: "#3c4049",
  heading: "#112344",
  accent: "#175cdd",
  accentHover: "#0f4ba0",
  surface: "#ffffff",
  contrast: "#ffffff",
  lightBg: "#f4f8ff",
  darkBg: "#021418",
  nav: "#3c4049",
  navHover: "#175cdd",
  navMobileBg: "#ffffff",
  navMobileColor: "#112344",
  navDropdownBg: "#ffffff",
  navDropdownColor: "#3c4049",
  navDropdownHover: "#175cdd",
  border: "#e2e8f0",
  borderSoft: "#f1f5f9",
  muted: "#64748b",
};

export const darkTemplateColors = {
  background: "#0f1a2e",
  default: "#9fb0c3",
  heading: "#f1f5f9",
  accent: "#3b82f6",
  accentHover: "#2563eb",
  surface: "#0f1a2e",
  contrast: "#e6edf6",
  lightBg: "#0b1220",
  darkBg: "#021418",
  nav: "#cbd5e1",
  navHover: "#60a5fa",
  navMobileBg: "#0f1a2e",
  navMobileColor: "#e6edf6",
  navDropdownBg: "#0f1a2e",
  navDropdownColor: "#cbd5e1",
  navDropdownHover: "#60a5fa",
  border: "rgba(255,255,255,0.1)",
  borderSoft: "rgba(255,255,255,0.06)",
  muted: "#7c8aa0",
};

const variants = { light: lightTemplateColors, dark: darkTemplateColors };

export const templateColors = new Proxy(
  {},
  {
    get: (_t, prop) => variants[getMode()][prop],
  }
);

export function useTemplateColors() {
  const { mode } = useThemeMode();
  return mode === "dark" ? darkTemplateColors : lightTemplateColors;
}

export const templateFonts = {
  default: '"Roboto", system-ui, -apple-system, sans-serif',
  heading: '"Montserrat", sans-serif',
  nav: '"Lato", sans-serif',
};

export const templateShadows = {
  card: "0 2px 12px rgba(0,0,0,0.08)",
  cardHover: "0 8px 24px rgba(0,0,0,0.12)",
  navbar: "0 2px 20px rgba(0,0,0,0.08)",
};

export const pageTitleStyles = {
  wrapper: {
    background: "linear-gradient(135deg, #021418 0%, #11262a 100%)",
    color: "#fff",
    py: { xs: 6, md: 8 },
    textAlign: "center",
    position: "relative",
    overflow: "hidden",
    "&::before": {
      content: '""',
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: "url(/assets/img/bg/abstract-bg-3.webp) center/cover",
      opacity: 0.05,
    },
  },
  title: {
    fontFamily: templateFonts.heading,
    fontWeight: 800,
    fontSize: { xs: "2rem", md: "3rem" },
    color: "#fff",
    position: "relative",
    zIndex: 1,
  },
  subtitle: {
    color: "rgba(255,255,255,0.8)",
    maxWidth: 600,
    mx: "auto",
    mt: 2,
    fontSize: "1rem",
    position: "relative",
    zIndex: 1,
  },
};
