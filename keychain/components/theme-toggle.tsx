"use client"

import * as React from "react"
import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"
import { useState, useEffect } from "react";

import { Button } from "@/components/ui/button"

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false);

  // Set mounted to true after the component is mounted (client-side)
  useEffect(() => {
    setMounted(true);
  }, []);

  // Only render after mounting to prevent hydration errors
  if (!mounted) {
    return <div className="w-10 h-10" />; // Placeholder until the theme is set
  }

  return (
    <Button 
      variant="ghost"
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      size="icon"
    >
      {theme === "dark" ? (
        <Sun className="h-5 w-5" />
      ) : (
        <Moon className="h-5 w-5" />
      )}
    </Button>
  );
}
