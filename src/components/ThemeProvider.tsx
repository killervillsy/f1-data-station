"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  applyThemePreference,
  isThemePreference,
  type ThemePreference,
} from "@/lib/theme";

type ThemeContextValue = {
  themePreference: ThemePreference;
  setThemePreference: (theme: ThemePreference) => void;
  mounted: boolean;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

function readThemePreference(): ThemePreference {
  try {
    const storedTheme = localStorage.getItem("theme");
    return isThemePreference(storedTheme) ? storedTheme : "system";
  } catch {
    return "system";
  }
}

export default function ThemeProvider({ children }: { children: ReactNode }) {
  const [themePreference, setThemePreferenceState] = useState<ThemePreference>("system");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    window.setTimeout(() => {
      setThemePreferenceState(readThemePreference());
      setMounted(true);
    }, 0);
  }, []);

  const value = useMemo<ThemeContextValue>(
    () => ({
      themePreference,
      mounted,
      setThemePreference(theme) {
        setThemePreferenceState(theme);
        applyThemePreference(theme);
      },
    }),
    [mounted, themePreference]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const context = useContext(ThemeContext);

  if (!context) {
    throw new Error("useTheme must be used within ThemeProvider");
  }

  return context;
}
