CREATE TABLE `flagged_detection_runs` (
	`id` text PRIMARY KEY NOT NULL,
	`detection_run_id` text NOT NULL,
	`reason` text NOT NULL,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`detection_run_id`) REFERENCES `detection_runs`(`id`) ON UPDATE no action ON DELETE cascade
);
