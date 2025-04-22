PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_flowgpt_chat` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`userId` text(256) NOT NULL,
	`name` text(256) DEFAULT 'New Chat' NOT NULL,
	`messages` blob NOT NULL,
	`createdAt` integer DEFAULT (unixepoch()) NOT NULL,
	`updatedAt` integer DEFAULT (unixepoch()) NOT NULL
);
--> statement-breakpoint
INSERT INTO `__new_flowgpt_chat`("id", "userId", "name", "messages", "createdAt", "updatedAt") SELECT "id", "userId", "name", "messages", "createdAt", "updatedAt" FROM `flowgpt_chat`;--> statement-breakpoint
DROP TABLE `flowgpt_chat`;--> statement-breakpoint
ALTER TABLE `__new_flowgpt_chat` RENAME TO `flowgpt_chat`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE INDEX `id_idx` ON `flowgpt_chat` (`id`);--> statement-breakpoint
CREATE INDEX `updated_at_idx` ON `flowgpt_chat` (`updatedAt`);