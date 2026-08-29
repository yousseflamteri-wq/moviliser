// GET /api/session — bootstrap. Mints the session cookie and reports credit state.
//
// The client polls this after the visitor returns from the offer: the postback
// lands server-to-server, so the browser has no other way to learn it succeeded.
import { json, resolveSession, creditCount, unlockedIds } from '../_lib.js';

export async function onRequestGet({ request, env }) {
  const { sid, setCookie } = await resolveSession(request, env);

  return json(
    {
      // Safe to expose: on its own a sid grants nothing. It only becomes useful
      // as aff_sub4, and turning it into a credit requires a signed postback
      // arriving from an allowlisted OGAds IP.
      sid,
      credits: await creditCount(env, sid),
      unlocked: await unlockedIds(env, sid),
    },
    200,
    setCookie ? { 'set-cookie': setCookie } : {}
  );
}
