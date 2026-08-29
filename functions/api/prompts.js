// GET /api/prompts — the library.
//
// This is the response that decides whether the whole product works. It carries
// `teaser` and `hiddenChars`, and NOT `fullPrompt`, unless this session has
// already paid for that specific prompt. The withheld characters are never
// serialised, so there is nothing in the page to un-blur, select, or read from
// devtools.
import PROMPTS from '../_prompts.js';
import { json, resolveSession, creditCount, unlockedIds } from '../_lib.js';

export async function onRequestGet({ request, env }) {
  const { sid, setCookie } = await resolveSession(request, env);
  const owned = new Set(await unlockedIds(env, sid));

  const items = PROMPTS.map((p) => {
    const base = {
      id: p.id,
      title: p.title,
      image: p.image,
      tags: p.tags,
      words: p.words,
      teaser: p.prompt.slice(0, p.teaserChars),
      hiddenChars: Math.max(0, p.prompt.length - p.teaserChars),
    };
    return owned.has(p.id)
      ? { ...base, unlocked: true, fullPrompt: p.prompt }
      : { ...base, unlocked: false };
  });

  return json(
    { items, credits: await creditCount(env, sid) },
    200,
    setCookie ? { 'set-cookie': setCookie } : {}
  );
}
