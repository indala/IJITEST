-- Add an author-supplied data availability statement to each submission version.
-- Existing records remain NULL until statements are verified by authors or editors.
ALTER TABLE `submission_versions`
  ADD COLUMN `data_availability` text NULL AFTER `ethical_approval`;
