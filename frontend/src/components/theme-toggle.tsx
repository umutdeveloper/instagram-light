"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useLocalStorage } from "../hooks/use-localstorage";

type Theme = "light" | "dark" | "system";

export function ThemeToggle() {
  const [theme, setTheme] = useLocalStorage<Theme>("theme", "system");


  useEffect(() => {
    const root = document.documentElement;

    if (theme === "system") {
      localStorage.removeItem("theme");
      const systemTheme = window.matchMedia("(prefers-color-scheme: dark)")
        .matches
        ? "dark"
        : "light";
      root.className = systemTheme;
    } else {
      localStorage.setItem("theme", theme);
      root.className = theme;
    }
  }, [theme]);

  const cycleTheme = () => {
    setTheme((current) => {
      if (current === "light") return "dark";
      else return "light";
    });
  };

  const getIcon = () => {
    if (theme === "light") return "☀️";
    else return "🌙";
  };

  return (
    <Button
      variant="outline"
      size="icon"
      onClick={cycleTheme}
      aria-label="Toggle theme"
    >
      <span>{getIcon()}</span>
    </Button>
  );
}
