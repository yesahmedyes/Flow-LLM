import type { ZepClient } from "@getzep/zep-cloud";
import { z } from "zod";
import type { Edge, Node } from "~/lib/types/graph";
import { createTriplets } from "~/lib/utils/graph";

import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import zep from "~/server/init/zep";

export const memoryRouter = createTRPCRouter({
  addMemoryToGraph: protectedProcedure
    .input(
      z.object({
        memory: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { user } = ctx;

      await zep.graph.add({
        data: input.memory,
        type: "text",
        userId: user.id,
      });
    }),

  getGraphTriplets: protectedProcedure.query(async ({ ctx }) => {
    const { user } = ctx;

    const [nodes, edges] = await Promise.all([getAllNodes(user.id, zep), getAllEdges(user.id, zep)]);

    if (!nodes.length && !edges.length) {
      return { triplets: [] };
    }

    const triplets = createTriplets(edges, nodes);

    return { triplets };
  }),
});

const NODE_BATCH_SIZE = 100;
const EDGE_BATCH_SIZE = 100;

interface PaginatedResponse<T> {
  data: T[];
  nextCursor: string | null;
}

async function getNodes(id: string, zep: ZepClient, cursor?: string): Promise<PaginatedResponse<Node>> {
  try {
    const nodes = await zep.graph.node.getByUserId(id, {
      uuidCursor: cursor ?? "",
      limit: NODE_BATCH_SIZE,
    });

    const transformedNodes = nodes.map((node) => node as unknown as Node);

    return {
      data: transformedNodes,
      nextCursor: transformedNodes.length > 0 ? (transformedNodes[transformedNodes.length - 1]?.uuid ?? null) : null,
    };
  } catch (error) {
    console.error("Error fetching nodes:", error);
    return { data: [], nextCursor: null };
  }
}

async function getEdges(id: string, zep: ZepClient, cursor?: string): Promise<PaginatedResponse<Edge>> {
  try {
    const edges = await zep.graph.edge.getByUserId(id, {
      uuidCursor: cursor ?? "",
      limit: EDGE_BATCH_SIZE,
    });

    const transformedEdges = edges.map((edge) => edge as unknown as Edge);

    return {
      data: transformedEdges,
      nextCursor: transformedEdges.length > 0 ? (transformedEdges[transformedEdges.length - 1]?.uuid ?? null) : null,
    };
  } catch (error) {
    console.error("Error fetching edges:", error);
    return { data: [], nextCursor: null };
  }
}

async function getAllNodes(id: string, zep: ZepClient): Promise<Node[]> {
  let allNodes: Node[] = [];

  let cursor = undefined;
  let hasMore = true;

  while (hasMore) {
    const { data: nodes, nextCursor } = await getNodes(id, zep, cursor);

    allNodes = [...allNodes, ...nodes];

    if (nextCursor === null || nodes.length === 0) {
      hasMore = false;
    } else {
      cursor = nextCursor;
    }
  }

  return allNodes;
}

async function getAllEdges(id: string, zep: ZepClient): Promise<Edge[]> {
  let allEdges: Edge[] = [];

  let cursor = undefined;
  let hasMore = true;

  while (hasMore) {
    const { data: edges, nextCursor } = await getEdges(id, zep, cursor);

    allEdges = [...allEdges, ...edges];

    if (nextCursor === null || edges.length === 0) {
      hasMore = false;
    } else {
      cursor = nextCursor;
    }
  }

  return allEdges;
}
