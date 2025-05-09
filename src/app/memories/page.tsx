"use client";

import { api } from "~/trpc/react";
import { useMemo, useRef, useState } from "react";
import { toGraphTriplets } from "~/lib/utils/graph";
import { createLabelColorMap } from "~/lib/utils/nodeColors";
import dynamic from "next/dynamic";
import type { GraphRef } from "./_components/graph";
import { Loader2 } from "lucide-react";
import type { NodePopupContent, EdgePopupContent } from "~/lib/types/graph";
import { GraphPopovers } from "./_components/popovers";
import { Textarea } from "../_components/ui/textarea";
import { toast } from "sonner";
import { utils } from "prettier/doc.js";

// Dynamically import the Graph component with SSR disabled
const Graph = dynamic(() => import("./_components/graph").then((mod) => mod.Graph), {
  ssr: false,
});

export default function MemoriesPage() {
  const { data: triplets, isLoading } = api.memory.getGraphTriplets.useQuery();

  const graphTriplets = useMemo(() => toGraphTriplets(triplets?.triplets ?? []), [triplets]);

  const graphRef = useRef<GraphRef>(null);

  const allLabels = useMemo(() => {
    const labels = new Set<string>();

    labels.add("Entity");

    graphTriplets.forEach((triplet) => {
      if (triplet.source.primaryLabel) labels.add(triplet.source.primaryLabel);
      if (triplet.target.primaryLabel) labels.add(triplet.target.primaryLabel);
    });

    return Array.from(labels).sort((a, b) => {
      if (a === "Entity") return -1;
      if (b === "Entity") return 1;

      return a.localeCompare(b);
    });
  }, [graphTriplets]);

  const sharedLabelColorMap = useMemo(() => {
    return createLabelColorMap(allLabels);
  }, [allLabels]);

  const [showNodePopup, setShowNodePopup] = useState<boolean>(false);
  const [showEdgePopup, setShowEdgePopup] = useState<boolean>(false);
  const [nodePopupContent, setNodePopupContent] = useState<NodePopupContent | null>(null);
  const [edgePopupContent, setEdgePopupContent] = useState<EdgePopupContent | null>(null);

  const handleNodeClick = (nodeId: string) => {
    // Find the triplet that contains this node
    const triplet = triplets?.triplets.find((t) => t.sourceNode.uuid === nodeId || t.targetNode.uuid === nodeId);

    if (!triplet) return;

    // Determine which node was clicked (source or target)
    const node = triplet.sourceNode.uuid === nodeId ? triplet.sourceNode : triplet.targetNode;

    // Set popup content and show the popup
    setNodePopupContent({
      id: nodeId,
      node: node,
    });
    setShowNodePopup(true);
    setShowEdgePopup(false);
  };

  // Handle edge click
  const handleEdgeClick = (edgeId: string) => {
    // Find the triplet that contains this edge
    const triplet = triplets?.triplets.find((t) => t.edge.uuid === edgeId);

    if (!triplet) return;

    // Set popup content and show the popup
    setEdgePopupContent({
      id: edgeId,
      source: triplet.sourceNode,
      target: triplet.targetNode,
      relation: triplet.edge,
    });
    setShowEdgePopup(true);
    setShowNodePopup(false);
  };

  // Handle popover close
  const handlePopoverClose = () => {
    setShowNodePopup(false);
    setShowEdgePopup(false);
  };

  const addMemoryMutation = api.memory.addMemoryToGraph.useMutation({
    onMutate: () => {
      toast.info("New memory is being added.");
    },
    onSuccess: () => {
      toast.info("Refresh the page in a few minutes to see the updated graph.");
    },
  });

  const [newMemory, setNewMemory] = useState<string>("");

  const handleSubmit = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();

      addMemoryMutation.mutate({ memory: newMemory });

      setNewMemory("");
    }
  };

  return (
    <div className="flex w-full mx-auto flex-col items-center h-full">
      {isLoading ? (
        <div className="flex justify-center items-center h-full w-full pb-12">
          <Loader2 className="w-10 h-10 animate-spin" />
        </div>
      ) : (
        <>
          {graphTriplets.length > 0 ? (
            <>
              <Graph
                ref={graphRef}
                triplets={graphTriplets}
                width={window.innerWidth}
                height={window.innerHeight - 60}
                onNodeClick={handleNodeClick}
                onEdgeClick={handleEdgeClick}
                onBlur={handlePopoverClose}
                zoomOnMount={true}
                labelColorMap={sharedLabelColorMap}
              />

              <GraphPopovers
                showNodePopup={showNodePopup}
                showEdgePopup={showEdgePopup}
                nodePopupContent={nodePopupContent}
                edgePopupContent={edgePopupContent}
                onOpenChange={handlePopoverClose}
              />
            </>
          ) : (
            <div className="flex justify-center items-center h-full w-full pb-20">
              <p className="text-sm text-muted-foreground">No memories found</p>
            </div>
          )}

          <div className={`fixed flex flex-col items-center w-full bottom-12`}>
            <div
              className={`flex flex-col justify-between rounded-2xl border bg-background border-foreground/10 px-2 py-2 w-4xl`}
            >
              <div className="flex items-center">
                <Textarea
                  placeholder="Ask New Memory"
                  className={`border-none focus-visible:ring-0 pr-6`}
                  value={newMemory}
                  onChange={(e) => setNewMemory(e.target.value)}
                  onKeyDown={handleSubmit}
                />
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
