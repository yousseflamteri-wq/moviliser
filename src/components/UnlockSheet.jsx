import { useEffect, useState } from 'react';

export default function UnlockSheet({ item, onContinue, onClose }) {
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (!item) return;
    const onKey = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [item, onClose]);

  if (!item) return null;

  const handleVerification = () => {
    setIsProcessing(true);
    // Simulate a brief "secure connection" delay before triggering the actual CPA flow
    setTimeout(() => {
      onContinue();
      setIsProcessing(false);
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-[80] flex items-end justify-center sm:items-center">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300" onClick={onClose} />
      
      <div className="relative w-full max-w-md transform overflow-hidden rounded-t-3xl bg-zinc-900 p-6 shadow-2xl ring-1 ring-white/10 transition-all sm:rounded-2xl sm:p-8 animate-in slide-in-from-bottom-8 duration-300 ease-out">
        
        <div className="mb-6 flex items-start gap-4 border-b border-white/5 pb-6">
          <img src={item.image} alt="" className="h-20 w-14 shrink-0 rounded-md object-cover shadow-md bg-zinc-800" />
          <div className="flex flex-col justify-center pt-1">
            <h3 className="text-lg font-bold leading-tight text-white">{item.title}</h3>
            <p className="mt-1 flex items-center gap-1.5 text-xs font-medium text-emerald-400">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              Ready to Stream
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <h4 className="text-base font-semibold text-zinc-100">Quick Verification Required</h4>
          <p className="text-sm leading-relaxed text-zinc-400">
            To prevent automated bots and keep our servers fast for real users, please complete a brief free verification step from our sponsors. Playback will begin automatically upon completion.
          </p>

          <button
            onClick={handleVerification}
            disabled={isProcessing}
            className="mt-6 flex w-full items-center justify-center rounded-md bg-white py-3.5 text-sm font-bold text-black transition-transform hover:scale-[1.02] active:scale-95 disabled:opacity-70 disabled:hover:scale-100"
          >
            {isProcessing ? (
              <span className="flex items-center gap-2">
                <svg className="h-4 w-4 animate-spin text-black" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Connecting...
              </span>
            ) : (
              "Verify & Watch Now"
            )}
          </button>
        </div>

        <button
          onClick={onClose}
          className="mt-4 w-full py-2 text-center text-xs font-medium text-zinc-500 transition hover:text-zinc-300"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
