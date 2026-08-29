import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  getSession, getPrompts, reveal,
  goToLocker, setPending, getPending, clearPending,
} from './api';
import Header from './components/Header';
import Hero from './components/Hero';
import SectionHead from './components/SectionHead';
import Filters from './components/Filters';
import PromptCard from './components/PromptCard';
import UnlockSheet from './components/UnlockSheet';
import ConfirmingBanner from './components/ConfirmingBanner';
import Toast from './components/Toast';

export default function App() {
  const [items, setItems] = useState([]);
  const [credits, setCredits] = useState(0);
  const [sid, setSid] = useState(null);
  const [loadError, setLoadError] = useState(false);
  const [busyId, setBusyId] = useState(null);
  const [sheet, setSheet] = useState(null);        // item awaiting the offer
  const [confirming, setConfirming] = useState(false);
  const [checking, setChecking] = useState(false);
  const [activeTag, setActiveTag] = useState(null);
  const [toast, setToast] = useState(null);

  const pollRef = useRef(null);
  const toastRef = useRef(null);
  const cardRefs = useRef({});

  const notify = useCallback((msg, tone = 'ok') => {
    setToast({ msg, tone });
    clearTimeout(toastRef.current);
    toastRef.current = setTimeout(() => setToast(null), 3200);
  }, []);

  /* ── auto-copy helper ─────────────────────────────────────── */
  const copyText = useCallback(async (text) => {
    try { await navigator.clipboard.writeText(text); return true; }
    catch { return false; }
  }, []);

  /* ── reveal ───────────────────────────────────────────────── */
  // Ask the server for the withheld characters. 402 => not paid => open the sheet.
  const tryReveal = useCallback(async (item, { auto = false } = {}) => {
    setBusyId(item.id);
    const { status, ok, body } = await reveal(item.id);
    setBusyId(null);

    if (status === 402) return { paid: false };
    if (!ok) { notify('Something went wrong — try again.', 'bad'); return { paid: false }; }

    setItems((prev) => prev.map((x) =>
      x.id === item.id ? { ...x, unlocked: true, fullPrompt: body.fullPrompt } : x));
    setCredits(body.credits);

    if (auto) {
      const copied = await copyText(body.fullPrompt);
      notify(copied ? 'Unlocked & copied to clipboard ✓' : 'Prompt unlocked ✓');
      // bring the freshly opened card into view
      requestAnimationFrame(() => {
        cardRefs.current[item.id]?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      });
    }
    return { paid: true };
  }, [notify, copyText]);

  /* ── boot + return-from-offer handling ────────────────────── */
  const refreshAndMaybeReveal = useCallback(async (list) => {
    const s = await getSession();
    if (!s.ok) return { credits: 0 };
    setSid(s.body.sid);
    setCredits(s.body.credits);

    // If we came back from an offer, we stashed which prompt was wanted.
    const pendingId = getPending();
    if (pendingId && s.body.credits > 0) {
      const item = (list || items).find((x) => x.id === pendingId);
      if (item && !s.body.unlocked.includes(item.id)) {
        clearPending();
        setConfirming(false);
        await tryReveal(item, { auto: true });
      } else {
        clearPending();
      }
    } else if (pendingId && s.body.credits === 0) {
      // Back, but the postback hasn't landed yet. Wait for it.
      setConfirming(true);
      startPolling(list || items);
    }
    return { credits: s.body.credits };
  }, [items, tryReveal]);

  useEffect(() => {
    (async () => {
      const p = await getPrompts();
      if (!p.ok) { setLoadError(true); return; }
      setItems(p.body.items);
      await refreshAndMaybeReveal(p.body.items);
    })();
    return () => { clearInterval(pollRef.current); clearTimeout(toastRef.current); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Re-check when the tab regains focus (in-app browsers often freeze timers).
  useEffect(() => {
    const onVis = () => { if (document.visibilityState === 'visible' && getPending()) checkNow(); };
    document.addEventListener('visibilitychange', onVis);
    return () => document.removeEventListener('visibilitychange', onVis);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items]);

  /* ── polling for a late postback ──────────────────────────── */
  function startPolling(list) {
    clearInterval(pollRef.current);
    const started = Date.now();
    let tick = 0;
    const beat = async () => {
      // fast for the first 30s, then ease off; never fully give up while the tab is open
      tick++;
      const elapsed = Date.now() - started;
      const s = await getSession();
      if (s.ok && s.body.credits > 0) {
        clearInterval(pollRef.current);
        const pendingId = getPending();
        const item = (list || items).find((x) => x.id === pendingId);
        setConfirming(false);
        clearPending();
        if (item) await tryReveal(item, { auto: true });
        else { setCredits(s.body.credits); notify('You have an unlock ready — pick any prompt.'); }
      }
      // adjust cadence
      const next = elapsed < 30000 ? 3000 : elapsed < 120000 ? 8000 : 20000;
      clearInterval(pollRef.current);
      pollRef.current = setInterval(beat, next);
    };
    pollRef.current = setInterval(beat, 3000);
  }

  async function checkNow() {
    setChecking(true);
    await refreshAndMaybeReveal(items);
    setChecking(false);
  }

  /* ── unlock click ─────────────────────────────────────────── */
  async function onUnlock(item) {
    // Maybe they already have a spare credit (came back earlier, didn't spend it).
    if (credits > 0) {
      const r = await tryReveal(item, { auto: true });
      if (r.paid) return;
    }
    setSheet(item);
  }

  function continueToOffer() {
    if (!sheet) return;
    const item = sheet;
    setPending(item.id);
    if (goToLocker(sid)) return;               // production: full-page redirect to the locker
    // No locker URL configured. In the interactive demo a hook stands in for the
    // offer round-trip; in a misconfigured production build we surface the error.
    setSheet(null);
    if (typeof window.__plSimulateOffer === 'function') {
      setConfirming(true);
      window.__plSimulateOffer();
    } else {
      notify('Locker URL not set.', 'bad');
    }
  }

  // Let the demo shim trigger the same "returned from offer" check the page load runs.
  useEffect(() => {
    window.__plReturn = () => refreshAndMaybeReveal(items);
    return () => { delete window.__plReturn; };
  }, [items, refreshAndMaybeReveal]);

  async function copyPrompt(item) {
    const ok = await copyText(item.fullPrompt);
    notify(ok ? 'Copied to clipboard ✓' : 'Press ⌘/Ctrl+C to copy', ok ? 'ok' : 'bad');
  }

  /* ── tag groups ───────────────────────────────────────────── */
  const allTags = useMemo(() => {
    const set = new Set();
    items.forEach((i) => (i.tags || []).forEach((t) => set.add(t)));
    return [...set].sort();
  }, [items]);

  const shown = activeTag ? items.filter((i) => (i.tags || []).includes(activeTag)) : items;

  /* ── render ───────────────────────────────────────────────── */
  return (
    <>
      <Header credits={credits} />
      <ConfirmingBanner visible={confirming} onCheck={checkNow} checking={checking} />
      <Hero />

      <main className="mx-auto max-w-[1120px] px-5 pb-20 pt-10 sm:px-8">
        <SectionHead title="The library" count={items.length || null} />

        {loadError ? (
          <p className="py-16 text-center text-ink-faint">
            Couldn't load the library right now. Please refresh.
          </p>
        ) : !items.length ? (
          <div className="grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="aspect-[4/5] rounded-2xl bg-line" />
                <div className="mt-3 h-4 w-2/3 rounded bg-line" />
                <div className="mt-2 h-3 w-1/2 rounded bg-line" />
              </div>
            ))}
          </div>
        ) : (
          <>
            <Filters tags={allTags} active={activeTag} onPick={setActiveTag} />
            <div className="grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-3">
              {shown.map((item) => (
                <div key={item.id} ref={(el) => (cardRefs.current[item.id] = el)}>
                  <PromptCard
                    item={item}
                    busy={busyId === item.id}
                    onUnlock={onUnlock}
                    onCopy={copyPrompt}
                  />
                </div>
              ))}
            </div>
          </>
        )}
      </main>

      <footer className="border-t border-line">
        <div className="mx-auto max-w-[1120px] px-5 py-10 sm:px-8">
          <p className="font-display text-[18px] font-600 text-ink">Prompt Vault</p>
          <p className="mt-1 max-w-[60ch] text-[13.5px] leading-relaxed text-ink-faint">
            A hand-picked library of image prompts. Free to browse; each full prompt opens after a
            quick step from our partners, which keeps the lights on.
          </p>
        </div>
      </footer>

      <UnlockSheet item={sheet} onContinue={continueToOffer} onClose={() => setSheet(null)} />
      <Toast toast={toast} />
    </>
  );
}
