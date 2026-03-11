// src/providers/ThemeProvider.tsx
import { ThemeProvider as ReStyleProvider } from "@shopify/restyle";
import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { useColorScheme } from "react-native";
import { createAppTheme, DarkPalette, LightPalette } from "../theme";

type Mode = "light" | "dark";

type ThemeModeContextValue = {
  mode: Mode;
  toggle: () => void;
};

const ThemeModeContext = createContext<ThemeModeContextValue | undefined>(
  undefined,
);

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const systemScheme = useColorScheme(); // "light" | "dark" | null
  const [mode, setMode] = useState<Mode>("light");

  // Sync with system theme
  useEffect(() => {
    if (systemScheme === "light" || systemScheme === "dark") {
      setMode(systemScheme);
    }
  }, [systemScheme]);

  const theme =
    mode === "light"
      ? createAppTheme(LightPalette)
      : createAppTheme(DarkPalette);

  const toggle = () => setMode((m) => (m === "light" ? "dark" : "light"));

  return (
    <ThemeModeContext.Provider value={{ mode, toggle }}>
      <ReStyleProvider theme={theme}>{children}</ReStyleProvider>
    </ThemeModeContext.Provider>
  );
};

export const useThemeMode = () => {
  const ctx = useContext(ThemeModeContext);
  if (!ctx) {
    throw new Error("useThemeMode must be used within ThemeProvider");
  }
  return ctx;
};
