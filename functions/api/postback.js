// GET /api/postback — OGAds server-to-server conversion notification.
//
// This endpoint is the ONLY thing in the codebase that can grant a credit. It is
// called by OGAds' servers, never by the browser, so the visitor cannot forge it.
//
// Four guards, in order:
//   1. source IP allowlist   (POSTBACK_IPS)
//   2. shared secret         (constant-time compare)
//   3. sid must be a session we ourselves issued
//   4. transaction_id is a PRIMARY KEY -> a replayed postback grants nothing
//
// ⚠ OGAds' full postback macro list is NOT publicly documented. The parameter
// names below are the conventional CPA ones and several aliases. Confirm the real
// ones in your dashboard (Tools -> Postback URL, then the Postback Simulator).
// Every call is logged to the `postbacks` table with its raw query string, so you
// can read exactly what arrives and adjust these names.
import { json, clientIp, safeEqual, now, cfg } from '../_lib.js';

export async function onRequest({ request, env }) {
  const url = new URL(request.url);
  const q = Object.fromEntries(url.searchParams);
  const C = cfg(env);
  const ip = clientIp(request);

  const txn = q.transaction_id || q.txid || q.conversion_id;
  const sid = q.aff_sub4 || q.sub4 || q.s4;
  const sig = q.sig || '';

  const log = async (status, transaction_id) => {
    try {
      await env.DB.prepare(
        `INSERT INTO postbacks (transaction_id, sid, payout, offer_id, src_ip, raw_query, status, received_at)
         VALUES (?,?,?,?,?,?,?,?)`
      ).bind(transaction_id, sid ?? null, Number(q.payout) || null, q.offer_id ?? null,
             ip, url.search, status, now()).run();
      return { inserted: true };
    } catch (e) {
      // PRIMARY KEY collision -> we've already processed this transaction_id.
      if (/UNIQUE|PRIMARY/i.test(String(e.message))) return { duplicate: true };
      throw e;
    }
  };

  if (!txn) return json({ ok: false, error: 'missing_transaction_id' }, 400);

  // Guard 1 — source IP.
  if (C.postbackIps.length && !C.postbackIps.includes(ip)) {
    await log('rejected_ip', `rej-ip-${txn}-${now()}`);
    return json({ ok: false, error: 'rejected_ip' }, 403);
  }

  // Guard 2 — shared secret. Refuse outright if none is configured.
  if (!C.postbackSecret || !safeEqual(C.postbackSecret, sig)) {
    await log('rejected_sig', `rej-sig-${txn}-${now()}`);
    return json({ ok: false, error: 'rejected_sig' }, 403);
  }

  // Guard 3 — the sid must be one of ours.
  const known = sid
    ? await env.DB.prepare('SELECT 1 AS ok FROM sessions WHERE sid = ?').bind(sid).first()
    : null;
  if (!known) {
    await log('rejected_sid', `rej-sid-${txn}-${now()}`);
    return json({ ok: false, error: 'rejected_sid' }, 400);
  }

  // Guard 4 — idempotency. Insert first; a duplicate txn fails here and we stop.
  const res = await log('accepted', txn);
  if (res.duplicate) return json({ ok: true, duplicate: true });

  // Grant the credit(s).
  const stmts = [];
  for (let i = 0; i < C.creditsPerConversion; i++) {
    stmts.push(env.DB.prepare(
      'INSERT INTO unlocks (sid, prompt_id, granted_by, created_at) VALUES (?, NULL, ?, ?)'
    ).bind(sid, txn, now()));
  }
  await env.DB.batch(stmts);

  return json({ ok: true, granted: C.creditsPerConversion });
}
