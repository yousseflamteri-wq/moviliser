// src/api.js — the only place the client talks to the server.
//
// There is no client-side unlock path here, and there couldn't be. `reveal` is a
// request, not a decision: the server either returns the withheld characters or
// answers 402, and the browser has no third option.

async function req(path, opts = {}) {
  const r = await fetch(path, { credentials: 'same-origin', ...opts });
  let body = null;
  try { body = await r.json(); } catch { /* non-JSON error page */ }
  return { status: r.status, ok: r.ok, body };
}

export const getSession = () => req('/api/session');
export const getPrompts = () => req('/api/prompts');

export const reveal = (promptId) =>
  req('/api/reveal', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ promptId }),
  });

// Remember what the visitor wanted across the offer round-trip.
//
// localStorage survives the full-page redirect and is the primary store. But some
// in-app browsers (TikTok/IG webviews) and sandboxed iframes block it and throw —
// so we keep an in-memory mirror too. If storage is blocked, pending is lost on a
// real redirect, and that's fine: when the visitor comes back with a spare credit,
// tapping any card opens it instantly (see onUnlock). Nothing gets stuck.
const PENDING = 'pl_pending';
let pendingMem = null;
export const setPending = (id) => {
  pendingMem = id;
  try { localStorage.setItem(PENDING, id); } catch {}
};
export const getPending = () => {
  try { const v = localStorage.getItem(PENDING); if (v) return v; } catch {}
  return pendingMem;
};
export const clearPending = () => {
  pendingMem = null;
  try { localStorage.removeItem(PENDING); } catch {}
};

/**
 * Send the visitor to the offer wall.
 *
 * This is a DIRECT-LINK locker (a full-page redirect), not a JS embed — so we
 * navigate the whole tab to it. `sid` rides along as a sub-id so the postback can
 * identify this visitor; when they finish, OGAds sends them to the redirect URL
 * you set in the dashboard (point it back at this site).
 *
 * LOCKER_URL and LOCKER_SUB_PARAM are injected at build time from .env — see
 * vite.config.js. Confirm the exact sub-id parameter in your OGAds dashboard.
 */
export function goToLocker(sid) {
  const base = import.meta.env.VITE_LOCKER_URL || '';
  const param = import.meta.env.VITE_LOCKER_SUB_PARAM || 'aff_sub4';
  if (!base) return false;
  const sep = base.includes('?') ? '&' : '?';
  window.location.href = `${base}${sep}${param}=${encodeURIComponent(sid)}`;
  return true;
}
