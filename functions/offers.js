export async function onRequestGet({ request, env }) {
  const apiKey = env.OGADS_API_KEY;
  if (!apiKey) {
    return new Response(JSON.stringify({ success: false, error: 'OGADS_API_KEY environment variable not set in Cloudflare' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  // Extract visitor IP and User-Agent headers directly from Cloudflare edge
  const clientIp = request.headers.get('CF-Connecting-IP') || request.headers.get('x-forwarded-for') || '127.0.0.1';
  const userAgent = request.headers.get('user-agent') || '';

  const params = new URLSearchParams({
    ip: clientIp,
    user_agent: userAgent,
    max: '6'
  });

  try {
    const response = await fetch(`https://lockerpreview.com/api/v2?${params.toString()}`, {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Accept': 'application/json'
      }
    });

    const data = await response.json();
    return new Response(JSON.stringify(data), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });
  } catch (err) {
    return new Response(JSON.stringify({ success: false, error: err.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
