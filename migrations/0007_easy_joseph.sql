DROP INDEX "chat_id_idx";--> statement-breakpoint
DROP INDEX "chat_updated_at_idx";--> statement-breakpoint
DROP INDEX "file_id_idx";--> statement-breakpoint
DROP INDEX "file_updated_at_idx";--> statement-breakpoint
DROP INDEX "file_embeddings_idx";--> statement-breakpoint
ALTER TABLE `flowgpt_file` ALTER COLUMN "embeddings" TO "embeddings" F32_BLOB(1536);--> statement-breakpoint
CREATE INDEX `chat_id_idx` ON `flowgpt_chat` (`id`);--> statement-breakpoint
CREATE INDEX `chat_updated_at_idx` ON `flowgpt_chat` (`updatedAt`);--> statement-breakpoint
CREATE INDEX `file_id_idx` ON `flowgpt_file` (`id`);--> statement-breakpoint
CREATE INDEX `file_updated_at_idx` ON `flowgpt_file` (`updatedAt`);--> statement-breakpoint
CREATE INDEX `file_embeddings_idx` ON `flowgpt_file` (`embeddings`);