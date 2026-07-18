import { createContext, useContext, useEffect, useState, useCallback } from "react";

const STORAGE_KEY = "medisys-theme-mode";

let currentMode = "light";

const getStoredMode = () => {
  if (typeof window === "undefined") return "light";
  const stored = window.localStorage.getItem(STORAGE_KEY);
  if (stored === "light" || stored === "dark") return stored;
  if (
    window.matchMedia &&
    window.matchMedia("(prefers-color-scheme: dark)").matches
  ) {
    return "dark";
  }
  return "light";
};

export const getMode = () => currentMode;

const ThemeContext = createContext({
  mode: "light",
  toggleTheme: () => {},
  setMode: () => {},
});

export function ThemeModeProvider({ children }) {
  const [mode, setModeState] = useState(getStoredMode);

  useEffect(() => {
    currentMode = mode;
    window.localStorage.setItem(STORAGE_KEY, mode);
    const root = document.documentElement;
    root.setAttribute("data-theme", mode);
    root.style.colorScheme = mode;
  }, [mode]);

  const setMode = useCallback((next) => {
    setModeState(next === "dark" ? "dark" : "light");
  }, []);

  const toggleTheme = useCallback(() => {
    setModeState((prev) => (prev === "dark" ? "light" : "dark"));
  }, []);

  return (
    <ThemeContext.Provider value={{ mode, toggleTheme, setMode }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useThemeMode() {
  return useContext(ThemeContext);
}

export default ThemeContext;
