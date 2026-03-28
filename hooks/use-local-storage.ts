/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useEffect, useState, useCallback } from "react";

function isBrowser(): boolean {
  return typeof window !== "undefined";
}

export function useLocalStorage<T>(key: string, initialValue: T) {
  const [storedValue, setStoredValue] = useState<T>(initialValue);

  // Sync from storage on mount and key change
  useEffect(() => {
    if (!isBrowser()) return;
    try {
      const item = window.localStorage.getItem(key);
      setStoredValue(item ? (JSON.parse(item) as T) : initialValue);
    } catch {
      setStoredValue(initialValue);
    }
  }, [key]); // eslint-disable-line react-hooks/exhaustive-deps

  // Persist to storage on value change
  useEffect(() => {
    if (!isBrowser()) return;
    try {
      window.localStorage.setItem(key, JSON.stringify(storedValue));
    } catch {}
  }, [key, storedValue]);

  // Cross-tab sync
  useEffect(() => {
    if (!isBrowser()) return;

    const handler = (e: StorageEvent) => {
      if (e.key !== key) return;
      try {
        setStoredValue(
          e.newValue ? (JSON.parse(e.newValue) as T) : initialValue
        );
      } catch {
        setStoredValue(initialValue);
      }
    };

    window.addEventListener("storage", handler);
    return () => window.removeEventListener("storage", handler);
  }, [key, initialValue]);

  const removeValue = useCallback(() => {
    if (!isBrowser()) return;
    window.localStorage.removeItem(key);
    setStoredValue(initialValue);
  }, [key, initialValue]);

  return [storedValue, setStoredValue, removeValue] as const;
}
