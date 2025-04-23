"use client";

import { ThemeProvider as NextThemesProvider, useTheme } from "next-themes";
import { TRPCReactProvider } from "~/trpc/react";
import { useUser } from "@clerk/nextjs";
import { useModelsStore } from "~/app/stores/modelsStore";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { extractRouterConfig } from "uploadthing/server";
import { NextSSRPlugin } from "@uploadthing/react/next-ssr-plugin";
import { ourFileRouter } from "~/app/api/uploadthing/core";

export default function Provider({ children }: { children: React.ReactNode }) {
  return (
    <TRPCReactProvider>
      <PreferencesProvider>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>
          {children}
        </ThemeProvider>
      </PreferencesProvider>
    </TRPCReactProvider>
  );
}

function PreferencesProvider({ children }: { children: React.ReactNode }) {
  const { theme, setTheme } = useTheme();
  const { user } = useUser();
  const { preferredModels, setPreferredModels } = useModelsStore();

  // Query for models
  const { data: modelsData } = useQuery({
    queryKey: ["preferredModels", user?.id],
    queryFn: async () => {
      const res = await fetch("/api/prefs/models");

      if (!res.ok) throw new Error("Failed to fetch models");

      return res.json() as Promise<string[] | null>;
    },
    enabled: !!user?.id && preferredModels.length === 0,
  });

  // Query for theme
  const { data: themeData } = useQuery({
    queryKey: ["preferredTheme", user?.id],
    queryFn: async () => {
      const res = await fetch("/api/prefs/theme");

      if (!res.ok) throw new Error("Failed to fetch theme");

      return res.json() as Promise<string | null>;
    },
    enabled: !!user?.id && !theme,
  });

  useEffect(() => {
    if (modelsData) {
      setPreferredModels(modelsData);
    }
  }, [modelsData, setPreferredModels]);

  useEffect(() => {
    if (themeData && ["light", "dark"].includes(themeData)) {
      setTheme(themeData);
    }
  }, [themeData, setTheme]);

  return children;
}

function ThemeProvider({ children, ...props }: React.ComponentProps<typeof NextThemesProvider>) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>;
}
