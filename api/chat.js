/**
 * Vercel Serverless Function → POST /api/chat
 * Same behavior as `functions/api/chat.js` (Cloudflare); env: ANTHROPIC_API_KEY.
 */

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: { message: 'Method not allowed' } });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return res.status(500).json({
      error: { message: 'ANTHROPIC_API_KEY is not configured for this project.' }
    });
  }

  let body;
  try {
    if (typeof req.body === 'string') {
      body = JSON.parse(req.body || '{}');
    } else if (req.body && typeof req.body === 'object') {
      body = req.body;
    } else {
      body = {};
    }
  } catch {
    return res.status(400).json({ error: { message: 'Invalid JSON body' } });
  }

  try {
    const upstream = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify(body)
    });

    const text = await upstream.text();
    let payload;
    try {
      payload = JSON.parse(text);
    } catch {
      payload = {
        error: {
          message: `Anthropic returned non-JSON (${upstream.status}): ${text.slice(0, 200)}`
        }
      };
    }

    return res.status(upstream.status).json(payload);
  } catch (err) {
    return res.status(500).json({ error: { message: err.message } });
  }
};
