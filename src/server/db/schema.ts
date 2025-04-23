import type { Message } from "ai";
import { sql } from "drizzle-orm";
import { blob, index, integer, sqliteTableCreator, text } from "drizzle-orm/sqlite-core";

export const createTable = sqliteTableCreator((name) => `flowgpt_${name}`);

export const chats = createTable(
  "chat",
  (chat) => ({
    id: chat
      .text({ length: 256 })
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    userId: text({ length: 256 }).notNull(), // Clerk user ID
    name: text({ length: 256 }).notNull().default("New Chat"),
    messages: blob({ mode: "json" }).$type<Message[]>().notNull(),
    createdAt: integer({ mode: "timestamp" })
      .default(sql`(unixepoch())`)
      .notNull(),
    updatedAt: integer({ mode: "timestamp" })
      .$onUpdate(() => new Date())
      .default(sql`(unixepoch())`)
      .notNull(),
  }),
  (t) => [index("chat_id_idx").on(t.id), index("chat_updated_at_idx").on(t.updatedAt)],
);

export const files = createTable(
  "file",
  (file) => ({
    id: file
      .text({ length: 256 })
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    userId: text({ length: 256 }).notNull(),
    fileUrl: text({ length: 256 }).notNull(),
    fileName: text({ length: 256 }).notNull(),
    fileType: text({ length: 256 }).notNull(),
    createdAt: integer({ mode: "timestamp" })
      .default(sql`(unixepoch())`)
      .notNull(),
    updatedAt: integer({ mode: "timestamp" })
      .$onUpdate(() => new Date())
      .default(sql`(unixepoch())`)
      .notNull(),
  }),
  (t) => [index("file_id_idx").on(t.id), index("file_updated_at_idx").on(t.updatedAt)],
);
