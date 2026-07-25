type HeaderValue = string | string[] | undefined;

export type CorsRequest = {
  method?: string;
  headers?: Record<string, HeaderValue>;
};

export type CorsResponse = {
  status: (statusCode: number) => {
    json: (body: unknown) => unknown;
  };
  setHeader?: (name: string, value: string) => void;
};

type CorsOptions = {
  methods: string[];
  headers?: string[];
};

function normalizeOrigin(origin: string): string {
  try {
    const parsed = new URL(origin);
    return `${parsed.protocol}//${parsed.host}`.toLowerCase();
  } catch {
    return origin.replace(/\/+$/, '').toLowerCase();
  }
}

function envOrigins(name: string): string[] {
  return (process.env[name] || '')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);
}

function getHeader(req: CorsRequest, name: string): string | undefined {
  const headers = req.headers || {};
  const wanted = name.toLowerCase();

  for (const [key, value] of Object.entries(headers)) {
    if (key.toLowerCase() !== wanted) continue;
    return Array.isArray(value) ? value[0] : value;
  }

  return undefined;
}

function getAllowedOrigins(): Set<string> {
  const configured = [
    ...envOrigins('SIMULATIONS_ALLOWED_ORIGIN'),
    ...envOrigins('SIMULATIONS_ALLOWED_ORIGINS'),
  ];

  const derived = [
    process.env.SIMULATIONS_APP_URL,
    process.env.APP_URL,
    process.env.VITE_APP_URL,
    process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : undefined,
  ].filter((origin): origin is string => Boolean(origin));

  const localDev =
    process.env.NODE_ENV === 'production'
      ? []
      : [
          'http://localhost:3000',
          'http://127.0.0.1:3000',
          'http://localhost:4173',
          'http://127.0.0.1:4173',
          'http://localhost:5173',
          'http://127.0.0.1:5173',
        ];

  return new Set([...configured, ...derived, ...localDev].map(normalizeOrigin));
}

export function applyCors(req: CorsRequest, res: CorsResponse, options: CorsOptions): boolean {
  const origin = getHeader(req, 'origin');

  res.setHeader?.('Vary', 'Origin');
  res.setHeader?.('Access-Control-Allow-Methods', options.methods.join(', '));
  res.setHeader?.('Access-Control-Allow-Headers', (options.headers || ['Content-Type']).join(', '));
  res.setHeader?.('Access-Control-Max-Age', '86400');

  if (!origin) {
    return true;
  }

  if (getAllowedOrigins().has(normalizeOrigin(origin))) {
    res.setHeader?.('Access-Control-Allow-Origin', origin);
    return true;
  }

  return false;
}

export function handleCors(req: CorsRequest, res: CorsResponse, options: CorsOptions): boolean {
  if (!applyCors(req, res, options)) {
    res.status(403).json({ success: false, error: 'Origin not allowed' });
    return true;
  }

  if (req.method === 'OPTIONS') {
    res.status(204).json({});
    return true;
  }

  return false;
}
