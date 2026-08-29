// scripts/build-content.js
//
// Compiles content/*.md into two artefacts:
//   1. functions/_prompts.js  — the full prompts, imported ONLY by Pages Functions.
//                               Vite never touches functions/, so these strings
//                               cannot end up in the browser bundle.
//   2. public/images/*.jpg    — one image per prompt, generated on first sight and
//                               reused forever after (keyed by prompt-text hash).
//
// Runs as part of `npm run build`, so a `git push` with one new .md file is enough
// to publish a new prompt. Run it locally first if you'd rather commit the image
// than spend build minutes generating it.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const CONTENT = path.join(ROOT, 'content');
const IMAGES = path.join(ROOT, 'public', 'images');
const OUT = path.join(ROOT, 'functions', '_prompts.js');

fs.mkdirSync(IMAGES, { recursive: true });

const sha1 = (s) => crypto.createHash('sha1').update(s).digest('hex');

/* ── parse ──────────────────────────────────────────────────── */

function parse(file) {
  const raw = fs.readFileSync(path.join(CONTENT, file), 'utf8');
  const meta = {};
  let body = raw;

  const fm = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
  if (fm) {
    for (const line of fm[1].split(/\r?\n/)) {
      const i = line.indexOf(':');
      if (i > 0) meta[line.slice(0, i).trim().toLowerCase()] = line.slice(i + 1).trim();
    }
    body = fm[2];
  }

  // One clean paragraph — image models want a single line, not markdown.
  const prompt = body.split(/\r?\n/).map((l) => l.trim()).filter(Boolean).join(' ').trim();
  if (!prompt) return null;

  const lines = body.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  const title = meta.title || lines[0].slice(0, 80);
  const teaserChars = Math.max(20, Math.min(Number(meta.teaser) || 70, prompt.length - 10));

  return {
    id: sha1(file).slice(0, 12),
    file,
    title,
    tags: (meta.tags || '').split(',').map((t) => t.trim()).filter(Boolean),
    teaserChars,
    prompt,
    hash: sha1(prompt),
    manualImage: meta.image || null,
  };
}

/* ── image resolution ───────────────────────────────────────── */

function findImage(item) {
  if (item.manualImage && fs.existsSync(path.join(IMAGES, item.manualImage)))
    return `/images/${item.manualImage}`;

  const base = item.file.replace(/\.[^.]+$/, '');
  for (const ext of ['jpg', 'jpeg', 'png', 'webp'])
    if (fs.existsSync(path.join(IMAGES, `${base}.${ext}`))) return `/images/${base}.${ext}`;

  const auto = `auto-${item.id}-${item.hash.slice(0, 8)}.jpg`;
  if (fs.existsSync(path.join(IMAGES, auto))) return `/images/${auto}`;
  return null;
}

// Build-time generation goes through Pollinations: no key, no account, so a fresh
// clone or a CI build needs no secrets to produce the library images.
async function generate(item) {
  const seed = parseInt(item.hash.slice(0, 6), 16) % 1e6;
  const url = `https://image.pollinations.ai/prompt/${encodeURIComponent(item.prompt)}` +
    `?model=flux&width=768&height=768&nologo=true&seed=${seed}`;

  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const r = await fetch(url, { signal: AbortSignal.timeout(150_000) });
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      const buf = Buffer.from(await r.arrayBuffer());
      if (buf.length < 2000) throw new Error(`too small (${buf.length}b)`);
      const name = `auto-${item.id}-${item.hash.slice(0, 8)}.jpg`;
      fs.writeFileSync(path.join(IMAGES, name), buf);
      return { path: `/images/${name}`, kb: Math.round(buf.length / 1024) };
    } catch (e) {
      console.warn(`      attempt ${attempt}/3 failed: ${e.message}`);
      if (attempt === 3) return null;
      await new Promise((r) => setTimeout(r, 3000 * attempt));
    }
  }
}

/* ── main ───────────────────────────────────────────────────── */

const files = fs.readdirSync(CONTENT)
  .filter((f) => /\.(md|txt)$/i.test(f) && !f.startsWith('_') && !f.startsWith('.'))
  .sort();

console.log(`[content] ${files.length} file(s) in content/`);

const out = [];
let generated = 0;
let failed = 0;

for (const file of files) {
  const item = parse(file);
  if (!item) { console.warn(`  ! ${file} — empty, skipped`); continue; }

  let image = findImage(item);
  if (!image) {
    console.log(`  ⟳ ${file} — no image yet, generating...`);
    const g = await generate(item);
    if (!g) {
      console.error(`  ✗ ${file} — image generation failed, EXCLUDED from this build`);
      failed++;
      continue;   // never ship a card with a broken image
    }
    image = g.path;
    generated++;
    console.log(`    ✓ ${g.kb}kb`);
  }

  out.push({
    id: item.id,
    title: item.title,
    tags: item.tags,
    image,
    teaserChars: item.teaserChars,
    words: item.prompt.split(/\s+/).length,
    prompt: item.prompt,
  });
  console.log(`  · ${item.title}  (${item.teaserChars} shown / ${item.prompt.length - item.teaserChars} withheld)`);
}

// Sorted newest-first would need dates; filename order is stable and predictable.
const banner = `// GENERATED by scripts/build-content.js — do not edit by hand.
// Source of truth is content/*.md
//
// SERVER-SIDE ONLY. This module is imported by functions/ (Pages Functions) and is
// never referenced from src/, so Vite does not bundle it into the client. If you
// ever import it from React, the full prompts ship to the browser and the paywall
// stops meaning anything.
`;

fs.writeFileSync(OUT, `${banner}export default ${JSON.stringify(out, null, 2)};\n`);

const withheld = out.reduce((n, p) => n + (p.prompt.length - p.teaserChars), 0);
console.log(`[content] wrote functions/_prompts.js — ${out.length} prompts, ${withheld} characters withheld`);
if (generated) console.log(`[content] generated ${generated} new image(s)`);
if (failed) {
  console.error(`[content] ${failed} file(s) excluded due to image failures`);
  if (!out.length) process.exit(1);
}
