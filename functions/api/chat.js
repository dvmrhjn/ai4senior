const corsJson = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type'
};

export async function onRequestPost(context) {
  const { request, env } = context;

  if (!env.ANTHROPIC_API_KEY) {
    return new Response(
      JSON.stringify({
        error: { message: 'ANTHROPIC_API_KEY is not configured for this Pages project.' }
      }),
      { status: 500, headers: { 'Content-Type': 'application/json', ...corsJson } }
    );
  }

  try {
    const body = await request.json();

    const upstream = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': env.ANTHROPIC_API_KEY,
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

    return new Response(JSON.stringify(payload), {
      status: upstream.status,
      headers: { 'Content-Type': 'application/json', ...corsJson }
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: { message: err.message } }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsJson }
    });
  }
}

export async function onRequestOptions() {
  return new Response(null, { headers: corsJson });
}
