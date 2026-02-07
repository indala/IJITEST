-- Refactor Workflow: Add Is Free Publish and Ensure Paid Status
-- This script updates the database to support the new workflow requirements.

-- 1. Add 'paid' to status enum if not already present (MySQL will ignore if it exists or warn)
-- Note: Modifying ENUMs can be tricky. We'll simply expand it.
ALTER TABLE submissions MODIFY COLUMN status ENUM('submitted', 'under_review', 'accepted', 'rejected', 'published', 'paid') DEFAULT 'submitted';

-- 2. Add is_free_publish flag
-- This flag helps distinguish between "Paid" (via gateway) and "Free" (waived)
ALTER TABLE submissions ADD COLUMN is_free_publish BOOLEAN DEFAULT FALSE;

-- 3. Ensure 'paid' status papers have is_free_publish set correctly if they were waived
-- We can infer this: if status is 'paid' AND payment status is 'waived' (if we had that link easily)
-- For now, just default to FALSE. The application logic will handle new ones.
