"use client";

import { Check, Copy, LoaderCircle } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import type { ReactNode } from "react";
import { useCallback, useEffect, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

type CopyButtonStatus = "idle" | "loading" | "success";

export interface CopyButtonProps extends Omit<
  React.ComponentProps<typeof Button>,
  "children" | "onClick"
> {
  text: string;
  onCopy?: () => Promise<void> | void;
  duration?: number;
  loadingDuration?: number;
  idleIcon?: ReactNode;
  loadingIcon?: ReactNode;
  successIcon?: ReactNode;
  labels?: Partial<Record<CopyButtonStatus, string>>;
  children?: ReactNode;
}

const defaultIcons = {
  idle: <Copy className="size-4" aria-hidden="true" />,
  loading: <LoaderCircle className="size-4 animate-spin" aria-hidden="true" />,
  success: <Check className="size-4" aria-hidden="true" />,
};

const defaultLabels: Record<CopyButtonStatus, string> = {
  idle: "Copy",
  loading: "Copying...",
  success: "Copied",
};

async function copyTextToClipboard(text: string) {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text);
    return;
  }

  const textarea = document.createElement("textarea");
  textarea.value = text;
  textarea.setAttribute("readonly", "true");
  textarea.style.position = "fixed";
  textarea.style.opacity = "0";
  document.body.appendChild(textarea);
  textarea.select();

  const copied = document.execCommand("copy");
  document.body.removeChild(textarea);

  if (!copied) {
    throw new Error("Unable to copy text to clipboard.");
  }
}

export function CopyButton({
  text,
  onCopy,
  duration = 2000,
  loadingDuration = 300,
  idleIcon = defaultIcons.idle,
  loadingIcon = defaultIcons.loading,
  successIcon = defaultIcons.success,
  labels = defaultLabels,
  disabled = false,
  className,
  variant = "outline",
  size = "icon",
  type = "button",
  children,
  ...props
}: CopyButtonProps) {
  const [status, setStatus] = useState<CopyButtonStatus>("idle");
  const shouldReduceMotion = useReducedMotion();
  const timeoutIds = useRef<ReturnType<typeof setTimeout>[]>([]);

  const clearTimers = useCallback(() => {
    timeoutIds.current.forEach((timeoutId) => clearTimeout(timeoutId));
    timeoutIds.current = [];
  }, []);

  useEffect(() => clearTimers, [clearTimers]);

  const handleCopy = useCallback(async () => {
    if (status !== "idle" || disabled) {
      return;
    }

    clearTimers();
    setStatus("loading");

    try {
      await copyTextToClipboard(text);
      await onCopy?.();

      const successTimeout = setTimeout(() => {
        setStatus("success");
      }, loadingDuration);

      const resetTimeout = setTimeout(() => {
        setStatus("idle");
      }, loadingDuration + duration);

      timeoutIds.current.push(successTimeout, resetTimeout);
    } catch {
      setStatus("idle");
    }
  }, [clearTimers, disabled, duration, loadingDuration, onCopy, status, text]);

  const icons = {
    idle: idleIcon,
    loading: loadingIcon,
    success: successIcon,
  };

  const ariaLabels = {
    idle: labels.idle ?? defaultLabels.idle,
    loading: labels.loading ?? defaultLabels.loading,
    success: labels.success ?? defaultLabels.success,
  };

  const buttonContent = (
    <AnimatePresence initial={false} mode="popLayout">
      <motion.span
        key={status}
        className="flex items-center justify-center"
        initial={
          shouldReduceMotion
            ? { opacity: 1 }
            : { opacity: 0, y: -16, filter: "blur(10px)" }
        }
        animate={
          shouldReduceMotion
            ? { opacity: 1 }
            : { opacity: 1, y: 0, filter: "blur(0px)" }
        }
        exit={
          shouldReduceMotion
            ? { opacity: 0, transition: { duration: 0 } }
            : { opacity: 0, y: 16, filter: "blur(10px)" }
        }
        transition={
          shouldReduceMotion
            ? { duration: 0 }
            : { type: "spring", duration: 0.25, bounce: 0 }
        }
      >
        {children !== undefined ? children : icons[status]}
      </motion.span>
    </AnimatePresence>
  );

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          aria-label={ariaLabels[status]}
          aria-live="polite"
          aria-atomic="true"
          data-state={status}
          className={cn("relative size-11 rounded-full", className)}
          disabled={status !== "idle" || disabled}
          onClick={handleCopy}
          variant={variant}
          size={size}
          type={type}
          {...props}
        >
          {buttonContent}
        </Button>
      </TooltipTrigger>
      <TooltipContent side="top">{ariaLabels[status]}</TooltipContent>
    </Tooltip>
  );
}

export default CopyButton;

/**
 * Inspiration: https://smoothui.dev/docs/components/button-copy
 *
 */
