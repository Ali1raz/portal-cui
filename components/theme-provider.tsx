"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";
import * as React from "react";

import {
  applyThemePreference,
  DEFAULT_THEME_PREFERENCE,
  readThemePreference,
} from "@/app/(user)/profile/theme-presets";

export function ThemeProvider({
  children,
  ...props
}: React.ComponentProps<typeof NextThemesProvider>) {
  React.useEffect(() => {
    const preference = readThemePreference();
    if (preference) {
      applyThemePreference(preference);
    } else {
      applyThemePreference({
        ...DEFAULT_THEME_PREFERENCE,
      });
    }

    const handleStorageChange = (event: StorageEvent) => {
      if (event.key !== "theme-preference") return;

      const nextPreference = readThemePreference();
      if (nextPreference) {
        applyThemePreference(nextPreference);
      } else {
        applyThemePreference({
          ...DEFAULT_THEME_PREFERENCE,
        });
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  return <NextThemesProvider {...props}>{children}</NextThemesProvider>;
}
