import type { Message } from "ai";
import { sql } from "drizzle-orm";
import { blob, index, integer, sqliteTableCreator } from "drizzle-orm/sqlite-core";

export const createTable = sqliteTableCreator((name) => `flowgpt_${name}`);

export const chats = createTable(
  "chat",
  (chat) => ({
    id: chat
      .text({ length: 256 })
      .default(sql`(randomblob(16))`)
      .primaryKey(),
    messages: blob({ mode: "json" }).$type<Message[]>().notNull(),
    createdAt: integer({ mode: "timestamp" })
      .default(sql`(unixepoch())`)
      .notNull(),
    updatedAt: integer({ mode: "timestamp" })
      .$onUpdate(() => new Date())
      .default(sql`(unixepoch())`)
      .notNull(),
  }),
  (t) => [index("id_idx").on(t.id), index("updated_at_idx").on(t.updatedAt)],
);
