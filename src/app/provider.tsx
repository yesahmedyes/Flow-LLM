"use client";

import { ThemeProvider as NextThemesProvider, useTheme } from "next-themes";
import { TRPCReactProvider } from "~/trpc/react";
import { useUser } from "@clerk/nextjs";
import { useModelsStore } from "~/app/stores/modelsStore";
import { useEffect } from "react";
import { api } from "~/trpc/react";
import { useAgentStore, type Agent } from "./stores/agentStore";
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

  const {
    setPreferredModels,
    contentLoaded: modelsContentLoaded,
    setContentLoaded: setModelsContentLoaded,
  } = useModelsStore();

  const { setAgent, contentLoaded: agentContentLoaded, setContentLoaded: setAgentContentLoaded } = useAgentStore();

  // Query for models using tRPC
  const { data: modelsData } = api.prefs.getPreferredModels.useQuery(undefined, {
    enabled: !!user?.id && !modelsContentLoaded,
  });

  // Query for theme using tRPC
  const { data: themeData } = api.prefs.getTheme.useQuery(undefined, {
    enabled: !!user?.id && !theme,
  });

  const { data: agentData } = api.prefs.getAgentPreferences.useQuery(undefined, {
    enabled: !!user?.id && !agentContentLoaded,
  });

  useEffect(() => {
    const preferredModels = localStorage.getItem("preferredModels");
    const agentPreferences = localStorage.getItem("agentPreferences");

    if (preferredModels) {
      setPreferredModels(JSON.parse(preferredModels) as Model[]);
    }

    if (agentPreferences) {
      setAgent(JSON.parse(agentPreferences) as Agent);
    }
  }, []);

  useEffect(() => {
    if (modelsData && modelsData.length > 0) {
      setPreferredModels(modelsData as Model[]);

      setModelsContentLoaded(true);
    }
  }, [modelsData, setPreferredModels, setModelsContentLoaded]);

  useEffect(() => {
    if (themeData && ["light", "dark"].includes(themeData)) {
      setTheme(themeData);
    }
  }, [themeData, setTheme]);

  useEffect(() => {
    if (agentData && !agentContentLoaded && Object.keys(agentData).length > 0) {
      setAgent(agentData);

      setAgentContentLoaded(true);
    }
  }, [agentData, agentContentLoaded, setAgent, setAgentContentLoaded]);

  return children;
}

function ThemeProvider({ children, ...props }: React.ComponentProps<typeof NextThemesProvider>) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>;
}
