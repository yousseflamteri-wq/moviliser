# Prompt Vault

A library of image prompts. Browsing is free; each **full prompt** opens after the
visitor completes one OGAds offer. Built to be simple for visitors and simple for
you to run.

- **Front end:** Vite + React + Tailwind v3 — a clean, image-forward gallery.
- **Back end:** Cloudflare Pages Functions + D1 — the paywall and the offer postback.
- **Cost:** $0 on Cloudflare's free tier, with your own domain. No image generation,
  no R2, no credit card.

---

## The one rule this project enforces

> The hidden part of a prompt **is not sent to the browser** until the server has
> confirmed a completed offer via OGAds postback.

No blur, no hidden `<div>`, no client-side flag. The characters simply aren't in the
page — so there's nothing to un-blur, select, or read from devtools. The React card
receives only `teaser` + a character count.

---

## How a visitor unlocks a prompt (the flow you asked about)

1. Visitor taps **Get the prompt** on a card.
2. A short sheet explains they'll complete one quick step, then taps **Continue**.
3. The page redirects to your **one** OGAds direct-link locker. Their session id
   rides along as `aff_sub4`.
4. They complete an offer. OGAds calls your `/api/postback` **server-to-server** and
   the server grants that session one unlock.
5. OGAds sends them back to your site (the redirect URL you set in the dashboard).
6. On return, the site sees the credit, **auto-opens the prompt they wanted, and
   copies it to their clipboard**. If the postback is still in flight, a small
   "Confirming…" bar with a **Check now** button shows until it lands.

You only ever need **one locker** — it's just a generic "complete an offer" gate.
Which prompt opens is decided by your site (from the session), not by the locker.

Edge cases handled:
- **Postback is slow** → polling (fast, then easing off) + a manual **Check now**;
  it also re-checks when the visitor returns to the tab.
- **In-app browser wiped storage** (TikTok/IG webview) → if we lose track of which
  prompt they wanted, they come back with a credit and tapping **any** card opens it
  instantly. Nobody gets stuck.
- **Someone shares the return link** → it's a plain public URL that grants nothing.
  The unlock lives in the session, created only by a signed postback.

---

## Adding prompts (one file each)

```bash
cp content/_TEMPLATE.md content/sunset-portrait.md
# edit it, drop your image in public/images/, then:
git add . && git commit -m "add prompt" && git push
```

Cloudflare rebuilds on push and the prompt is live. File format:

```markdown
---
title: Kodak Portra Street Portrait
tags: portrait, film, analog
teaser: 74
image: portra-street.jpg      # optional; put the file in public/images/
---
Candid half-body portrait of a woman in her early thirties on a narrow city
street, shot on Kodak Portra 400 with an 85mm f/1.4 lens wide open, ...
```

| key | meaning |
|---|---|
| `title` | shown on the card (first line is used if omitted) |
| `tags` | comma-separated → become the filter chips |
| `teaser` | characters shown free; the rest stays server-side (default 70) |
| `image` | your sample image in `public/images/`. If omitted, one is generated at build time |

Files starting with `_` are ignored.

---

## Run it locally

```bash
npm install
npx wrangler d1 create promptvault      # paste the id into wrangler.toml
npm run db:local                         # create the tables
cp .dev.vars.example .dev.vars           # then set real secrets: openssl rand -hex 32
npm run build
npm run serve                            # http://localhost:8788
```

`npm run dev` (Vite alone, port 5173) is fine for pure UI work; it proxies `/api` to
`npm run serve`.

---

## Deploy on Cloudflare (free)

1. Push to GitHub → Cloudflare dashboard → **Workers & Pages → Create → Pages →
   Connect to Git**. Build command `npm run build`, output dir `dist`.
2. **D1:** `npm run db:remote` to create the tables on the remote database, and put
   its `database_id` in `wrangler.toml`.
3. **Secrets** (Pages → Settings → Variables, encrypted): `COOKIE_SECRET`,
   `POSTBACK_SECRET`, `HASH_SALT` — each `openssl rand -hex 32`.
4. **Front-end build vars** (Pages → Settings → Variables): `VITE_LOCKER_URL` (your
   live locker link) and `VITE_LOCKER_SUB_PARAM` (usually `aff_sub4`).
5. **Domain** (Name.com / Namecheap): add the site to Cloudflare, switch the domain's
   nameservers to the two Cloudflare gives you, then Pages → **Custom domains**.

### OGAds settings
- **Locker:** one direct-link content locker (you have `lockerpreview.com/cl/i/d2oxx7`
  for testing; swap in the live link at launch).
- **Redirect URL** (where the locker sends users after an offer): your site, e.g.
  `https://yourdomain.com/` — that's what triggers the auto-open.
- **Postback URL** (Tools → Postback URL):
  ```
  https://yourdomain.com/api/postback?transaction_id={TRANSACTION_ID}&aff_sub4={AFF_SUB4}&payout={PAYOUT}&offer_id={OFFER_ID}&sig=YOUR_POSTBACK_SECRET
  ```
  > ⚠️ These macro names are the common CPA ones, but OGAds' exact list isn't publicly
  > documented. Confirm them in your dashboard and test with the **Postback Simulator**.
  > Every postback (accepted or rejected) is logged with its raw query to the
  > `postbacks` table, so you can see exactly what arrives:
  > ```
  > npx wrangler d1 execute promptvault --remote \
  >   --command="SELECT status, raw_query FROM postbacks ORDER BY received_at DESC LIMIT 10"
  > ```
- **Lock down the postback** once live: after the first real conversion, read the
  source IPs and put them in `POSTBACK_IPS` (wrangler.toml).
  ```
  npx wrangler d1 execute promptvault --remote \
    --command="SELECT DISTINCT src_ip FROM postbacks WHERE status='accepted'"
  ```

---

## Tested (real Workers runtime + local D1)

| test | result |
|---|---|
| `/api/prompts` contains the full prompt? | no — teaser + count only |
| reveal without a credit | `402` |
| postback with wrong / missing secret | `403` |
| postback with an unknown session | `400` |
| valid postback | `200`, one credit |
| same postback replayed ×2 | `duplicate`, still one credit |
| reveal after the postback | `200`, full prompt |
| built bundle scanned for prompts | 0 of 7 leaked (teasers aren't in it either) |
| full flow in a phone-sized browser | offer → auto-open → auto-copy ✓ |

The replay guard is `transaction_id TEXT PRIMARY KEY` in `schema.sql` — one line.

---

## Files

```
content/*.md            ← your prompts. one file each. this is the source of truth.
public/images/          ← sample images (yours, or generated at build)
scripts/
  build-content.js      compiles content/ → functions/_prompts.js (+ images)
  build-preview.js       builds demo.html (offline preview)
functions/
  _lib.js               sessions, HMAC cookies, credits
  _prompts.js           GENERATED — server-side only, never imported by React
  api/session.js        session + credit state (polled after the offer)
  api/prompts.js        teaser only  ← the file that makes the paywall real
  api/reveal.js         402, or the full prompt if a credit is spent
  api/postback.js       the four guards; the only way to earn a credit
src/
  App.jsx               the flow: unlock → offer → return → auto-open + copy
  api.js                all API calls + the locker redirect
  components/            Header, Hero, PromptCard, UnlockSheet, ConfirmingBanner, Filters, Toast
schema.sql              D1 tables
wrangler.toml           bindings + non-secret vars
```

> Never `import` `functions/_prompts.js` from `src/`. If you do, the full prompts ship
> to the browser and the paywall becomes decoration.

---

## Why this stays compliant

Locking content behind an offer is OGAds' actual model — not a trick. The trap is
promising something and delivering nothing. Here the prompt is real and arrives in
full, and the sheet says plainly *"complete one quick step from our partners"* — not
"verify you are human". Honest wording is also what keeps the account alive.
