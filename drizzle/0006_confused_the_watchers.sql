-- Active: 1779793799074@@127.0.0.1@3306@ijitest
ALTER TABLE `notifications` ADD `created_by_user_id` varchar(36);--> statement-breakpoint
ALTER TABLE `notifications` ADD `priority` varchar(10) DEFAULT 'medium' NOT NULL;--> statement-breakpoint
ALTER TABLE `notifications` ADD `metadata` json;--> statement-breakpoint
ALTER TABLE `notifications` ADD CONSTRAINT `notifications_created_by_user_id_users_id_fk` FOREIGN KEY (`created_by_user_id`) REFERENCES `users`(`id`) ON DELETE set null ON UPDATE no action;