import { env } from "~/env";
import { Redis } from "@upstash/redis";

const redisConfig = {
  url: env.UPSTASH_REDIS_REST_URL as string,
  token: env.UPSTASH_REDIS_REST_TOKEN as string,
};

export const redis = new Redis(redisConfig);
