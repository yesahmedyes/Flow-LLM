"use client";

import { useMemo, useRef, useState } from "react";
import { toGraphTriplets } from "~/lib/utils/graph";
import { createLabelColorMap } from "~/lib/utils/nodeColors";
import dynamic from "next/dynamic";
import type { GraphRef } from "./graph";
import { Loader2 } from "lucide-react";
import type { NodePopupContent, EdgePopupContent, RawTriplet } from "~/lib/types/graph";
import { GraphPopovers } from "./popovers";

const Graph = dynamic(() => import("./graph").then((mod) => mod.Graph), {
  ssr: false,
});

interface GraphPageProps {
  triplets: RawTriplet[];
  isLoading: boolean;
}

export function GraphPage({ triplets, isLoading }: GraphPageProps) {
  const graphTriplets = useMemo(() => toGraphTriplets(triplets), [triplets]);

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
    const triplet = triplets.find((t) => t.sourceNode.uuid === nodeId || t.targetNode.uuid === nodeId);

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
    const triplet = triplets.find((t) => t.edge.uuid === edgeId);

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

  return (
    <>
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
                height={window.innerHeight}
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
        </>
      )}
    </>
  );
}
