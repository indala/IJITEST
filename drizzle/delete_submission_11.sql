-- Migration: Remove Submission IJITEST-2026-011 (ID: 11)
-- Goal: Cleanly remove the paper and all associated history/review records.

SET @submission_id = 11;
SET @paper_id = 'IJITEST-2026-011';
SET @slug = 'ijitest2026011';

START TRANSACTION;

-- 1. Remove from publications (References submission_id, but has ON DELETE NO ACTION)
DELETE FROM `publications` WHERE `submission_id` = @submission_id;

-- 2. Remove from activity_logs (No formal foreign key, linked by entity_id string)
DELETE FROM `activity_logs` WHERE `entity_type` = 'submission' AND `entity_id` = CAST(@submission_id AS CHAR);

-- 3. Remove from notifications (No formal foreign key, linked by action_link contents)
DELETE FROM `notifications` WHERE `action_link` LIKE CONCAT('%', @paper_id, '%') OR `action_link` LIKE CONCAT('%', @slug, '%');

-- 4. Remove the core submission record
-- The following tables will be automatically cleaned up via ON DELETE CASCADE constraints:
--   - submission_versions
--   - submission_authors
--   - submission_editors
--   - review_assignments
--   - reviews (via review_assignments)
--   - submission_files (via submission_versions)
--   - payments
DELETE FROM `submissions` WHERE `id` = @submission_id;

COMMIT;

-- Verification query
SELECT 'Submissions Remaining' as label, COUNT(*) FROM `submissions` WHERE `id` = @submission_id
UNION ALL
SELECT 'Publications Remaining', COUNT(*) FROM `publications` WHERE `submission_id` = @submission_id;
