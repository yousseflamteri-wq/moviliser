import { useEffect, useState } from 'react';

export default function UnlockSheet({ item, onContinue, onClose }) {
  const [showOffers, setShowOffers] = useState(false);
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!item) {
      setShowOffers(false);
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
      return;
    }

    const onKey = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    
    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';

    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
    };
  }, [item, onClose]);

  if (!item) return null;

  const loadOffers = async () => {
    onContinue();

    setShowOffers(true);
    setLoading(true);
    try {
      const res = await fetch('/api/offers');
      const data = await res.json();
      setOffers(data.offers || []);
    } catch (error) {
      console.error("Failed to load offers", error);
    }
    setLoading(false);
  };

  return (
    <div
      onClick={(e) => e.target === e.currentTarget && onClose()}
      className="fixed inset-0 z-[60] flex items-end justify-center bg-black/80 backdrop-blur-sm animate-fade sm:items-center"
    >
      <div className="w-full max-w-[440px] rounded-t-3xl bg-card p-6 shadow-2xl ring-1 ring-white/10 animate-sheet-up
                      sm:rounded-3xl sm:p-7 max-h-[85vh] flex flex-col">
        <div className="mb-4 flex items-start gap-4 shrink-0">
          <img src={item.image} alt="" className="h-16 w-12 shrink-0 rounded-lg object-cover" />
          <div className="min-w-0">
            <h3 className="font-display text-[20px] font-600 leading-tight text-ink line-clamp-1">{item.title}</h3>
            <p className="mt-0.5 text-[13px] text-ink-faint">Ready to watch · {item.words}</p>
          </div>
        </div>

        {!showOffers ? (
          <>
            <p className="text-[15px] leading-relaxed text-ink-soft shrink-0">
              This platform is free. To start watching, complete <span className="font-600 text-ink">one quick step</span> from
              our partners — it's what keeps the movies free. You'll come right back and playback begins automatically.
            </p>

            <button
              onClick={loadOffers}
              className="mt-5 w-full rounded-full bg-accent py-3.5 text-[15px] font-600 text-white
                          transition hover:bg-red-500 shrink-0"
            >
              Continue
            </button>
          </>
        ) : (
          <div className="flex-1 overflow-y-auto mt-2 min-h-[200px] border-t border-line pt-4">
            {loading ? (
              <div className="flex items-center justify-center h-32">
                <span className="h-6 w-6 animate-spin rounded-full border-2 border-ink/30 border-t-ink" />
              </div>
            ) : offers.length > 0 ? (
              <div className="flex flex-col gap-2">
                <p className="text-[12.5px] text-ink-faint -mt-1 mb-1">
                  Complete <span className="font-600 text-ink">any one</span> task below to unlock.
                </p>
                {offers.map((offer, idx) => (
                  <OfferRow key={idx} offer={{ ...offer, rank: idx + 1 }} />
                ))}
              </div>
            ) : (
              <p className="text-center text-[14px] text-ink-soft py-4">No offers available right now.</p>
            )}
          </div>
        )}

        <button
          onClick={onClose}
          className="mt-3 w-full py-2 text-[14px] font-500 text-ink-faint transition hover:text-ink shrink-0"
        >
          Maybe later
        </button>
      </div>
    </div>
  );
}

function OfferRow({ offer }) {
  return (
    <a
      href={offer.link}
      target="_blank"
      rel="noopener noreferrer"
      className="group relative flex items-center gap-2.5 rounded-2xl border border-line
                 bg-paper p-2.5 shadow-sm transition hover:-translate-y-0.5 hover:border-ink/20
                 hover:shadow-md sm:gap-3 sm:p-3"
    >
      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full
                        bg-ink text-[11px] font-700 text-paper sm:h-6 sm:w-6 sm:text-[12px]">
        {offer.rank}
      </span>
      
      <img
        src={offer.picture}
        alt=""
        className="h-10 w-10 shrink-0 rounded-lg object-cover ring-1 ring-black/5 sm:h-12 sm:w-12 sm:rounded-xl"
      />
      
      <div className="min-w-0 flex-1" dir="auto">
        <h4 className="text-[12.5px] font-600 leading-snug text-ink line-clamp-1 sm:text-[14px]">
          {offer.name}
        </h4>
        <p className="mt-0.5 text-[11px] leading-snug text-ink-soft sm:text-[12px] sm:line-clamp-2">
          {offer.adcopy}
        </p>
      </div>

      <span className="shrink-0 rounded-full bg-ink px-2 py-1 text-[9px]
                        font-700 uppercase tracking-wide text-paper
                        transition group-hover:bg-[#111111] sm:px-2.5 sm:text-[10px]">
        Task
      </span>
    </a>
  );
}
