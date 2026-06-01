ALTER TABLE `review_assignments` DROP FOREIGN KEY `review_assignments_reviewer_id_users_id_fk`;
ALTER TABLE `review_assignments` DROP FOREIGN KEY `review_assignments_assigned_by_users_id_fk`;
ALTER TABLE `submissions` DROP FOREIGN KEY `submissions_decision_by_users_id_fk`;
ALTER TABLE `submissions` DROP FOREIGN KEY `submissions_corresponding_author_id_users_id_fk`;
ALTER TABLE `review_assignments` ADD CONSTRAINT `review_assignments_reviewer_id_users_id_fk` FOREIGN KEY (`reviewer_id`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;
ALTER TABLE `review_assignments` ADD CONSTRAINT `review_assignments_assigned_by_users_id_fk` FOREIGN KEY (`assigned_by`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;
ALTER TABLE `submissions` ADD CONSTRAINT `submissions_decision_by_users_id_fk` FOREIGN KEY (`decision_by`) REFERENCES `users`(`id`) ON DELETE set null ON UPDATE no action;
ALTER TABLE `submissions` ADD CONSTRAINT `submissions_corresponding_author_id_users_id_fk` FOREIGN KEY (`corresponding_author_id`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;