"use client";

import type { NodePopupContent, EdgePopupContent } from "~/lib/types/graph";
import { getNodeColor } from "~/lib/utils/nodeColors";
import { useTheme } from "next-themes";
import { useMemo } from "react";
import { Popover, PopoverTrigger } from "~/app/_components/ui/popover";
import { PopoverContent } from "~/app/_components/ui/popover";
import { Badge } from "~/app/_components/ui/badge";

interface GraphPopoversProps {
  showNodePopup: boolean;
  showEdgePopup: boolean;
  nodePopupContent: NodePopupContent | null;
  edgePopupContent: EdgePopupContent | null;
  onOpenChange?: (open: boolean) => void;
  labelColorMap?: Map<string, number>;
}

export function GraphPopovers({
  showNodePopup,
  showEdgePopup,
  nodePopupContent,
  edgePopupContent,
  onOpenChange,
  labelColorMap,
}: GraphPopoversProps) {
  const { resolvedTheme } = useTheme();
  const isDarkMode = resolvedTheme === "dark";

  const primaryNodeLabel = useMemo((): string | null => {
    if (!nodePopupContent) {
      return null;
    }

    const nodeAny = nodePopupContent.node as unknown as { primaryLabel: string };

    if (nodeAny.primaryLabel && typeof nodeAny.primaryLabel === "string") {
      return nodeAny.primaryLabel;
    }

    const primaryLabel = nodePopupContent.node.labels?.find((label) => label !== "Entity");

    return primaryLabel ?? "Entity";
  }, [nodePopupContent]);

  const labelColor = useMemo(() => {
    if (!primaryNodeLabel || !labelColorMap) return "";

    return getNodeColor(primaryNodeLabel, isDarkMode, labelColorMap);
  }, [primaryNodeLabel, isDarkMode, labelColorMap]);

  const attributesToDisplay = useMemo(() => {
    if (!nodePopupContent) {
      return [];
    }
    const entityProperties = Object.fromEntries(
      Object.entries(nodePopupContent.node.attributes ?? {}).filter(([key]) => key !== "labels"),
    );

    return Object.entries(entityProperties).map(([key, value]) => ({
      key,
      value: value as string | number | boolean | object,
    }));
  }, [nodePopupContent]);

  return (
    <div className="absolute top-4 right-4 z-50">
      <Popover open={showNodePopup} onOpenChange={onOpenChange}>
        <PopoverTrigger asChild>
          <div className="w-4 h-4 pointer-events-none" />
        </PopoverTrigger>
        <PopoverContent
          className="w-96 p-5 overflow-hidden"
          side="bottom"
          align="end"
          sideOffset={45}
          onOpenAutoFocus={(e) => e.preventDefault()}
        >
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between mb-1">
              <h4 className="font-medium leading-none">Node Details</h4>
            </div>
            <div className="flex flex-col gap-3">
              <p className="text-sm text-muted-foreground break-all leading-relaxed">
                <span className="text-sm text-black font-medium dark:text-white pr-2">Name:</span>
                {nodePopupContent?.node.name ?? "Unknown"}
              </p>

              {attributesToDisplay.length > 0 && (
                <>
                  {attributesToDisplay.map(({ key, value }) => (
                    <p key={key} className="text-sm leading-relaxed">
                      <span className="font-medium text-black dark:text-white pr-2">
                        {key.charAt(0).toUpperCase() + key.slice(1)}:
                      </span>
                      <span className="text-muted-foreground break-words">
                        {typeof value === "object" ? JSON.stringify(value) : String(value)}
                      </span>
                    </p>
                  ))}
                </>
              )}

              {nodePopupContent?.node.summary && (
                <p className="text-sm leading-relaxed">
                  <span className="font-medium text-black dark:text-white pr-2">Summary:</span>
                  <span className="text-muted-foreground break-words">{nodePopupContent.node.summary}</span>
                </p>
              )}

              {nodePopupContent?.node.labels?.length ? (
                <div className="flex flex-col gap-2">
                  <p className="text-sm font-medium text-black dark:text-white">Labels:</p>
                  <div className="flex flex-wrap gap-2">
                    {nodePopupContent.node.labels.map((label) => (
                      <Badge key={label} className="px-2 py-1" variant="secondary">
                        {label}
                      </Badge>
                    ))}
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        </PopoverContent>
      </Popover>

      <Popover open={showEdgePopup} onOpenChange={onOpenChange}>
        <PopoverTrigger asChild>
          <div className="w-4 h-4 pointer-events-none" />
        </PopoverTrigger>
        <PopoverContent
          className="w-80 overflow-hidden"
          side="bottom"
          align="end"
          sideOffset={5}
          onOpenAutoFocus={(e) => e.preventDefault()}
        >
          <div className="mb-4 p-2 bg-muted rounded-md">
            <p className="text-sm break-all">
              {edgePopupContent?.source.name ?? "Unknown"} →{" "}
              <span className="font-medium">{edgePopupContent?.relation.name ?? "Unknown"}</span> →{" "}
              {edgePopupContent?.target.name ?? "Unknown"}
            </p>
          </div>
          <div className="space-y-2">
            <h4 className="font-medium leading-none">Relationship</h4>
            <div className="grid gap-2">
              <p className="text-sm text-muted-foreground break-all">
                <span className="text-sm font-medium text-black dark:text-white mr-2">UUID:</span>
                {edgePopupContent?.relation.uuid ?? "Unknown"}
              </p>
              <p className="text-sm text-muted-foreground break-all">
                <span className="text-sm font-medium text-black dark:text-white mr-2">Type:</span>
                {edgePopupContent?.relation.name ?? "Unknown"}
              </p>
              {edgePopupContent?.relation.fact && (
                <p className="text-sm text-muted-foreground break-all">
                  <span className="text-sm font-medium text-black dark:text-white mr-2">Fact:</span>
                  {edgePopupContent.relation.fact}
                </p>
              )}
              {edgePopupContent?.relation.episodes?.length ? (
                <div>
                  <p className="text-sm font-medium text-black dark:text-white">Episodes:</p>
                  <div className="flex gap-2 mt-1">
                    {edgePopupContent.relation.episodes.map((episode) => (
                      <span key={episode} className="text-xs bg-muted px-2 py-1 rounded-md">
                        {episode}
                      </span>
                    ))}
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
