import type { chats, files } from "~/server/db/schema";

export type FileData = typeof files.$inferSelect;

export type Chat = typeof chats.$inferSelect;
