import { createTheme } from "@mui/material/styles";

const sharedTypography = {
  fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
  h1: {
    fontFamily: '"Montserrat", sans-serif',
    fontWeight: 800,
    fontSize: "2.5rem",
    lineHeight: 1.2,
  },
  h2: {
    fontFamily: '"Montserrat", sans-serif',
    fontWeight: 700,
    fontSize: "2rem",
    lineHeight: 1.3,
  },
  h3: {
    fontFamily: '"Montserrat", sans-serif',
    fontWeight: 700,
    fontSize: "1.5rem",
    lineHeight: 1.3,
  },
  h4: {
    fontFamily: '"Montserrat", sans-serif',
    fontWeight: 600,
    fontSize: "1.25rem",
    lineHeight: 1.4,
  },
  h5: {
    fontFamily: '"Montserrat", sans-serif',
    fontWeight: 600,
    fontSize: "1.1rem",
    lineHeight: 1.4,
  },
  h6: {
    fontFamily: '"Montserrat", sans-serif',
    fontWeight: 600,
    fontSize: "1rem",
    lineHeight: 1.4,
  },
  subtitle1: { fontWeight: 500, fontSize: "1rem" },
  body1: { fontSize: "0.95rem", lineHeight: 1.7 },
  button: {
    fontFamily: '"Montserrat", sans-serif',
    fontWeight: 600,
    textTransform: "none",
    letterSpacing: "0.01em",
  },
};

const sharedShape = { borderRadius: 12 };

const sharedShadowsLight = [
  "none",
  "0 1px 3px rgba(15, 23, 42, 0.06)",
  "0 2px 8px rgba(15, 23, 42, 0.08)",
  "0 4px 16px rgba(15, 23, 42, 0.10)",
  "0 6px 24px rgba(15, 23, 42, 0.12)",
  "0 8px 32px rgba(15, 23, 42, 0.14)",
  "0 12px 40px rgba(15, 23, 42, 0.16)",
  "0 16px 48px rgba(15, 23, 42, 0.18)",
  "0 20px 56px rgba(15, 23, 42, 0.20)",
  ...Array(16).fill("0 20px 56px rgba(15, 23, 42, 0.20)"),
];

const sharedShadowsDark = [
  "none",
  "0 1px 3px rgba(0, 0, 0, 0.4)",
  "0 2px 8px rgba(0, 0, 0, 0.45)",
  "0 4px 16px rgba(0, 0, 0, 0.5)",
  "0 6px 24px rgba(0, 0, 0, 0.55)",
  "0 8px 32px rgba(0, 0, 0, 0.6)",
  "0 12px 40px rgba(0, 0, 0, 0.65)",
  "0 16px 48px rgba(0, 0, 0, 0.7)",
  "0 20px 56px rgba(0, 0, 0, 0.75)",
  ...Array(16).fill("0 20px 56px rgba(0, 0, 0, 0.75)"),
];

const sharedComponents = (mode) => ({
  MuiButton: {
    styleOverrides: {
      root: {
        textTransform: "none",
        fontWeight: 600,
        borderRadius: 10,
        padding: "10px 24px",
        fontSize: "0.95rem",
        boxShadow: "none",
        "&:hover": {
          boxShadow: "0 4px 16px rgba(23, 92, 221, 0.35)",
          transform: "translateY(-1px)",
        },
        transition: "all 0.2s ease",
      },
      contained: {
        background: "linear-gradient(135deg, #175cdd 0%, #4a90e2 100%)",
        color: "#ffffff",
        "&:hover": {
          background: "linear-gradient(135deg, #0f4ba0 0%, #175cdd 100%)",
        },
      },
      outlined: {
        borderWidth: 2,
        borderColor: "rgba(23, 92, 221, 0.5)",
        "&:hover": { borderWidth: 2 },
      },
    },
  },
  MuiCard: {
    styleOverrides: {
      root: {
        borderRadius: 16,
        boxShadow:
          mode === "dark"
            ? "0 2px 12px rgba(0,0,0,0.4)"
            : "0 2px 12px rgba(0,0,0,0.06)",
        border:
          mode === "dark"
            ? "1px solid rgba(255,255,255,0.06)"
            : "1px solid rgba(0,0,0,0.04)",
        transition: "all 0.3s ease",
        "&:hover": {
          boxShadow:
            mode === "dark"
              ? "0 8px 30px rgba(0,0,0,0.55)"
              : "0 8px 30px rgba(0,0,0,0.10)",
        },
      },
    },
  },
  MuiPaper: {
    styleOverrides: {
      root: { borderRadius: 12 },
      elevation1: {
        boxShadow:
          mode === "dark"
            ? "0 2px 12px rgba(0,0,0,0.4)"
            : "0 2px 12px rgba(0,0,0,0.06)",
      },
    },
  },
  MuiChip: {
    styleOverrides: {
      root: {
        fontWeight: 600,
        borderRadius: 8,
        fontFamily: '"Montserrat", sans-serif',
      },
    },
  },
  MuiTextField: {
    styleOverrides: {
      root: {
        "& .MuiOutlinedInput-root": {
          borderRadius: 10,
          "&.Mui-focused fieldset": {
            borderColor: "#175cdd",
            borderWidth: 2,
          },
        },
        "& .MuiInputLabel-root.Mui-focused": { color: "#175cdd" },
      },
    },
  },
  MuiTableHead: {
    styleOverrides: {
      root: {
        "& .MuiTableCell-head": {
          fontWeight: 700,
          fontFamily: '"Montserrat", sans-serif',
          fontSize: "0.85rem",
          color: mode === "dark" ? "#e2e8f0" : "#112344",
          backgroundColor: mode === "dark" ? "#0f1a2e" : "#f8fafc",
          borderBottom:
            mode === "dark"
              ? "2px solid rgba(255,255,255,0.08)"
              : "2px solid #e2e8f0",
        },
      },
    },
  },
  MuiTableCell: {
    styleOverrides: {
      root: {
        borderBottom:
          mode === "dark"
            ? "1px solid rgba(255,255,255,0.06)"
            : "1px solid #f1f5f9",
        padding: "14px 16px",
      },
    },
  },
  MuiDialog: {
    styleOverrides: {
      paper: {
        borderRadius: 20,
        boxShadow:
          mode === "dark"
            ? "0 20px 60px rgba(0,0,0,0.6)"
            : "0 20px 60px rgba(0,0,0,0.15)",
      },
    },
  },
  MuiAvatar: {
    styleOverrides: {
      root: {
        fontFamily: '"Montserrat", sans-serif',
        fontWeight: 700,
      },
    },
  },
});

export const lightTheme = createTheme({
  palette: {
    mode: "light",
    primary: {
      main: "#175cdd",
      light: "#4a90e2",
      dark: "#0f4ba0",
      contrastText: "#ffffff",
    },
    secondary: {
      main: "#112344",
      light: "#2a3a5c",
      dark: "#0a1628",
      contrastText: "#ffffff",
    },
    background: { default: "#f4f8ff", paper: "#ffffff" },
    text: { primary: "#112344", secondary: "#3c4049" },
    success: { main: "#059669", light: "#d1fae5" },
    warning: { main: "#d97706", light: "#fef3c7" },
    error: { main: "#dc2626", light: "#fee2e2" },
    info: { main: "#0284c7", light: "#e0f2fe" },
  },
  typography: sharedTypography,
  shape: sharedShape,
  shadows: sharedShadowsLight,
  components: sharedComponents("light"),
});

export const darkTheme = createTheme({
  palette: {
    mode: "dark",
    primary: {
      main: "#3b82f6",
      light: "#60a5fa",
      dark: "#2563eb",
      contrastText: "#ffffff",
    },
    secondary: {
      main: "#94a3b8",
      light: "#cbd5e1",
      dark: "#64748b",
      contrastText: "#0b1220",
    },
    background: { default: "#0b1220", paper: "#0f1a2e" },
    text: { primary: "#e6edf6", secondary: "#9fb0c3" },
    divider: "rgba(255,255,255,0.08)",
    success: { main: "#10b981", light: "#064e3b" },
    warning: { main: "#f59e0b", light: "#451a03" },
    error: { main: "#ef4444", light: "#450a0a" },
    info: { main: "#38bdf8", light: "#082f49" },
  },
  typography: sharedTypography,
  shape: sharedShape,
  shadows: sharedShadowsDark,
  components: sharedComponents("dark"),
});

export function getTheme(mode) {
  return mode === "dark" ? darkTheme : lightTheme;
}

export default lightTheme;
