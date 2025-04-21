CREATE TABLE `flowgpt_chat` (
	`id` text(256) PRIMARY KEY DEFAULT (randomblob(16)) NOT NULL,
	`messages` blob NOT NULL,
	`createdAt` integer DEFAULT (unixepoch()) NOT NULL,
	`updatedAt` integer DEFAULT (unixepoch()) NOT NULL
);
--> statement-breakpoint
CREATE INDEX `id_idx` ON `flowgpt_chat` (`id`);--> statement-breakpoint
CREATE INDEX `updated_at_idx` ON `flowgpt_chat` (`updatedAt`);