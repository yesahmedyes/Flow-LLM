"use client";

import { ThemeProvider as NextThemesProvider, useTheme } from "next-themes";
import { TRPCReactProvider } from "~/trpc/react";
import { useUser } from "@clerk/nextjs";
import { useModelsStore } from "~/app/stores/modelsStore";
import { useEffect } from "react";

export default function Provider({ children }: { children: React.ReactNode }) {
  const { theme, setTheme } = useTheme();

  const { user } = useUser();
  const { preferredModels, setPreferredModels } = useModelsStore();

  const fetchModels = async () => {
    if (user?.id && preferredModels.length === 0) {
      const res = await fetch("/api/prefs/models");

      if (res.ok) {
        const models = (await res.json()) as string[] | null;

        if (models) {
          setPreferredModels(models);
        }
      }
    }
  };

  const fetchTheme = async () => {
    if (user?.id && !theme) {
      const res = await fetch("/api/prefs/theme");

      if (res.ok) {
        const theme = (await res.json()) as string | null;

        if (theme && ["light", "dark"].includes(theme)) {
          setTheme(theme);
        }
      }
    }
  };

  useEffect(() => {
    void fetchModels();
    void fetchTheme();
  }, [user]);

  return (
    <TRPCReactProvider>
      <ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>
        {children}
      </ThemeProvider>
    </TRPCReactProvider>
  );
}

function ThemeProvider({ children, ...props }: React.ComponentProps<typeof NextThemesProvider>) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>;
}
