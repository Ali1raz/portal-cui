export type ThemePresetKey = "default" | "claude";

export type ThemeColorVars = {
  primary: string;
  foreground: string;
  background: string;
};

export interface ThemePreset {
  id: ThemePresetKey;
  label: string;
  description: string;
  light: ThemeColorVars;
  dark: ThemeColorVars;
}

export interface ThemePreference {
  theme: ThemePresetKey;
}

export const THEME_PREFERENCE_STORAGE_KEY = "theme-preference";

export const THEME_PRESETS: Record<ThemePresetKey, ThemePreset> = {
  default: {
    id: "default",
    label: "Default",
    description: "Uses the app's built-in design tokens.",
    light: {
      primary: "oklch(0.488 0.243 264.376)",
      foreground: "oklch(0.145 0 0)",
      background: "oklch(1 0 0)",
    },
    dark: {
      primary: "oklch(0.424 0.199 265.638)",
      foreground: "oklch(0.985 0 0)",
      background: "oklch(0.145 0 0)",
    },
  },
  claude: {
    id: "claude",
    label: "Claude",
    description: "Warm neutral surfaces with terracotta accents.",
    light: {
      primary: "oklch(0.6171 0.1375 39.0427)",
      foreground: "oklch(0.3438 0.0269 95.7226)",
      background: "oklch(0.9818 0.0054 95.0986)",
    },
    dark: {
      primary: "oklch(0.6724 0.1308 38.7559)",
      foreground: "oklch(0.8074 0.0142 93.0137)",
      background: "oklch(0.2679 0.0036 106.6427)",
    },
  },
};

export const DEFAULT_THEME_PREFERENCE: ThemePreference = {
  theme: "default",
};

export function readThemePreference(): ThemePreference | null {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const stored = window.localStorage.getItem(THEME_PREFERENCE_STORAGE_KEY);
    if (!stored) return null;

    const parsed = JSON.parse(stored) as Partial<ThemePreference>;
    if (parsed.theme !== "default" && parsed.theme !== "claude") return null;

    return {
      theme: parsed.theme,
    };
  } catch {
    return null;
  }
}

export function writeThemePreference(preference: ThemePreference) {
  window.localStorage.setItem(
    THEME_PREFERENCE_STORAGE_KEY,
    JSON.stringify(preference)
  );
}
export function applyThemePreference(preference: ThemePreference) {
  if (typeof document === "undefined") return;

  const root = document.documentElement;

  if (preference.theme === "default") {
    root.removeAttribute("data-theme");
  } else {
    root.setAttribute("data-theme", preference.theme);
  }
}
