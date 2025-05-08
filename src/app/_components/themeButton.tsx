"use client";

import { Moon, Sun, Sun1 } from "iconsax-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { api } from "~/trpc/react";

export function ThemeButton() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const changeThemeMutation = api.prefs.setTheme.useMutation();

  const handleThemeChange = async (newTheme: string) => {
    setTheme(newTheme);

    changeThemeMutation.mutate({ theme: newTheme });
  };

  if (!mounted) {
    return <div className="w-8 h-8 rounded-full flex items-center justify-center" />;
  }

  return (
    <>
      {theme === "light" ? (
        <div
          className="w-8 h-8 rounded-full flex items-center justify-center cursor-pointer bg-muted-foreground/10"
          onClick={() => void handleThemeChange("dark")}
        >
          <Moon size={18} className="stroke-foreground" />
        </div>
      ) : (
        <div
          className="w-8 h-8 rounded-full flex items-center justify-center cursor-pointer bg-muted-foreground/10"
          onClick={() => void handleThemeChange("light")}
        >
          <Sun1 size={18} className="stroke-foreground" />
        </div>
      )}
    </>
  );
}
