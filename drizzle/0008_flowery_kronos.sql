CREATE TABLE `email_templates` (
	`id` int AUTO_INCREMENT NOT NULL,
	`template_key` varchar(100) NOT NULL,
	`name` varchar(255) NOT NULL,
	`description` varchar(500),
	`subject_template` varchar(500) NOT NULL,
	`body_template` text NOT NULL,
	`variables` json,
	`updated_at` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `email_templates_id` PRIMARY KEY(`id`),
	CONSTRAINT `email_templates_template_key_unique` UNIQUE(`template_key`)
);
--> statement-breakpoint
ALTER TABLE `submission_files` MODIFY COLUMN `file_type` enum('mainManuscript','blindedManuscript','titlePage','rebuttalLetter','pdfVersion','copyrightForm','supplementary','feedback','paymentProof') NOT NULL;--> statement-breakpoint
ALTER TABLE `submissions` MODIFY COLUMN `status` enum('submitted','editorAssigned','underReview','revisionRequested','accepted','rejected','paymentPending','published','retracted','corrigendum') NOT NULL DEFAULT 'submitted';--> statement-breakpoint
ALTER TABLE `payments` ADD `invoice_number` varchar(100);--> statement-breakpoint
ALTER TABLE `review_assignments` ADD `invitation_token` varchar(64);--> statement-breakpoint
ALTER TABLE `review_assignments` ADD `invitation_token_expires_at` timestamp;--> statement-breakpoint
ALTER TABLE `review_assignments` ADD `decline_reason` text;--> statement-breakpoint
ALTER TABLE `reviews` ADD `rubric_data` json;--> statement-breakpoint
ALTER TABLE `reviews` ADD `editor_rating` int;--> statement-breakpoint
ALTER TABLE `reviews` ADD `editor_rating_remarks` text;--> statement-breakpoint
ALTER TABLE `reviews` ADD `rated_at` timestamp;--> statement-breakpoint
ALTER TABLE `submission_authors` ADD `orcid_id` varchar(50);--> statement-breakpoint
ALTER TABLE `submission_authors` ADD `credit_roles` json;--> statement-breakpoint
ALTER TABLE `submission_versions` ADD `similarity_percentage` int;--> statement-breakpoint
ALTER TABLE `submission_versions` ADD `similarity_report_url` varchar(500);--> statement-breakpoint
ALTER TABLE `submission_versions` ADD `competing_interests` text;--> statement-breakpoint
ALTER TABLE `submission_versions` ADD `funding_statement` text;--> statement-breakpoint
ALTER TABLE `submission_versions` ADD `ethical_approval` text;--> statement-breakpoint
ALTER TABLE `submission_versions` ADD `rebuttal_letter` text;--> statement-breakpoint
ALTER TABLE `submissions` ADD `galley_status` enum('notRequested','pendingApproval','approved','correctionsRequested') DEFAULT 'notRequested' NOT NULL;--> statement-breakpoint
ALTER TABLE `submissions` ADD `galley_approved_at` timestamp;--> statement-breakpoint
ALTER TABLE `submissions` ADD `galley_corrections_note` text;--> statement-breakpoint
ALTER TABLE `submissions` ADD `retraction_reason` text;--> statement-breakpoint
ALTER TABLE `submissions` ADD `retraction_notice_url` varchar(500);--> statement-breakpoint
ALTER TABLE `submissions` ADD `retracted_at` timestamp;--> statement-breakpoint
ALTER TABLE `volumes_issues` ADD `full_book_pdf_url` varchar(500);