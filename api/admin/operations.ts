import { createHash } from 'crypto';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { verifyMessage } from 'viem';
import { handleCors, type CorsRequest, type CorsResponse } from '../_utils/cors';

type VercelRequest = CorsRequest & {
  body?: unknown;
};

type VercelResponse = CorsResponse;

type SupabaseServiceClient = SupabaseClient<any, 'public', any>;

type AdminOperationPayload = {
  operation: string;
  args: Record<string, unknown>;
  walletAddress: string;
  timestamp: number;
  nonce: string;
  argsHash: string;
  signature: string;
};

const FIVE_MINUTES_MS = 5 * 60 * 1000;
const MAX_TEXT_LENGTH = 5000;
const MAX_REPLAY_CACHE_ENTRIES = 10_000;
const replayCache = new Map<string, number>();

const ALLOWED_OPERATIONS = new Set([
  'upsertLoreRegion',
  'upsertLoreLocation',
  'updateLoreConfig',
  'deleteLoreRegion',
  'deleteLoreLocation',
  'createIndexEntry',
  'updateIndexEntry',
  'deleteIndexEntry',
]);

const SIMULATIONS = new Set(['Resonance', 'Prime', 'Veliental Ascendance']);
const INDEX_TYPES = new Set(['Scavenjers', 'RESONANTS', 'ZIBBots', 'Environments']);
const LOCATION_TYPES = new Set(['planet', 'station', 'anomaly']);

function hashArgs(args: Record<string, unknown>): string {
  return createHash('sha256').update(JSON.stringify(args || {})).digest('hex');
}

function getSigningMessage(payload: Omit<AdminOperationPayload, 'signature' | 'args'>): string {
  return [
    'Scavenjer Simulations Admin API',
    `Wallet: ${payload.walletAddress.toLowerCase()}`,
    `Operation: ${payload.operation}`,
    `Nonce: ${payload.nonce}`,
    `Timestamp: ${payload.timestamp}`,
    `Args Hash: ${payload.argsHash}`,
  ].join('\n');
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function toStringValue(value: unknown, field: string, required = true): string {
  if (value === undefined || value === null || value === '') {
    if (!required) return '';
    throw new Error(`Missing ${field}`);
  }

  if (typeof value !== 'string') {
    throw new Error(`Invalid ${field}`);
  }

  const trimmed = value.trim();
  if (required && !trimmed) {
    throw new Error(`Missing ${field}`);
  }

  if (trimmed.length > MAX_TEXT_LENGTH) {
    throw new Error(`${field} is too long`);
  }

  return trimmed;
}

function toOptionalString(value: unknown, field: string): string | null {
  const normalized = toStringValue(value, field, false);
  return normalized || null;
}

function toNumberValue(value: unknown, field: string): number {
  const numeric = typeof value === 'number' ? value : Number(value);
  if (!Number.isFinite(numeric)) {
    throw new Error(`Invalid ${field}`);
  }

  return numeric;
}

function createServiceClient(): SupabaseServiceClient {
  const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const supabaseServiceKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('Admin API is not configured');
  }

  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

function configuredAdminWallets(): Set<string> {
  const configured = (process.env.SIMULATIONS_ADMIN_WALLETS || '')
    .split(',')
    .map((wallet) => wallet.trim().toLowerCase())
    .filter(Boolean);

  return new Set(configured);
}

function pruneReplayCache(): void {
  const now = Date.now();
  for (const [key, expiresAt] of replayCache.entries()) {
    if (expiresAt <= now) replayCache.delete(key);
  }
}

function reserveNonce(walletAddress: string, nonce: string, timestamp: number): boolean {
  pruneReplayCache();
  if (replayCache.size >= MAX_REPLAY_CACHE_ENTRIES) {
    const oldestKey = replayCache.keys().next().value;
    if (typeof oldestKey === 'string') replayCache.delete(oldestKey);
  }
  const key = `${walletAddress.toLowerCase()}:${nonce}`;
  if (replayCache.has(key)) return false;
  replayCache.set(key, timestamp + FIVE_MINUTES_MS);
  return true;
}

async function isAuthorizedAdmin(
  supabase: SupabaseServiceClient,
  walletAddress: string
): Promise<boolean> {
  const wallet = walletAddress.toLowerCase();
  if (configuredAdminWallets().has(wallet)) return true;

  const { data, error } = await supabase.rpc('is_admin', {
    p_wallet_address: wallet,
  });

  if (error) {
    console.warn('Simulations admin RPC check unavailable:', error.message);
    return false;
  }

  return data === true;
}

async function verifyAdminPayload(
  supabase: SupabaseServiceClient,
  value: unknown
): Promise<AdminOperationPayload> {
  if (!isRecord(value)) throw new Error('Invalid request body');

  const payload = value as Partial<AdminOperationPayload>;
  const operation = payload.operation;
  if (typeof operation !== 'string' || !ALLOWED_OPERATIONS.has(operation)) {
    throw new Error('Unsupported admin operation');
  }

  const walletAddress = payload.walletAddress;
  if (typeof walletAddress !== 'string' || !/^0x[a-fA-F0-9]{40}$/.test(walletAddress)) {
    throw new Error('Invalid wallet address');
  }

  const { argsHash, nonce, signature, timestamp } = payload;
  if (
    typeof nonce !== 'string' ||
    typeof signature !== 'string' ||
    typeof argsHash !== 'string' ||
    typeof timestamp !== 'number'
  ) {
    throw new Error('Missing signature metadata');
  }

  if (Math.abs(Date.now() - timestamp) > FIVE_MINUTES_MS) {
    throw new Error('Signature expired');
  }

  const args = isRecord(payload.args) ? payload.args : {};
  const expectedArgsHash = hashArgs(args);
  if (argsHash !== expectedArgsHash) {
    throw new Error('Invalid request hash');
  }

  const verified = await verifyMessage({
    address: walletAddress as `0x${string}`,
    message: getSigningMessage({
      operation,
      walletAddress,
      timestamp,
      nonce,
      argsHash,
    }),
    signature: signature as `0x${string}`,
  });

  if (!verified) {
    throw new Error('Invalid signature');
  }

  if (!(await isAuthorizedAdmin(supabase, walletAddress))) {
    throw new Error('Admin authorization failed');
  }

  if (!reserveNonce(walletAddress, nonce, timestamp)) {
    throw new Error('Replay detected');
  }

  return {
    operation,
    args,
    walletAddress,
    timestamp,
    nonce,
    argsHash,
    signature,
  };
}

function loreRegionArgs(args: Record<string, unknown>) {
  return {
    p_region_id: toStringValue(args.region_id, 'region_id'),
    p_name: toStringValue(args.name, 'name'),
    p_description: toStringValue(args.description, 'description', false),
    p_color: toStringValue(args.color, 'color'),
    p_cx: toNumberValue(args.cx, 'cx'),
    p_cy: toNumberValue(args.cy, 'cy'),
    p_thumb_url: toStringValue(args.thumb_url, 'thumb_url', false),
    p_background_url: toStringValue(args.background_url, 'background_url', false),
    p_image_url: toStringValue(args.image_url, 'image_url', false),
    p_sort_order: Math.trunc(toNumberValue(args.sort_order ?? 0, 'sort_order')),
  };
}

function loreLocationArgs(args: Record<string, unknown>) {
  const locationType = toStringValue(args.location_type, 'location_type');
  if (!LOCATION_TYPES.has(locationType)) {
    throw new Error('Invalid location_type');
  }

  return {
    p_location_id: toStringValue(args.location_id, 'location_id'),
    p_region_id: toStringValue(args.region_id, 'region_id'),
    p_name: toStringValue(args.name, 'name'),
    p_description: toStringValue(args.description, 'description', false),
    p_cx: toNumberValue(args.cx, 'cx'),
    p_cy: toNumberValue(args.cy, 'cy'),
    p_location_type: locationType,
    p_thumb_url: toStringValue(args.thumb_url, 'thumb_url', false),
    p_sort_order: Math.trunc(toNumberValue(args.sort_order ?? 0, 'sort_order')),
  };
}

function indexEntryRow(value: unknown, partial = false) {
  if (!isRecord(value)) throw new Error('Invalid index entry');

  const row: Record<string, unknown> = {};
  if (!partial || value.id !== undefined) row.id = toStringValue(value.id, 'id', !partial);
  if (!partial || value.name !== undefined) row.name = toStringValue(value.name, 'name', !partial);

  if (!partial || value.simulation !== undefined) {
    const simulation = toStringValue(value.simulation, 'simulation', !partial);
    if (simulation && !SIMULATIONS.has(simulation)) throw new Error('Invalid simulation');
    if (simulation) row.simulation = simulation;
  }

  if (!partial || value.type !== undefined) {
    const type = toStringValue(value.type, 'type', !partial);
    if (type && !INDEX_TYPES.has(type)) throw new Error('Invalid type');
    if (type) row.type = type;
  }

  if (!partial || value.faction !== undefined) {
    const faction = toStringValue(value.faction, 'faction', !partial);
    if (faction) row.faction = faction;
  }

  if (!partial || value.description !== undefined) {
    row.description = toStringValue(value.description, 'description', false);
  }

  if (value.card_image_url !== undefined) {
    row.card_image_url = toOptionalString(value.card_image_url, 'card_image_url');
  }

  if (value.display_image_url !== undefined) {
    row.display_image_url = toOptionalString(value.display_image_url, 'display_image_url');
  }

  if (value.model_url !== undefined) {
    row.model_url = toOptionalString(value.model_url, 'model_url');
  }

  if (Array.isArray(value.genres)) {
    row.genres = value.genres.map((genre) => toStringValue(genre, 'genre')).slice(0, 20);
  }

  if (value.energy !== undefined) {
    row.energy = toOptionalString(value.energy, 'energy');
  }

  return row;
}

async function runOperation(
  supabase: SupabaseServiceClient,
  operation: string,
  args: Record<string, unknown>
) {
  switch (operation) {
    case 'upsertLoreRegion': {
      const { data, error } = await supabase.rpc('upsert_lore_region', loreRegionArgs(args));
      if (error) throw error;
      return data;
    }
    case 'upsertLoreLocation': {
      const { data, error } = await supabase.rpc('upsert_lore_location', loreLocationArgs(args));
      if (error) throw error;
      return data;
    }
    case 'updateLoreConfig': {
      const multiverseBackgroundUrl = toStringValue(args.multiverseBackgroundUrl, 'multiverseBackgroundUrl');
      const { data, error } = await supabase.rpc('update_lore_config', {
        p_config_key: 'multiverse_background',
        p_config_value: { multiverseBackgroundUrl },
      });
      if (error) throw error;
      return data;
    }
    case 'deleteLoreRegion': {
      const { data, error } = await supabase.rpc('delete_lore_region', {
        p_region_id: toStringValue(args.region_id, 'region_id'),
      });
      if (error) throw error;
      return data;
    }
    case 'deleteLoreLocation': {
      const { data, error } = await supabase.rpc('delete_lore_location', {
        p_location_id: toStringValue(args.location_id, 'location_id'),
      });
      if (error) throw error;
      return data;
    }
    case 'createIndexEntry': {
      const row = indexEntryRow(args.entry);
      const { data, error } = await supabase.from('index_entries').insert([row]).select().single();
      if (error) throw error;
      return data;
    }
    case 'updateIndexEntry': {
      const id = toStringValue(args.id, 'id');
      const row = indexEntryRow(args.updates, true);
      delete row.id;
      const { data, error } = await supabase.from('index_entries').update(row).eq('id', id).select().single();
      if (error) throw error;
      return data;
    }
    case 'deleteIndexEntry': {
      const { error } = await supabase
        .from('index_entries')
        .delete()
        .eq('id', toStringValue(args.id, 'id'));
      if (error) throw error;
      return true;
    }
    default:
      throw new Error('Unsupported admin operation');
  }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (handleCors(req, res, { methods: ['POST', 'OPTIONS'], headers: ['Content-Type'] })) return;

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    const supabase = createServiceClient();
    const payload = await verifyAdminPayload(supabase, req.body);
    const data = await runOperation(supabase, payload.operation, payload.args);

    return res.status(200).json({ success: true, data });
  } catch (error) {
    console.error('Simulations admin operation failed:', error);

    const message = error instanceof Error ? error.message : 'Admin operation failed';
    const status =
      message.includes('configured') ? 500 :
      message.includes('Unsupported') || message.includes('authorization') ? 403 :
      message.includes('signature') || message.includes('expired') || message.includes('Replay') ? 401 :
      message.includes('Missing') || message.includes('Invalid') ? 400 :
      500;

    return res.status(status).json({
      success: false,
      error: status === 500 ? 'Admin operation failed' : message,
    });
  }
}
