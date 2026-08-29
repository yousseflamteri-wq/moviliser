import { useEffect } from 'react';

/**
 * UnlockSheet — the one screen before the offer.
 *
 * Plain language on purpose. It names the trade honestly ("complete one quick
 * step") instead of dressing the offer up as a security check. Honesty here is
 * also what keeps the OGAds account alive.
 */
export default function UnlockSheet({ item, onContinue, onClose }) {
  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => { window.removeEventListener('keydown', onKey); document.body.style.overflow = ''; };
  }, [onClose]);

  if (!item) return null;

  return (
    <div
      onClick={(e) => e.target === e.currentTarget && onClose()}
      className="fixed inset-0 z-[60] flex items-end justify-center bg-ink/40 animate-fade sm:items-center"
    >
      <div className="w-full max-w-[440px] rounded-t-3xl bg-card p-6 shadow-lift animate-sheet-up
                      sm:rounded-3xl sm:p-7">
        <div className="mb-4 flex items-start gap-4">
          <img src={item.image} alt="" className="h-16 w-16 shrink-0 rounded-xl object-cover" />
          <div className="min-w-0">
            <h3 className="font-display text-[20px] font-600 leading-tight text-ink">{item.title}</h3>
            <p className="mt-0.5 text-[13px] text-ink-faint">Full prompt · {item.words} words</p>
          </div>
        </div>

        <p className="text-[15px] leading-relaxed text-ink-soft">
          To open this prompt, complete <span className="font-600 text-ink">one quick step</span> from
          our partners — it's what keeps the library free. You'll come right back and the prompt
          copies itself.
        </p>

        <button
          onClick={onContinue}
          className="mt-5 w-full rounded-full bg-ink py-3.5 text-[15px] font-600 text-paper
                     transition hover:bg-black"
        >
          Continue
        </button>
        <button
          onClick={onClose}
          className="mt-2 w-full py-2 text-[14px] font-500 text-ink-faint transition hover:text-ink"
        >
          Maybe later
        </button>
      </div>
    </div>
  );
}
