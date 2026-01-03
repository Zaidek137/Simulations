import type { VercelRequest, VercelResponse } from '@vercel/node';

// Import Supabase functions
// Note: We need to inline the Supabase logic here since we can't import from src/
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL!;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: false, // Serverless environment
  },
});

// Bulk upsert function
async function bulkUpsertData(regions: any[]) {
  for (const region of regions) {
    // Upsert region
    const { data: regionData, error: regionError } = await supabase.rpc('upsert_lore_region', {
      p_region_id: region.region_id,
      p_name: region.name,
      p_description: region.description,
      p_color: region.color,
      p_cx: region.cx,
      p_cy: region.cy,
      p_thumb_url: region.thumb_url,
      p_background_url: region.background_url,
      p_image_url: region.image_url,
      p_sort_order: region.sort_order || 0,
    });

    if (regionError) throw regionError;

    // Upsert locations for this region
    for (const location of region.locations || []) {
      const { data: locationData, error: locationError } = await supabase.rpc('upsert_lore_location', {
        p_location_id: location.location_id,
        p_region_id: region.region_id,
        p_name: location.name,
        p_description: location.description,
        p_cx: location.cx,
        p_cy: location.cy,
        p_location_type: location.location_type,
        p_thumb_url: location.thumb_url,
        p_sort_order: location.sort_order || 0,
      });

      if (locationError) throw locationError;
    }
  }
}

// Update config function
async function updateLoreConfig(configValue: { multiverseBackgroundUrl: string }) {
  const { data, error } = await supabase.rpc('update_lore_config', {
    p_config_key: 'multiverse_background',
    p_config_value: configValue,
  });

  if (error) throw error;
  return data;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    const { config, regions } = req.body;

    // Validate input
    if (!regions || !Array.isArray(regions)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid regions data',
      });
    }

    // Transform data to match Supabase schema
    const transformedRegions = regions.map((region: any) => ({
      region_id: region.id,
      name: region.name,
      description: region.description || '',
      color: region.color,
      cx: region.cx,
      cy: region.cy,
      thumb_url: region.thumbUrl || region.thumb_url || '',
      background_url: region.backgroundUrl || region.background_url || '',
      image_url: region.imageUrl || region.image_url || '',
      locations: (region.locations || []).map((loc: any) => ({
        location_id: loc.id,
        name: loc.name,
        description: loc.description || '',
        cx: loc.cx,
        cy: loc.cy,
        location_type: loc.type || loc.location_type,
        thumb_url: loc.thumbUrl || loc.thumb_url || '',
      })),
    }));

    // Save regions and locations to Supabase
    await bulkUpsertData(transformedRegions);

    // Update config if provided
    if (config && config.multiverseBackgroundUrl) {
      await updateLoreConfig({
        multiverseBackgroundUrl: config.multiverseBackgroundUrl,
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Data saved to Supabase successfully',
    });
  } catch (error: any) {
    console.error('Failed to save data to Supabase:', error);

    // Check for authentication errors
    if (error.message?.includes('Unauthorized')) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized: Admin access required. Please sign in.',
      });
    }

    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to save data',
    });
  }
}

