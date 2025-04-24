"use client";

import { ThemeProvider as NextThemesProvider, useTheme } from "next-themes";
import { TRPCReactProvider } from "~/trpc/react";
import { useUser } from "@clerk/nextjs";
import { useModelsStore } from "~/app/stores/modelsStore";
import { useEffect } from "react";
import { api } from "~/trpc/react";

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

  // Query for models using tRPC
  const { data: modelsData } = api.prefs.getPreferredModels.useQuery(undefined, {
    enabled: !!user?.id && preferredModels.length === 0,
  });

  // Query for theme using tRPC
  const { data: themeData } = api.prefs.getTheme.useQuery(undefined, {
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
