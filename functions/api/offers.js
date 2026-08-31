export async function onRequestGet(context) {
  // Put your real OGAds API key here or add OGADS_API_KEY to Cloudflare Environment Variables
  const API_KEY = context.env.OGADS_API_KEY || 'YOUR_OGADS_API_KEY_HERE';

  const clientIp =
    context.request.headers.get('cf-connecting-ip') ||
    context.request.headers.get('x-real-ip') ||
    '127.0.0.1';

  const userAgent = context.request.headers.get('user-agent') || '';

  const queryParams = new URLSearchParams({
    ip: clientIp,
    user_agent: userAgent,
    ctype: '7', // CPI (1) + CPA (2) + PIN (4)
    min: '1',
    max: '5',
  });

  try {
    const response = await fetch(`https://lockerpreview.com/api/v2?${queryParams.toString()}`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${API_KEY}`,
      },
    });

    const data = await response.json();
    return new Response(JSON.stringify(data), {
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      },
    });
  } catch (error) {
    return new Response(JSON.stringify({ success: false, error: error.message, offers: [] }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
