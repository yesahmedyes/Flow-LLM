CREATE TABLE `flowgpt_file` (
	`id` text(256) PRIMARY KEY NOT NULL,
	`userId` text(256) NOT NULL,
	`fileUrl` text(256) NOT NULL,
	`fileName` text(256) NOT NULL,
	`fileType` text(256) NOT NULL,
	`createdAt` integer DEFAULT (unixepoch()) NOT NULL,
	`updatedAt` integer DEFAULT (unixepoch()) NOT NULL
);
--> statement-breakpoint
CREATE INDEX `id_idx` ON `flowgpt_file` (`id`);--> statement-breakpoint
CREATE INDEX `updated_at_idx` ON `flowgpt_file` (`updatedAt`);