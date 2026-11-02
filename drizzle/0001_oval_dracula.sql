CREATE TABLE `emergency_shares` (
	`id` text PRIMARY KEY NOT NULL,
	`token_hash` text NOT NULL,
	`recipient_id` text NOT NULL,
	`created_by` text NOT NULL,
	`expires_at` text NOT NULL,
	`revoked_at` text
);
--> statement-breakpoint
CREATE UNIQUE INDEX `emergency_shares_token_hash_unique` ON `emergency_shares` (`token_hash`);--> statement-breakpoint
CREATE TABLE `medication_revisions` (
	`id` text PRIMARY KEY NOT NULL,
	`medication_id` text NOT NULL,
	`version` integer NOT NULL,
	`payload` text NOT NULL,
	`by_user` text NOT NULL,
	`at` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `med_revision` ON `medication_revisions` (`medication_id`,`version`);--> statement-breakpoint
ALTER TABLE `dose_events` ADD `amount` text DEFAULT '1' NOT NULL;--> statement-breakpoint
ALTER TABLE `dose_events` ADD `unit` text DEFAULT 'Stück' NOT NULL;--> statement-breakpoint
ALTER TABLE `dose_events` ADD `plan_version` integer DEFAULT 1 NOT NULL;