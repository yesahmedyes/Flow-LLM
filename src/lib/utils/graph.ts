import type { Node, Edge, GraphNode, GraphEdge, RawTriplet, GraphTriplet } from "~/lib/types/graph";

export function toGraphNode(node: Node): GraphNode {
  const primaryLabel = node.labels?.find((label) => label != "Entity") ?? "Entity";

  return {
    id: node.uuid,
    value: node.name,
    uuid: node.uuid,
    name: node.name,
    created_at: node.created_at,
    updated_at: node.updated_at,
    attributes: node.attributes,
    summary: node.summary,
    labels: node.labels,
    primaryLabel,
  };
}

export function toGraphEdge(edge: Edge): GraphEdge {
  return {
    id: edge.uuid,
    value: edge.name,
    ...edge,
  };
}

export function toGraphTriplet(triplet: RawTriplet): GraphTriplet {
  return {
    source: toGraphNode(triplet.sourceNode),
    relation: toGraphEdge(triplet.edge),
    target: toGraphNode(triplet.targetNode),
  };
}

export function toGraphTriplets(triplets: RawTriplet[]): GraphTriplet[] {
  return triplets.map(toGraphTriplet);
}

export function createTriplets(edges: Edge[], nodes: Node[]): RawTriplet[] {
  const connectedNodeIds = new Set<string>();

  const edgeTriplets = edges
    .map((edge) => {
      const sourceNode = nodes.find((node) => node.uuid === edge.source_node_uuid);
      const targetNode = nodes.find((node) => node.uuid === edge.target_node_uuid);

      if (!sourceNode || !targetNode) return null;

      connectedNodeIds.add(sourceNode.uuid);
      connectedNodeIds.add(targetNode.uuid);

      return {
        sourceNode,
        edge,
        targetNode,
      };
    })
    .filter((t): t is RawTriplet => t?.sourceNode !== undefined && t?.targetNode !== undefined);

  const isolatedNodes = nodes.filter((node) => !connectedNodeIds.has(node.uuid));

  const isolatedTriplets: RawTriplet[] = isolatedNodes.map((node) => {
    const virtualEdge: Edge = {
      uuid: `isolated-node-${node.uuid}`,
      source_node_uuid: node.uuid,
      target_node_uuid: node.uuid,
      type: "_isolated_node_",
      name: "",
      created_at: node.created_at,
      updated_at: node.updated_at,
    };

    return {
      sourceNode: node,
      edge: virtualEdge,
      targetNode: node,
    };
  });

  return [...edgeTriplets, ...isolatedTriplets];
}
