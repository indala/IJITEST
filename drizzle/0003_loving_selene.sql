CREATE TABLE `chat_messages` (
	`id` int AUTO_INCREMENT NOT NULL,
	`sender_id` varchar(36) NOT NULL,
	`receiver_id` varchar(36) NOT NULL,
	`submission_id` int,
	`message_text` text NOT NULL,
	`is_read` boolean NOT NULL DEFAULT false,
	`created_at` timestamp DEFAULT (now()),
	CONSTRAINT `chat_messages_id` PRIMARY KEY(`id`)
);

ALTER TABLE `chat_messages` ADD CONSTRAINT `chat_messages_sender_id_users_id_fk` FOREIGN KEY (`sender_id`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;
ALTER TABLE `chat_messages` ADD CONSTRAINT `chat_messages_receiver_id_users_id_fk` FOREIGN KEY (`receiver_id`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;
ALTER TABLE `chat_messages` ADD CONSTRAINT `chat_messages_submission_id_submissions_id_fk` FOREIGN KEY (`submission_id`) REFERENCES `submissions`(`id`) ON DELETE cascade ON UPDATE no action;
CREATE INDEX `sender_idx` ON `chat_messages` (`sender_id`);
CREATE INDEX `receiver_idx` ON `chat_messages` (`receiver_id`);
CREATE INDEX `submission_chat_idx` ON `chat_messages` (`submission_id`);