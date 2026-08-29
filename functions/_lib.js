// functions/_lib.js — shared helpers for every Pages Function.
//
// Everything here uses Web Crypto (globally available in the Workers runtime),
// so no nodejs_compat flag is needed and nothing depends on a Node polyfill.

export const json = (body, status = 200, extraHeaders = {}) =>
  new Response(JSON.stringify(body), {
    status,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': 'no-store',
      'x-content-type-options': 'nosniff',
      ...extraHeaders,
    },
  });

export const now = () => Date.now();
export const today = () => new Date().toISOString().slice(0, 10);

export const clientIp = (request) =>
  request.headers.get('cf-connecting-ip') ||
  (request.headers.get('x-forwarded-for') || '').split(',')[0].trim() ||
  '0.0.0.0';

/* ── hashing & signing ─────────────────────────────────────── */

const enc = new TextEncoder();

export async function sha256Hex(input, salt = '') {
  const buf = await crypto.subtle.digest('SHA-256', enc.encode(String(input) + salt));
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

async function hmacKey(secret) {
  return crypto.subtle.importKey('raw', enc.encode(secret), { name: 'HMAC', hash: 'SHA-256' },
    false, ['sign']);
}

async function hmac(secret, value) {
  const sig = await crypto.subtle.sign('HMAC', await hmacKey(secret), enc.encode(value));
  // base64url, trimmed — plenty of entropy for a cookie tag
  return btoa(String.fromCharCode(...new Uint8Array(sig)))
    .replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '').slice(0, 24);
}

// Constant-time string compare. Length is compared first (lengths are not secret),
// then every byte is examined regardless of early mismatches.
export function safeEqual(a, b) {
  const A = enc.encode(String(a));
  const B = enc.encode(String(b));
  if (A.length !== B.length) return false;
  let diff = 0;
  for (let i = 0; i < A.length; i++) diff |= A[i] ^ B[i];
  return diff === 0;
}

/* ── sessions ──────────────────────────────────────────────── */

const COOKIE = 'plsid';

function readCookie(request, name) {
  const raw = request.headers.get('cookie') || '';
  for (const part of raw.split(';')) {
    const i = part.indexOf('=');
    if (i < 0) continue;
    if (part.slice(0, i).trim() === name) return decodeURIComponent(part.slice(i + 1).trim());
  }
  return null;
}

/**
 * Resolve the visitor's session, minting one if the cookie is missing or forged.
 * Returns { sid, setCookie } — attach setCookie to the response when present.
 */
export async function resolveSession(request, env) {
  const secret = env.COOKIE_SECRET || 'dev-cookie-secret';
  const signed = readCookie(request, COOKIE);
  let sid = null;

  if (signed && signed.includes('.')) {
    const i = signed.lastIndexOf('.');
    const value = signed.slice(0, i);
    const tag = signed.slice(i + 1);
    if (safeEqual(await hmac(secret, value), tag)) {
      const row = await env.DB.prepare('SELECT sid FROM sessions WHERE sid = ?').bind(value).first();
      if (row) {
        await env.DB.prepare('UPDATE sessions SET last_seen = ? WHERE sid = ?')
          .bind(now(), value).run();
        return { sid: value, setCookie: null };
      }
      sid = value; // signature valid but row is gone (fresh DB) — re-insert it below
    }
  }

  if (!sid) {
    const bytes = new Uint8Array(16);
    crypto.getRandomValues(bytes);
    sid = [...bytes].map((b) => b.toString(16).padStart(2, '0')).join('');
  }

  const salt = env.HASH_SALT || 'dev-salt';
  await env.DB.prepare(
    `INSERT INTO sessions (sid, ip_hash, ua_hash, created_at, last_seen) VALUES (?,?,?,?,?)
     ON CONFLICT(sid) DO UPDATE SET last_seen = excluded.last_seen`
  ).bind(
    sid,
    (await sha256Hex(clientIp(request), salt)).slice(0, 32),
    (await sha256Hex(request.headers.get('user-agent') || '', salt)).slice(0, 32),
    now(), now()
  ).run();

  const tag = await hmac(secret, sid);
  const secure = new URL(request.url).protocol === 'https:' ? ' Secure;' : '';
  return {
    sid,
    setCookie: `${COOKIE}=${encodeURIComponent(`${sid}.${tag}`)}; Path=/; Max-Age=${60 * 60 * 24 * 90}; HttpOnly;${secure} SameSite=Lax`,
  };
}

/* ── credits ───────────────────────────────────────────────── */

export async function creditCount(env, sid) {
  const r = await env.DB.prepare(
    'SELECT COUNT(*) AS n FROM unlocks WHERE sid = ? AND prompt_id IS NULL'
  ).bind(sid).first();
  return r?.n ?? 0;
}

export async function unlockedIds(env, sid) {
  const r = await env.DB.prepare(
    'SELECT prompt_id FROM unlocks WHERE sid = ? AND prompt_id IS NOT NULL'
  ).bind(sid).all();
  return (r.results || []).map((x) => x.prompt_id);
}

/* ── config with sane defaults ─────────────────────────────── */

export const cfg = (env) => ({
  creditsPerConversion: Number(env.CREDITS_PER_CONVERSION || 1),
  postbackIps: (env.POSTBACK_IPS || '').split(',').map((s) => s.trim()).filter(Boolean),
  postbackSecret: env.POSTBACK_SECRET || '',
});
