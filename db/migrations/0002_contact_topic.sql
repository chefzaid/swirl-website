-- What an inquiry is about: a project (every earlier inquiry) or a Swirl Cloud
-- demo request, which also names the visitor's company for the CRM lead.
ALTER TABLE `contact_messages` ADD `topic` text DEFAULT 'project' NOT NULL CHECK (`topic` IN ('project','demo'));
--> statement-breakpoint
ALTER TABLE `contact_messages` ADD `company` text;
