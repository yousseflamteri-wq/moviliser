import { useEffect } from 'react';

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
      className="fixed inset-0 z-[80] flex items-end justify-center bg-black/75 backdrop-blur-sm animate-fade sm:items-center"
    >
      <div className="w-full max-w-[440px] rounded-t-3xl bg-zinc-900 p-6 shadow-2xl ring-1 ring-white/10 animate-sheet-up
                      sm:rounded-3xl sm:p-8">
        <div className="mb-5 flex items-start gap-4">
          <img src={item.image} alt="" className="h-20 w-14 shrink-0 rounded-lg object-cover ring-1 ring-white/10" />
          <div className="min-w-0 pt-0.5">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-red-500">Ready to watch</p>
            <h3 className="mt-0.5 text-[19px] font-semibold leading-tight text-white line-clamp-2">{item.title}</h3>
          </div>
        </div>

        <div className="mb-5 flex items-center gap-4 rounded-2xl bg-zinc-800/60 px-4 py-3 ring-1 ring-white/5">
          <TrustPoint icon="shield" label="No account needed" />
          <TrustPoint icon="clock" label="Under a minute" />
          <TrustPoint icon="lock" label="Always free" />
        </div>

        <p className="text-[14.5px] leading-relaxed text-zinc-400">
          This platform stays free by partnering with advertisers instead of charging you.
          Complete <span className="font-semibold text-zinc-200">one quick step</span> below,
          and playback starts automatically when you're done.
        </p>

        <button
          onClick={onContinue}
          className="mt-6 flex w-full items-center justify-center gap-2 rounded-full bg-red-600 py-3.5
                     text-[15px] font-semibold text-white shadow-lg shadow-red-600/20
                     transition duration-150 hover:scale-[1.01] hover:bg-red-500 active:scale-[0.99]"
        >
          Continue
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" className="h-4 w-4">
            <path d="M5 12h14M13 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        <button
          onClick={onClose}
          className="mt-2.5 w-full py-2 text-[14px] font-medium text-zinc-500 transition hover:text-zinc-300"
        >
          Maybe later
        </button>
      </div>
    </div>
  );
}

function TrustPoint({ icon, label }) {
  const icons = {
    shield: <path d="M12 3l7 3v6c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6l7-3z" />,
    clock: <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3.5 2" /></>,
    lock: <><rect x="5" y="11" width="14" height="9" rx="2" /><path d="M8 11V7a4 4 0 018 0v4" /></>,
  };
  return (
    <div className="flex flex-1 flex-col items-center gap-1.5 text-center">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"
           className="h-5 w-5 text-zinc-400">
        {icons[icon]}
      </svg>
      <span className="text-[10.5px] leading-tight text-zinc-500">{label}</span>
    </div>
  );
}
