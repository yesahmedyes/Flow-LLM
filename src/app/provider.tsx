"use client";

import { ThemeProvider as NextThemesProvider, useTheme } from "next-themes";
import { TRPCReactProvider } from "~/trpc/react";
import { useUser } from "@clerk/nextjs";
import { useModelsStore } from "~/app/stores/modelsStore";
import { useEffect } from "react";
import { api } from "~/trpc/react";
import { useAgentStore } from "./stores/agentStore";
import type { Model } from "~/lib/types/model";

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
  const { setAgent, contentLoaded, setContentLoaded } = useAgentStore();

  // Query for models using tRPC
  const { data: modelsData } = api.prefs.getPreferredModels.useQuery(undefined, {
    enabled: !!user?.id && preferredModels.length === 0,
  });

  // Query for theme using tRPC
  const { data: themeData } = api.prefs.getTheme.useQuery(undefined, {
    enabled: !!user?.id && !theme,
  });

  const { data: agentData } = api.prefs.getAgentPreferences.useQuery(undefined, {
    enabled: !!user?.id && !contentLoaded,
  });

  useEffect(() => {
    if (modelsData && modelsData.length > 0) {
      setPreferredModels(modelsData as Model[]);
    }
  }, [modelsData, setPreferredModels]);

  useEffect(() => {
    if (themeData && ["light", "dark"].includes(themeData)) {
      setTheme(themeData);
    }
  }, [themeData, setTheme]);

  useEffect(() => {
    if (agentData && !contentLoaded && Object.keys(agentData).length > 0) {
      setAgent(agentData);

      setContentLoaded(true);
    }
  }, [agentData, contentLoaded, setAgent, setContentLoaded]);

  return children;
}

function ThemeProvider({ children, ...props }: React.ComponentProps<typeof NextThemesProvider>) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>;
}
