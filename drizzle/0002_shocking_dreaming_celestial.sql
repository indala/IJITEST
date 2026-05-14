CREATE TABLE `rate_limits` (
	`key` varchar(255) NOT NULL,
	`count` int NOT NULL DEFAULT 0,
	`reset_at` bigint NOT NULL,
	`updated_at` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `rate_limits_key` PRIMARY KEY(`key`)
);
--> statement-breakpoint
CREATE INDEX `rate_limits_reset_at_idx` ON `rate_limits` (`reset_at`);