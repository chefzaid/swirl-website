CREATE TABLE `contact_messages` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`email` text NOT NULL,
	`service` text NOT NULL,
	`message` text NOT NULL,
	`lang` text NOT NULL,
	`created_at` integer NOT NULL,
	`notification_status` text DEFAULT 'unconfigured' NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_contact_messages_created_at` ON `contact_messages` (`created_at`);--> statement-breakpoint
CREATE TABLE `contact_rate_limits` (
	`key` text PRIMARY KEY NOT NULL,
	`count` integer NOT NULL,
	`expires_at` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_contact_rate_limits_expires_at` ON `contact_rate_limits` (`expires_at`);