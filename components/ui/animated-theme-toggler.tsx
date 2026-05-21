/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { motion } from "framer-motion";
import { useTheme } from "next-themes";
import { useCallback, useEffect, useRef, useState } from "react";
import { flushSync } from "react-dom";

import { cn } from "@/lib/utils";
import { Button } from "./button";
import { Kbd } from "./kbd";
import { Tooltip, TooltipContent, TooltipTrigger } from "./tooltip";

interface AnimatedThemeTogglerProps extends React.ComponentPropsWithoutRef<"button"> {
  duration?: number;
}

export const AnimatedThemeToggler = ({
  className,
  duration = 400,
  ...props
}: AnimatedThemeTogglerProps) => {
  const { setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [systemDark] = useState(
    () =>
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-color-scheme: dark)").matches
  );
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isDark = mounted ? resolvedTheme === "dark" : systemDark;

  const toggleTheme = useCallback(async () => {
    if (!buttonRef.current) return;

    const newTheme = isDark ? "light" : "dark";

    if (!document.startViewTransition) {
      setTheme(newTheme);
      return;
    }

    await document.startViewTransition(() => {
      flushSync(() => {
        setTheme(newTheme);
      });
    }).ready;

    const { top, left, width, height } =
      buttonRef.current.getBoundingClientRect();
    const x = left + width / 2;
    const y = top + height / 2;
    const maxRadius = Math.hypot(
      Math.max(left, window.innerWidth - left),
      Math.max(top, window.innerHeight - top)
    );

    document.documentElement.animate(
      {
        clipPath: [
          `circle(0px at ${x}px ${y}px)`,
          `circle(${maxRadius}px at ${x}px ${y}px)`,
        ],
      },
      {
        duration,
        easing: "ease-in-out",
        pseudoElement: "::view-transition-new(root)",
      }
    );
  }, [isDark, duration, setTheme]);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if ((e.key === "d" || e.key === "D") && !e.metaKey && !e.ctrlKey) {
        if (
          (e.target instanceof HTMLElement && e.target.isContentEditable) ||
          e.target instanceof HTMLInputElement ||
          e.target instanceof HTMLTextAreaElement ||
          e.target instanceof HTMLSelectElement
        ) {
          return;
        }

        e.preventDefault();
        toggleTheme();
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, [toggleTheme]);

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          ref={buttonRef}
          onClick={toggleTheme}
          className={cn(
            "relative rounded transition-all duration-300 active:scale-95",
            className
          )}
          variant="outline"
          size="sm"
          {...props}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
            fill="currentColor"
            strokeLinecap="round"
            viewBox="0 0 32 32"
          >
            <clipPath id="skiper-btn-2">
              <motion.path
                animate={{ y: isDark ? 10 : 0, x: isDark ? -12 : 0 }}
                transition={{ ease: "easeInOut", duration: 0.35 }}
                d="M0-5h30a1 1 0 0 0 9 13v24H0Z"
              />
            </clipPath>
            <g clipPath="url(#skiper-btn-2)">
              <motion.circle
                animate={{ r: isDark ? 10 : 8 }}
                transition={{ ease: "easeInOut", duration: 0.35 }}
                cx="16"
                cy="16"
              />
              <motion.g
                animate={{
                  rotate: isDark ? -100 : 0,
                  scale: isDark ? 0.5 : 1,
                  opacity: isDark ? 0 : 1,
                }}
                transition={{ ease: "easeInOut", duration: 0.35 }}
                stroke="currentColor"
                strokeWidth="1.5"
              >
                <path d="M16 5.5v-4" />
                <path d="M16 30.5v-4" />
                <path d="M1.5 16h4" />
                <path d="M26.5 16h4" />
                <path d="m23.4 8.6 2.8-2.8" />
                <path d="m5.7 26.3 2.9-2.9" />
                <path d="m5.8 5.8 2.8 2.8" />
                <path d="m23.4 23.4 2.9 2.9" />
              </motion.g>
            </g>
          </svg>
          <span className="sr-only">Toggle theme</span>
        </Button>
      </TooltipTrigger>
      <TooltipContent className="flex items-center gap-2">
        Switch to {isDark ? "Light" : "Dark"} <Kbd>D</Kbd>
      </TooltipContent>
    </Tooltip>
  );
};

/**
 * Theme Toggle Animations — React + Framer Motion Recreation
 * Inspired by and adapted from https://toggles.dev/ (Open Source CSS Theme Toggles by Alfie Jones)
 * This implementation is rebuilt in React and Framer Motion, avoiding external toggle packages.
 *
 * Attribution: https://toggles.dev/
 *
 * License & Usage:
 * - Free to use and modify in both personal and commercial projects.
 * - Attribution to Skiper UI is required when using the free version.
 * - No attribution required with Skiper UI Pro.
 *
 * Feedback and contributions are welcome.
 *
 * Author: @gurvinder-singh02
 * Website: https://gxuri.in
 * Twitter: https://x.com/Gur__vi
 * 
 
Animation by 
 
*/
