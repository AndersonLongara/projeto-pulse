"use client";

import { useState } from "react";
import { useTheme } from "next-themes";
import { updateTheme } from "@/lib/actions/settings";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Sun, Moon, Monitor, Check } from "@phosphor-icons/react/dist/ssr";
import { useRouter } from "next/navigation";

interface ThemeSelectProps {
  initialTheme: string;
}

export function ThemeSelect({ initialTheme }: ThemeSelectProps) {
  const { setTheme } = useTheme();
  const [currentTheme, setCurrentTheme] = useState(initialTheme);
  const [saving, setSaving] = useState(false);
  const router = useRouter();

  const handleThemeChange = async (newTheme: string) => {
    setSaving(true);
    setCurrentTheme(newTheme);
    setTheme(newTheme);

    const result = await updateTheme({ theme: newTheme as "system" | "light" | "dark" });

    if (result.error) {
      console.error("Failed to save theme:", result.error);
    } else {
      router.refresh();
    }

    setSaving(false);
  };

  return (
    <div className="flex items-center gap-3">
      <Select value={currentTheme} onValueChange={handleThemeChange} disabled={saving}>
        <SelectTrigger className="w-40">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="light">
            <div className="flex items-center gap-2">
              <Sun className="h-4 w-4" weight="duotone" />
              <span>Claro</span>
            </div>
          </SelectItem>
          <SelectItem value="dark">
            <div className="flex items-center gap-2">
              <Moon className="h-4 w-4" weight="duotone" />
              <span>Escuro</span>
            </div>
          </SelectItem>
          <SelectItem value="system">
            <div className="flex items-center gap-2">
              <Monitor className="h-4 w-4" weight="duotone" />
              <span>Sistema</span>
            </div>
          </SelectItem>
        </SelectContent>
      </Select>
      {saving && (
        <div className="text-xs text-slate-500">Salvando...</div>
      )}
      {!saving && (
        <Check className="h-4 w-4 text-green-600" weight="bold" />
      )}
    </div>
  );
}
