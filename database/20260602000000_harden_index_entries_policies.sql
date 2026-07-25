-- Harden The Index write policies.
-- Public clients may read index entries, but mutations must go through
-- signed server-side admin operations using the Supabase service role.

ALTER TABLE public.index_entries ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow authenticated users to insert index entries" ON public.index_entries;
DROP POLICY IF EXISTS "Allow authenticated users to update index entries" ON public.index_entries;
DROP POLICY IF EXISTS "Allow authenticated users to delete index entries" ON public.index_entries;
DROP POLICY IF EXISTS "Allow public insert to index entries" ON public.index_entries;
DROP POLICY IF EXISTS "Allow public update to index entries" ON public.index_entries;
DROP POLICY IF EXISTS "Allow public delete to index entries" ON public.index_entries;
DROP POLICY IF EXISTS "Allow service role to manage index entries" ON public.index_entries;

CREATE POLICY "Allow service role to manage index entries"
  ON public.index_entries
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

GRANT ALL ON public.index_entries TO service_role;
GRANT SELECT ON public.index_entries TO anon;
GRANT SELECT ON public.index_entries TO authenticated;
