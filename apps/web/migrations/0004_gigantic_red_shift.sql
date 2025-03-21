PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_detection_run_items` (
	`id` text PRIMARY KEY NOT NULL,
	`detection_run_id` text NOT NULL,
	`detected_item_id` text NOT NULL,
	`bounding_box` text NOT NULL,
	FOREIGN KEY (`detection_run_id`) REFERENCES `detection_runs`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `__new_detection_run_items`("id", "detection_run_id", "detected_item_id", "bounding_box") SELECT "id", "detection_run_id", "detected_item_id", "bounding_box" FROM `detection_run_items`;--> statement-breakpoint
DROP TABLE `detection_run_items`;--> statement-breakpoint
ALTER TABLE `__new_detection_run_items` RENAME TO `detection_run_items`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
ALTER TABLE `detection_runs` ADD `status` text DEFAULT 'pending' NOT NULL;