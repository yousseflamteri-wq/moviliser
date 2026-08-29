// POST /api/reveal { promptId } — spend one credit, receive the rest of the prompt.
//
// Returns 402 Payment Required when the session has no credit. That status is the
// single signal the client uses to open the locker.
import PROMPTS from '../_prompts.js';
import { json, resolveSession, creditCount, now } from '../_lib.js';

export async function onRequestPost({ request, env }) {
  const { sid, setCookie } = await resolveSession(request, env);
  const headers = setCookie ? { 'set-cookie': setCookie } : {};

  let body = {};
  try { body = await request.json(); } catch { /* empty body */ }

  const prompt = PROMPTS.find((p) => p.id === body.promptId);
  if (!prompt) return json({ error: 'no_such_prompt' }, 404, headers);

  // Already paid for? Hand it over, no charge.
  const owned = await env.DB.prepare(
    'SELECT 1 AS ok FROM unlocks WHERE sid = ? AND prompt_id = ?'
  ).bind(sid, prompt.id).first();

  if (owned) {
    return json({ unlocked: true, fullPrompt: prompt.prompt, credits: await creditCount(env, sid) },
      200, headers);
  }

  // Claim exactly one unspent credit. The UPDATE ... WHERE id = (SELECT ...) form
  // is atomic in SQLite, so two racing requests cannot both claim the same row.
  const spend = await env.DB.prepare(
    `UPDATE unlocks SET prompt_id = ?, spent_at = ?
      WHERE id = (SELECT id FROM unlocks WHERE sid = ? AND prompt_id IS NULL LIMIT 1)`
  ).bind(prompt.id, now(), sid).run();

  if (!spend.meta?.changes) {
    return json({ error: 'locked', need: 1, have: 0 }, 402, headers);
  }

  return json({ unlocked: true, fullPrompt: prompt.prompt, credits: await creditCount(env, sid) },
    200, headers);
}
