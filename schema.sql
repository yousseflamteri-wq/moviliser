-- D1 schema. Apply with:
--   npx wrangler d1 execute promptlock --local  --file=./schema.sql
--   npx wrangler d1 execute promptlock --remote --file=./schema.sql
--
-- There is no `prompts` table. The prompt library lives in content/*.md and is
-- compiled into functions/_prompts.js at build time — server-side only, never
-- shipped to the browser. D1 holds only the mutable per-visitor state below.

-- One row per visitor. `sid` is what we hand to the locker as aff_sub4 and what
-- comes back on the postback.
CREATE TABLE IF NOT EXISTS sessions (
  sid        TEXT PRIMARY KEY,
  ip_hash    TEXT NOT NULL,
  ua_hash    TEXT NOT NULL,
  created_at INTEGER NOT NULL,
  last_seen  INTEGER NOT NULL
);

-- Credits earned by completing an offer, then spent to reveal a prompt.
-- prompt_id NULL  = an unspent credit
-- prompt_id set   = that prompt is permanently unlocked for this session
CREATE TABLE IF NOT EXISTS unlocks (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  sid        TEXT NOT NULL,
  prompt_id  TEXT,
  granted_by TEXT NOT NULL,          -- the postback transaction_id that paid for it
  created_at INTEGER NOT NULL,
  spent_at   INTEGER
);
-- Stops one prompt being unlocked twice for a session. Partial index so multiple
-- NULL prompt_id rows (unspent credits) remain legal.
CREATE UNIQUE INDEX IF NOT EXISTS idx_unlocks_unique
  ON unlocks(sid, prompt_id) WHERE prompt_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_unlocks_sid ON unlocks(sid);

-- Every postback ever received. transaction_id is the PRIMARY KEY, so a replayed
-- postback collides on insert and grants nothing. This one line is the replay guard.
CREATE TABLE IF NOT EXISTS postbacks (
  transaction_id TEXT PRIMARY KEY,
  sid            TEXT,
  payout         REAL,
  offer_id       TEXT,
  src_ip         TEXT,
  raw_query      TEXT,
  status         TEXT NOT NULL,      -- accepted | rejected_sig | rejected_ip | rejected_dupe | rejected_sid
  received_at    INTEGER NOT NULL
);
