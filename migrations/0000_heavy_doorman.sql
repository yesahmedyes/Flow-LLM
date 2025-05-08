CREATE TABLE `flowgpt_chat` (
	`id` text(256) PRIMARY KEY NOT NULL,
	`userId` text(256) NOT NULL,
	`name` text(256) DEFAULT 'New Chat' NOT NULL,
	`messages` blob NOT NULL,
	`createdAt` integer DEFAULT (unixepoch()) NOT NULL,
	`updatedAt` integer DEFAULT (unixepoch()) NOT NULL
);
--> statement-breakpoint
CREATE INDEX `chat_id_idx` ON `flowgpt_chat` (`id`);--> statement-breakpoint
CREATE INDEX `chat_updated_at_idx` ON `flowgpt_chat` (`updatedAt`);--> statement-breakpoint
CREATE UNIQUE INDEX `chat_id_userId_idx` ON `flowgpt_chat` (`id`,`userId`);--> statement-breakpoint
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
CREATE INDEX `file_updated_at_idx` ON `flowgpt_file` (`updatedAt`);--> statement-breakpoint
CREATE UNIQUE INDEX `file_fileUrl_userId_idx` ON `flowgpt_file` (`fileUrl`,`userId`);