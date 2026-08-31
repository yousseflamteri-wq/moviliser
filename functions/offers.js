export async function onRequestGet({ request, env }) {
  const apiKey = env.OGADS_API_KEY;
  if (!apiKey) {
    return new Response(
      JSON.stringify({ success: false, error: 'OGADS_API_KEY environment variable not set in Cloudflare' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }

  const clientIp =
    request.headers.get('CF-Connecting-IP') ||
    request.headers.get('x-forwarded-for') ||
    '127.0.0.1';
  const userAgent = request.headers.get('user-agent') || '';

  const params = new URLSearchParams({
    ip: clientIp,
    user_agent: userAgent,
    max: '6'
  });

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);

    const response = await fetch(`https://lockerpreview.com/api/v2?${params.toString()}`, {
      headers: {
        Authorization: `Bearer ${apiKey}`,
        Accept: 'application/json'
      },
      signal: controller.signal
    });
    clearTimeout(timeout);

    if (!response.ok) {
      const text = await response.text();
      return new Response(
        JSON.stringify({ success: false, error: `OGAds API returned ${response.status}: ${text.slice(0, 200)}` }),
        { status: 502, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const data = await response.json();

    return new Response(JSON.stringify(data), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Cache-Control': 'no-store'
      }
    });
  } catch (err) {
    const message = err.name === 'AbortError' ? 'OGAds API request timed out' : err.message;
    return new Response(JSON.stringify({ success: false, error: message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
