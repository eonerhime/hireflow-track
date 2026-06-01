"use client";

import { useState, useEffect } from "react";

function getInitialTheme(): boolean {
  if (typeof window === "undefined") return false;
  const stored = localStorage.getItem("theme");
  if (stored) return stored === "dark";
  return window.matchMedia("(prefers-color-scheme: dark)").matches;
}

export default function ThemeToggle() {
  const [isDark, setIsDark] = useState(getInitialTheme);

  useEffect(() => {
    // Only side-effect: sync the DOM class with current state
    document.documentElement.classList.toggle("dark", isDark);
  }, [isDark]);

  const toggle = () => {
    const next = !isDark;
    setIsDark(next);
    localStorage.setItem("theme", next ? "dark" : "light");
  };

  return (
    <button
      onClick={toggle}
      aria-label="Toggle dark mode"
      className="rounded-md border border-gray-300 bg-white dark:bg-gray-800
                 dark:border-gray-600 px-4 py-2 text-sm font-medium
                 text-gray-600 dark:text-gray-300 hover:bg-gray-50
                 dark:hover:bg-gray-700 transition-colors"
    >
      {isDark ? "☀️ Light" : "🌙 Dark"}
    </button>
  );
}
