CREATE TABLE `detection_run_items` (
	`id` text PRIMARY KEY DEFAULT (random()) NOT NULL,
	`detection_run_id` text NOT NULL,
	`detected_item_id` text NOT NULL,
	`bounding_box` text NOT NULL,
	FOREIGN KEY (`detection_run_id`) REFERENCES `detection_runs`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `detection_runs` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`created_at` integer NOT NULL,
	`image_path` text NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `flagged_detection_items` (
	`id` text PRIMARY KEY NOT NULL,
	`detection_run_item_id` text NOT NULL,
	`reason` text NOT NULL,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`detection_run_item_id`) REFERENCES `detection_run_items`(`id`) ON UPDATE no action ON DELETE cascade
);
