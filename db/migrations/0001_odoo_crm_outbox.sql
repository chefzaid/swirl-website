-- Odoo CRM delivery state per stored inquiry. Existing inquiries are queued too,
-- so every accepted submission reaches the CRM once the integration is configured.
CREATE TABLE `contact_crm_queue` (
	`contact_id` text PRIMARY KEY NOT NULL REFERENCES `contact_messages`(`id`),
	`status` text DEFAULT 'queued' NOT NULL CHECK (`status` IN ('queued','sent','manual')),
	`attempts` integer DEFAULT 0 NOT NULL,
	`run_at` integer NOT NULL,
	`locked_until` integer,
	`lead_id` integer,
	`last_error` text
);
--> statement-breakpoint
CREATE INDEX `idx_contact_crm_queue_due` ON `contact_crm_queue` (`status`,`run_at`);
--> statement-breakpoint
INSERT INTO `contact_crm_queue` (`contact_id`,`run_at`) SELECT `id`,`created_at` FROM `contact_messages`;
