import { handleCors, type CorsRequest, type CorsResponse } from './_utils/cors';

type VercelRequest = CorsRequest;
type VercelResponse = CorsResponse;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (handleCors(req, res, { methods: ['POST', 'OPTIONS'], headers: ['Content-Type'] })) return;

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  return res.status(410).json({
    success: false,
    error: 'Legacy bulk save endpoint disabled. Use signed admin operations.',
  });
}
