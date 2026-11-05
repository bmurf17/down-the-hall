"use client";

import { Monitor, Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

type Theme = "light" | "dark" | "system";

const STORAGE_KEY = "down-the-hall:theme";
const THEMES: Theme[] = ["system", "light", "dark"];
const LABELS: Record<Theme, string> = {
  system: "System",
  light: "Light",
  dark: "Dark",
};
const ICONS = {
  system: Monitor,
  light: Sun,
  dark: Moon,
};

function applyTheme(theme: Theme) {
  const shouldUseDark =
    theme === "dark" ||
    (theme === "system" &&
      window.matchMedia("(prefers-color-scheme: dark)").matches);

  document.documentElement.classList.toggle("dark", shouldUseDark);
  document.documentElement.dataset.theme = theme;
  document.documentElement.style.colorScheme = shouldUseDark ? "dark" : "light";
}

export function ThemeToggle({
  className,
  showLabel = false,
}: {
  className?: string;
  showLabel?: boolean;
}) {
  const [theme, setTheme] = useState<Theme>("system");

  useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    const initial = THEMES.includes(stored as Theme)
      ? (stored as Theme)
      : "system";
    setTheme(initial);
    applyTheme(initial);
  }, []);

  useEffect(() => {
    if (theme !== "system") return;

    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => applyTheme("system");
    media.addEventListener("change", onChange);
    return () => media.removeEventListener("change", onChange);
  }, [theme]);

  const cycleTheme = () => {
    const next = THEMES[(THEMES.indexOf(theme) + 1) % THEMES.length];
    setTheme(next);
    window.localStorage.setItem(STORAGE_KEY, next);
    applyTheme(next);
  };

  const Icon = ICONS[theme];

  return (
    <button
      type="button"
      onClick={cycleTheme}
      title={`Theme: ${LABELS[theme]}`}
      aria-label={`Theme: ${LABELS[theme]}. Switch to ${
        LABELS[THEMES[(THEMES.indexOf(theme) + 1) % THEMES.length]]
      }.`}
      className={cn(
        "flex min-h-11 min-w-11 items-center justify-center gap-2 rounded-lg px-3 text-sm font-medium transition-colors",
        className
      )}
    >
      <Icon className="size-5" aria-hidden />
      <span className={showLabel ? "inline" : "sr-only"}>{LABELS[theme]}</span>
    </button>
  );
}
