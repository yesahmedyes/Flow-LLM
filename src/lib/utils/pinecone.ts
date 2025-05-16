import pinecone from "~/server/init/pinecone";

export async function deleteFromParentDocument({ prefix, userId }: { prefix: string; userId: string }) {
  const index = pinecone.index("flowllm-files");
  const namespace = index.namespace(userId);

  let allVectorIds: string[] = [];
  let paginationToken: string | undefined;

  do {
    const list = await namespace.listPaginated({
      prefix,
      paginationToken: paginationToken,
    });

    const vectorIds = list.vectors?.map((vector) => vector.id!);

    if (vectorIds && vectorIds.length > 0) {
      allVectorIds = [...allVectorIds, ...vectorIds];
    }

    paginationToken = list.pagination?.next;
  } while (paginationToken);

  if (allVectorIds.length > 0) {
    await namespace.deleteMany(allVectorIds);
  }
}
