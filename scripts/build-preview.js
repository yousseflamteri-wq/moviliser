// scripts/build-preview.js — bundle dist/ into ONE self-contained demo.html.
//
// The React build is used untouched; only window.fetch and the offer round-trip
// are stubbed, so the demo exercises the same component tree and the same
// 402-driven flow that ships. Images inline as data URLs so it needs no server.
//
// IMPORTANT: build the dist/ this reads with VITE_LOCKER_URL EMPTY, so goToLocker
// returns false and the demo hook (window.__plSimulateOffer) stands in for the
// real redirect. Run: VITE_LOCKER_URL= npm run build && node scripts/build-preview.js
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const DIST = path.join(ROOT, 'dist');
const PROMPTS = (await import(path.join(ROOT, 'functions', '_prompts.js'))).default;

let html = fs.readFileSync(path.join(DIST, 'index.html'), 'utf8');

const assets = fs.readdirSync(path.join(DIST, 'assets'));
const css = fs.readFileSync(path.join(DIST, 'assets', assets.find((f) => f.endsWith('.css'))), 'utf8');
const js = fs.readFileSync(path.join(DIST, 'assets', assets.find((f) => f.endsWith('.js'))), 'utf8');

const dataUrl = (p) =>
  `data:image/jpeg;base64,${fs.readFileSync(path.join(DIST, p.replace(/^\//, ''))).toString('base64')}`;

// Mirrors exactly what /api/prompts returns — teaser + count only, no full prompt.
const items = PROMPTS.map((p) => ({
  id: p.id,
  title: p.title,
  image: dataUrl(p.image),
  tags: p.tags,
  words: p.words,
  teaser: p.prompt.slice(0, p.teaserChars),
  hiddenChars: Math.max(0, p.prompt.length - p.teaserChars),
  _full: p.prompt,          // demo only; the real server keeps this out of the browser
}));

const shim = `
/* ═════ DEMO SHIM — stands in for the Pages Functions + the offer. Not shipped. ═════ */
(() => {
  const DATA = ${JSON.stringify(items)};
  const S = { sid: 'demo' + Math.random().toString(16).slice(2, 12), credits: 0, owned: new Set() };
  const reply = (status, body) => Promise.resolve({ ok: status < 400, status, json: () => Promise.resolve(body) });

  window.fetch = async (url, opt = {}) => {
    const u = String(url);
    const body = opt.body ? JSON.parse(opt.body) : {};
    if (u.includes('/api/session'))
      return reply(200, { sid: S.sid, credits: S.credits, unlocked: [...S.owned] });
    if (u.includes('/api/prompts'))
      return reply(200, { credits: S.credits, items: DATA.map((d) => {
        const { _full, ...pub } = d;
        return S.owned.has(d.id) ? { ...pub, unlocked: true, fullPrompt: _full } : { ...pub, unlocked: false };
      })});
    if (u.includes('/api/reveal')) {
      const it = DATA.find((d) => d.id === body.promptId);
      if (!it) return reply(404, { error: 'no_such_prompt' });
      if (S.owned.has(it.id)) return reply(200, { unlocked: true, fullPrompt: it._full, credits: S.credits });
      if (S.credits < 1) return reply(402, { error: 'locked', need: 1, have: 0 });
      S.credits--; S.owned.add(it.id);
      return reply(200, { unlocked: true, fullPrompt: it._full, credits: S.credits });
    }
    return reply(404, {});
  };

  // Stands in for the real full-page redirect to the locker + the server-to-server
  // postback. Grants a credit after ~2s, then triggers the same "returned" check.
  window.__plSimulateOffer = () => {
    setTimeout(() => { S.credits++; if (window.__plReturn) window.__plReturn(); }, 2000);
  };
})();
`;

const banner = `
<div style="background:#1c1a17;color:#f7f4ee;padding:10px 20px;font:500 13px/1.5 Inter,system-ui,sans-serif;text-align:center">
  Interactive demo — real React build, server &amp; offer simulated in the browser.
  “Continue” fakes a completed offer after ~2s, then auto-opens &amp; copies the prompt.
</div>`;

// Neutralise "</script>" inside the bundle, and use replacer functions so "$&"/"$'"
// in the minified code aren't treated as replacement patterns.
const inlineSafe = (code) => code.replace(/<\/script/gi, '<\\/script');

html = html
  .replace(/<link rel="stylesheet"[^>]*href="[^"]*\.css"[^>]*>/, () => `<style>${css}</style>`)
  .replace(/<script type="module"[^>]*src="[^"]*\.js"[^>]*><\/script>/,
           () => `<script>${inlineSafe(shim)}</script>\n<script type="module">${inlineSafe(js)}</script>`)
  .replace('<div id="root"></div>', () => `${banner}\n<div id="root"></div>`);

fs.writeFileSync(path.join(ROOT, 'demo.html'), html);
console.log(`demo.html — ${(html.length / 1024).toFixed(0)}kb, ${items.length} prompts inlined`);
