/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { Check, Sparkles } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import {
  applyThemePreference,
  DEFAULT_THEME_PREFERENCE,
  readThemePreference,
  THEME_PRESETS,
  type ThemePreference,
  type ThemePresetKey,
  writeThemePreference,
} from "../theme-presets";

function ThemePreviewSwatch({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="flex flex-1 items-center gap-2 rounded-lg border border-border/70 bg-background/60 px-2 py-1">
      <span
        className="h-3 w-3 shrink-0 rounded-full border border-border/60 shadow-sm"
        style={{ backgroundColor: value }}
      />
      <span className="truncate text-[11px] font-medium text-muted-foreground">
        {label}
      </span>
    </div>
  );
}

function ThemeCard({
  theme,
  isActive,
  onSelect,
}: {
  theme: ThemePresetKey;
  isActive: boolean;
  onSelect: (theme: ThemePresetKey) => void;
}) {
  const preset = THEME_PRESETS[theme];
  const dark = document.documentElement.classList.contains("dark");
  const colors = dark ? preset.dark : preset.light;

  const swatches = useMemo(
    () =>
      [
        ["Primary", colors.primary],
        ["Foreground", colors.foreground],
        ["Background", colors.background],
      ] as const,
    [colors.primary, colors.foreground, colors.background]
  );

  return (
    <button
      type="button"
      onClick={() => onSelect(theme)}
      className={cn(
        "group relative overflow-hidden rounded-2xl border bg-card p-4 text-left transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        isActive
          ? "border-primary/70 ring-2 ring-primary/20"
          : "border-border/70"
      )}
    >
      <div className="absolute inset-x-0 top-0 h-1 bg-linear-to-r from-transparent via-border/60 to-transparent opacity-80" />

      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h3 className="text-base font-semibold tracking-tight">
              {preset.label}
            </h3>
            {theme === "claude" ? (
              <Badge variant="outline" size="sm" className="gap-1 rounded-full">
                <Sparkles className="size-4" />
                New
              </Badge>
            ) : null}
          </div>
          <p className="text-sm text-muted-foreground">{preset.description}</p>
        </div>

        <div
          className={cn(
            "flex h-8 w-8 items-center justify-center rounded-full border transition-colors",
            isActive ? "border-primary" : "border-border"
          )}
          style={{
            backgroundColor: isActive ? colors.primary : undefined,
            color: isActive ? colors.foreground : undefined,
          }}
        >
          <Check className="size-4" />
        </div>
      </div>

      <Card className="mt-4 rounded shadow-sm">
        <CardContent className="space-y-4">
          <div className="flex items-center gap-2">
            <div
              className="h-9 w-9 rounded-full border border-border/70"
              style={{ backgroundColor: colors.primary }}
            />
            <div className="flex-1 space-y-2">
              <div
                className="h-2.5 w-1/2 rounded-full"
                style={{ backgroundColor: colors.foreground, opacity: 0.8 }}
              />
              <div
                className="h-2 w-3/4 rounded-full"
                style={{ backgroundColor: colors.background }}
              />
            </div>
          </div>

          <div className="mt-3 flex sm:flex-row flex-col gap-2">
            {swatches.map(([label, value]) => (
              <ThemePreviewSwatch key={label} label={label} value={value} />
            ))}
          </div>
        </CardContent>
      </Card>
    </button>
  );
}

export function ThemesTab() {
  const [, startTransition] = useTransition();
  const [themePreference, setThemePreference] = useState<ThemePreference>(
    DEFAULT_THEME_PREFERENCE
  );

  useEffect(() => {
    const storedPreference = readThemePreference();
    if (!storedPreference) {
      setThemePreference({
        theme: "default",
      });
      return;
    }

    setThemePreference(storedPreference);
    applyThemePreference(storedPreference);
  }, []);

  const handleThemeChange = (theme: ThemePresetKey) => {
    startTransition(() => {
      const nextPreference: ThemePreference = {
        ...themePreference,
        theme,
      };

      setThemePreference(nextPreference);
      writeThemePreference(nextPreference);
      applyThemePreference(nextPreference);
    });
  };

  // mode control removed from this tab; global toggles handle mode changes

  return (
    <Card className="border-border/70 shadow-sm">
      <CardHeader className="border-b border-border/70 pb-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-1">
            <CardTitle className="text-xl tracking-tight">Themes</CardTitle>
            <CardDescription className="max-w-2xl text-sm leading-6">
              Choose between the default app look and the Claude preset, this is
              saved in your browser only.
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6 pt-6">
        <div className="grid gap-4 md:grid-cols-2">
          <ThemeCard
            theme="default"
            isActive={themePreference.theme === "default"}
            onSelect={handleThemeChange}
          />

          <ThemeCard
            theme="claude"
            isActive={themePreference.theme === "claude"}
            onSelect={handleThemeChange}
          />
        </div>
      </CardContent>
    </Card>
  );
}
