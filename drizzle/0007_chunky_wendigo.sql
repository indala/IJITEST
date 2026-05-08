ALTER TABLE `publications` ADD `views` int DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `publications` ADD `downloads` int DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `publications` ADD `citations` int DEFAULT 0 NOT NULL;