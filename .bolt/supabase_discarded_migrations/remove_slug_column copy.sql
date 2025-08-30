-- Remove slug column from blogs table
-- This migration removes the slug column that is no longer needed
-- after removing slug functionality from the application

ALTER TABLE blogs DROP COLUMN IF EXISTS slug;