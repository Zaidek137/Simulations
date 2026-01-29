-- =====================================================
-- THE INDEX - Database Table Creation
-- =====================================================
-- This script creates the index_entries table for storing
-- character, ZIBBot, and environment entries for The Index page.
-- Run this in your Supabase SQL Editor.
-- =====================================================

-- Create the index_entries table
CREATE TABLE IF NOT EXISTS public.index_entries (
  -- Primary Key
  id TEXT PRIMARY KEY,
  
  -- Core Information
  name TEXT NOT NULL,
  simulation TEXT NOT NULL CHECK (simulation IN ('Resonance', 'Prime', 'Veliental Ascendance')),
  type TEXT NOT NULL CHECK (type IN ('Characters', 'ZIBBots', 'Environments')),
  faction TEXT NOT NULL,
  description TEXT,
  
  -- Image URLs
  card_image_url TEXT,        -- Small collectible card image
  display_image_url TEXT,     -- Large 2D character display image
  model_url TEXT,             -- 3D model URL (deprecated but kept for compatibility)
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_index_entries_simulation ON public.index_entries(simulation);
CREATE INDEX IF NOT EXISTS idx_index_entries_type ON public.index_entries(type);
CREATE INDEX IF NOT EXISTS idx_index_entries_faction ON public.index_entries(faction);
CREATE INDEX IF NOT EXISTS idx_index_entries_name ON public.index_entries(name);

-- Create updated_at trigger function (if it doesn't exist)
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to auto-update updated_at
DROP TRIGGER IF EXISTS update_index_entries_updated_at ON public.index_entries;
CREATE TRIGGER update_index_entries_updated_at
  BEFORE UPDATE ON public.index_entries
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- =====================================================
-- Row Level Security (RLS) Policies
-- =====================================================
-- Note: Admin access is controlled at the application level via wallet authentication
-- These policies allow public access since the admin pages are already protected
-- =====================================================

-- Enable RLS on the table
ALTER TABLE public.index_entries ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (to allow re-running this script)
DROP POLICY IF EXISTS "Allow public read access to index entries" ON public.index_entries;
DROP POLICY IF EXISTS "Allow authenticated users to insert index entries" ON public.index_entries;
DROP POLICY IF EXISTS "Allow authenticated users to update index entries" ON public.index_entries;
DROP POLICY IF EXISTS "Allow authenticated users to delete index entries" ON public.index_entries;
DROP POLICY IF EXISTS "Allow public insert to index entries" ON public.index_entries;
DROP POLICY IF EXISTS "Allow public update to index entries" ON public.index_entries;
DROP POLICY IF EXISTS "Allow public delete to index entries" ON public.index_entries;

-- Policy: Allow public read access (anyone can view entries)
CREATE POLICY "Allow public read access to index entries"
  ON public.index_entries
  FOR SELECT
  TO public
  USING (true);

-- Policy: Allow public insert (protected by wallet auth at app level)
CREATE POLICY "Allow public insert to index entries"
  ON public.index_entries
  FOR INSERT
  TO public
  WITH CHECK (true);

-- Policy: Allow public update (protected by wallet auth at app level)
CREATE POLICY "Allow public update to index entries"
  ON public.index_entries
  FOR UPDATE
  TO public
  USING (true)
  WITH CHECK (true);

-- Policy: Allow public delete (protected by wallet auth at app level)
CREATE POLICY "Allow public delete to index entries"
  ON public.index_entries
  FOR DELETE
  TO public
  USING (true);

-- =====================================================
-- Optional: Insert mock data for testing
-- =====================================================

-- Uncomment the following to insert sample data:
/*
-- Sample data with the 6 Resonance locations as factions
INSERT INTO public.index_entries (id, name, simulation, type, faction, description) VALUES
  ('idx-001', 'APEX-7', 'Resonance', 'Characters', 'The Apex', 'Elite recovery specialist operating in the most hazardous zones. APEX-7 has survived 47 consecutive Drops and holds the record for highest-value artifact extraction.'),
  ('idx-002', 'NOVA-12', 'Resonance', 'Characters', 'Resonant', 'Technical prodigy responsible for maintaining critical infrastructure during Drop events. Known for unconventional solutions and system modifications that border on unauthorized.'),
  ('idx-003', 'CIPHER', 'Resonance', 'Characters', 'The Veil', 'Information broker with connections spanning all districts. True identity remains unconfirmed. Provides critical intel during high-stakes operations. Loyalty: questionable.'),
  ('idx-004', 'WARDEN-01', 'Resonance', 'Characters', 'The Apex', 'Senior Overseer responsible for monitoring District compliance. Has authorized more erasures than any other active Warden. The system''s unwavering instrument.'),
  ('idx-005', 'ECHO', 'Resonance', 'Characters', 'Dryreach', 'Former Scavenjer whose license was revoked after a failed extraction. Now survives in the gray zones between districts, trading information and salvage.'),
  ('idx-006', 'PULSE', 'Resonance', 'Characters', 'Verdant', 'Combat medic specializing in field treatment during Drop events. Has saved more lives than official records acknowledge. Carries unauthorized medical tech.'),
  ('idx-007', 'GHOST-9', 'Resonance', 'Characters', 'The Underworks', 'Unregistered entity detected in multiple district systems. No official record exists. Surveillance footage corrupted. Classification: anomaly.'),
  ('idx-008', 'IRON-GATE', 'Resonance', 'Characters', 'The Apex', 'District enforcer tasked with maintaining order between zones. Known for strict adherence to protocol. Zero tolerance for unauthorized crossings.')
ON CONFLICT (id) DO NOTHING;
*/

-- =====================================================
-- Grant permissions to service role
-- =====================================================

GRANT ALL ON public.index_entries TO service_role;
GRANT SELECT ON public.index_entries TO anon;
GRANT SELECT ON public.index_entries TO authenticated;

-- =====================================================
-- Storage bucket for images (if not already created)
-- =====================================================

-- You'll need to create storage buckets in the Supabase Storage UI:
-- 1. Create bucket: "public" (if not exists)
-- 2. Create folders: "index-cards/", "index-displays/", "index-models/"
-- 3. Set bucket to public for read access

-- =====================================================
-- Verification Query
-- =====================================================

-- Run this to verify the table was created successfully:
-- SELECT * FROM public.index_entries LIMIT 10;
