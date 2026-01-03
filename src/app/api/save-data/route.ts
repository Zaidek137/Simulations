import { NextResponse } from 'next/server';
import { bulkUpsertData, updateLoreConfig } from '@/lib/supabase';

/**
 * API Route: Save lore data to Supabase
 * This replaces the old filesystem-based approach which doesn't work on Vercel
 */
export async function POST(request: Request) {
  try {
    const { config, regions } = await request.json();

    // Validate input
    if (!regions || !Array.isArray(regions)) {
      return NextResponse.json(
        { success: false, error: 'Invalid regions data' },
        { status: 400 }
      );
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

    return NextResponse.json({ 
      success: true,
      message: 'Data saved to Supabase successfully'
    });
  } catch (error: any) {
    console.error('Failed to save data to Supabase:', error);
    
    // Check for authentication errors
    if (error.message?.includes('Unauthorized')) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Unauthorized: Admin access required. Please sign in.' 
        },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'Failed to save data' 
      },
      { status: 500 }
    );
  }
}
