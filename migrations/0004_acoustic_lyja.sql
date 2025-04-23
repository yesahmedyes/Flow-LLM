DROP INDEX `id_idx`;--> statement-breakpoint
DROP INDEX `updated_at_idx`;--> statement-breakpoint
CREATE INDEX `chat_id_idx` ON `flowgpt_chat` (`id`);--> statement-breakpoint
CREATE INDEX `chat_updated_at_idx` ON `flowgpt_chat` (`updatedAt`);--> statement-breakpoint
CREATE INDEX `file_id_idx` ON `flowgpt_file` (`id`);--> statement-breakpoint
CREATE INDEX `file_updated_at_idx` ON `flowgpt_file` (`updatedAt`);