CREATE TABLE `accounts` (
	`id` text PRIMARY KEY NOT NULL,
	`email` text NOT NULL,
	`name` text NOT NULL,
	`preferences` text DEFAULT '{}' NOT NULL,
	`onboarding` integer DEFAULT 0 NOT NULL,
	`created_at` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `audits` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`circle_id` text NOT NULL,
	`action` text NOT NULL,
	`entity_id` text NOT NULL,
	`at` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `circles` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`created_by` text NOT NULL,
	`created_at` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `consents` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`purpose` text NOT NULL,
	`accepted` integer NOT NULL,
	`version` text NOT NULL,
	`at` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `dose_events` (
	`id` text PRIMARY KEY NOT NULL,
	`circle_id` text NOT NULL,
	`recipient_id` text NOT NULL,
	`medication_id` text NOT NULL,
	`scheduled_at` text NOT NULL,
	`status` text NOT NULL,
	`by_user` text NOT NULL,
	`at` text NOT NULL,
	`reason` text,
	`correction_of` text,
	`dedupe` text
);
--> statement-breakpoint
CREATE UNIQUE INDEX `dose_events_dedupe_unique` ON `dose_events` (`dedupe`);--> statement-breakpoint
CREATE TABLE `files` (
	`id` text PRIMARY KEY NOT NULL,
	`circle_id` text NOT NULL,
	`recipient_id` text NOT NULL,
	`record_id` text,
	`owner_id` text NOT NULL,
	`name` text NOT NULL,
	`mime` text NOT NULL,
	`size` integer NOT NULL,
	`object_key` text NOT NULL,
	`status` text DEFAULT 'unverified' NOT NULL,
	`created_at` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `invitations` (
	`id` text PRIMARY KEY NOT NULL,
	`token_hash` text NOT NULL,
	`circle_id` text NOT NULL,
	`created_by` text NOT NULL,
	`role` text NOT NULL,
	`permissions` text NOT NULL,
	`recipient_ids` text NOT NULL,
	`expires_at` text NOT NULL,
	`used_by` text,
	`revoked_at` text
);
--> statement-breakpoint
CREATE UNIQUE INDEX `invitations_token_hash_unique` ON `invitations` (`token_hash`);--> statement-breakpoint
CREATE TABLE `jobs` (
	`id` text PRIMARY KEY NOT NULL,
	`kind` text NOT NULL,
	`circle_id` text NOT NULL,
	`recipient_id` text NOT NULL,
	`ref_id` text NOT NULL,
	`user_id` text NOT NULL,
	`due_at` text NOT NULL,
	`state` text DEFAULT 'pending' NOT NULL,
	`ref_version` integer DEFAULT 1 NOT NULL,
	`dedupe` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `jobs_dedupe_unique` ON `jobs` (`dedupe`);--> statement-breakpoint
CREATE INDEX `jobs_due` ON `jobs` (`state`,`due_at`);--> statement-breakpoint
CREATE TABLE `members` (
	`id` text PRIMARY KEY NOT NULL,
	`circle_id` text NOT NULL,
	`user_id` text NOT NULL,
	`name` text NOT NULL,
	`role` text NOT NULL,
	`permissions` text NOT NULL,
	`recipient_ids` text DEFAULT '[]' NOT NULL,
	`active` integer DEFAULT 1 NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `member_user_circle` ON `members` (`circle_id`,`user_id`);--> statement-breakpoint
CREATE TABLE `notifications` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`circle_id` text NOT NULL,
	`recipient_id` text NOT NULL,
	`kind` text NOT NULL,
	`ref_id` text NOT NULL,
	`title` text NOT NULL,
	`read_at` text,
	`created_at` text NOT NULL,
	`dedupe` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `notifications_dedupe_unique` ON `notifications` (`dedupe`);--> statement-breakpoint
CREATE TABLE `recipients` (
	`id` text PRIMARY KEY NOT NULL,
	`circle_id` text NOT NULL,
	`name` text NOT NULL,
	`info` text DEFAULT '{}' NOT NULL,
	`created_at` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `records` (
	`id` text PRIMARY KEY NOT NULL,
	`circle_id` text NOT NULL,
	`recipient_id` text NOT NULL,
	`kind` text NOT NULL,
	`owner_id` text NOT NULL,
	`visibility` text DEFAULT 'shared' NOT NULL,
	`payload` text NOT NULL,
	`version` integer DEFAULT 1 NOT NULL,
	`deleted` integer DEFAULT 0 NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE INDEX `records_case_kind` ON `records` (`recipient_id`,`kind`);