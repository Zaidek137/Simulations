-- =====================================================
-- Migration: Update Index Types and Add RESONANTS Fields
-- =====================================================
-- Run this in your Supabase SQL Editor to update your existing database
-- This will add new columns and update the type constraint

-- Step 1: Add new columns for RESONANTS-specific fields
ALTER TABLE public.index_entries ADD COLUMN IF NOT EXISTS genres TEXT[];
ALTER TABLE public.index_entries ADD COLUMN IF NOT EXISTS energy TEXT;

-- Step 2: Drop the old type check constraint
ALTER TABLE public.index_entries DROP CONSTRAINT IF EXISTS index_entries_type_check;

-- Step 3: Add the new type check constraint with updated types
ALTER TABLE public.index_entries ADD CONSTRAINT index_entries_type_check 
  CHECK (type IN ('Scavenjers', 'RESONANTS', 'ZIBBots', 'Environments'));

-- Step 4: Update existing 'Characters' entries to 'Scavenjers'
UPDATE public.index_entries SET type = 'Scavenjers' WHERE type = 'Characters';

-- Verify the migration
SELECT 
  COUNT(*) as total_entries,
  type,
  COUNT(*) as count_per_type
FROM public.index_entries
GROUP BY type
ORDER BY type;
