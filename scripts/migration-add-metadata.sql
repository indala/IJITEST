-- Migration to add metadata columns to submissions
ALTER TABLE submissions ADD COLUMN affiliation VARCHAR(500) AFTER author_email;
ALTER TABLE submissions ADD COLUMN keywords TEXT AFTER abstract;
