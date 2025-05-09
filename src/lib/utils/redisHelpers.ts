import { redis } from "~/server/init/redis";

export async function enqueueTask(queueName: string, tasks: object[]) {
  await redis.lpush(queueName, ...tasks);
}

export async function removeTask(queueName: string, userId: string, fileUrl: string) {
  type Task = { userId: string; fileUrl: string; fileName: string; fileType: string };

  const items = await redis.lrange<Task>(queueName, 0, -1);

  const toRemove = items.find((item) => item.userId === userId && item.fileUrl === fileUrl);

  if (!toRemove) {
    return;
  }

  await redis.lrem(queueName, 1, toRemove);
}
