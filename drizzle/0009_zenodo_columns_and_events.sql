-- Migration: Add Zenodo columns to publications + new DOI event types
-- Generated: 2026-09-29

-- Add Zenodo-specific columns to publications table
ALTER TABLE `publications`
  ADD COLUMN `zenodo_doi` varchar(100) NULL AFTER `doi_reg_batch_id`,
  ADD COLUMN `zenodo_record_id` varchar(50) NULL AFTER `zenodo_doi`,
  ADD COLUMN `zenodo_status` enum('none','pending','published','failed') NOT NULL DEFAULT 'none' AFTER `zenodo_record_id`,
  ADD COLUMN `zenodo_record_url` varchar(500) NULL AFTER `zenodo_status`;

-- NOTE: The submission_event_log.event_type enum is extended via Drizzle schema.
-- If your DB uses a strict ENUM column for event_type, run the ALTER below.
-- Uncomment if needed:
--
-- ALTER TABLE `submission_event_log`
--   MODIFY COLUMN `event_type` enum(
--     'submission_created','editor_assigned','reviewer_invited','reviewer_accepted',
--     'reviewer_declined','reviewer_assigned','review_submitted','revision_requested',
--     'revision_submitted','decision_recorded','galley_requested','galley_approved',
--     'galley_corrections_requested','galley_proof_requested','galley_proof_responded',
--     'copyright_uploaded','paper_scheduled','paper_accepted','paper_rejected',
--     'paper_published','doi_assigned','doi_deposit_submitted','doi_registered',
--     'doi_registration_failed','zenodo_deposited','zenodo_published','zenodo_failed',
--     'paper_retracted','retraction_issued','corrigendum_issued','payment_verified',
--     'comment_added'
--   ) NOT NULL;
