-- Migration: Add explicit publication rights & licensing metadata
-- Generated: 2026-10-03

ALTER TABLE `publications`
  ADD COLUMN `license_url` varchar(500) NULL AFTER `zenodo_record_url`,
  ADD COLUMN `copyright_holder` varchar(255) NULL AFTER `license_url`,
  ADD COLUMN `copyright_year` int NULL AFTER `copyright_holder`;
