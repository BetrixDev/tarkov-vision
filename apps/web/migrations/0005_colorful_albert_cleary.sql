CREATE TABLE `tarkov_items` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`short_name` text NOT NULL,
	`normalized_name` text NOT NULL,
	`base_price` integer NOT NULL,
	`best_sell` text NOT NULL
);
