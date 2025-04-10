"use client";

import { useTheme } from "next-themes";

import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  const handleThemeChange = (checked: boolean) => {
    setTheme(checked ? "dark" : "light");
  };

  return (
    <div className="flex items-center space-x-2">
      <Label htmlFor="dark-mode">Dark Mode</Label>
      <Switch
        id="dark-mode"
        checked={theme === "dark"}
        onCheckedChange={handleThemeChange}
      />
    </div>
  );
}
