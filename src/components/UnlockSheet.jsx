import { useEffect, useState } from 'react';

export default function UnlockSheet({ item, onComplete, onClose }) {
  // 0: Fetching, 1: Selecting best server, 2: Done & Ready
  const [phase, setPhase] = useState(0);
  const [showOffers, setShowOffers] = useState(false);
  const [offers, setOffers] = useState([]);
  const [error, setError] = useState(null);

  // Verification security timer
  const [verifying, setVerifying] = useState(false);
  const [countdown, setCountdown] = useState(45);
  const [verifyFailed, setVerifyFailed] = useState(false);

  useEffect(() => {
    if (!item) return;
    const onKey = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';

    // Step 1: Fetching servers (0 to 1.4s)
    const t1 = setTimeout(() => {
      setPhase(1); // Step 2: Selecting fastest server (1.4s to 2.8s)
    }, 1400);

    // Step 3: Complete handshake at 2.8s
    const t2 = setTimeout(() => {
      setPhase(2);
    }, 2800);

    // Pre-fetch the 3 offers quietly in the background
    fetch('/api/offers')
      .then((res) => res.json())
      .then((data) => {
        const fetched = data.offers || [];
        if (Array.isArray(fetched) && fetched.length > 0) {
          setOffers(fetched.slice(0, 3));
        } else {
          setError(data.error || 'No active streaming servers found.');
        }
      })
      .catch((err) => setError(err.message));

    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [item, onClose]);

  // 45-second timer when an offer is opened
  useEffect(() => {
    let timer;
    if (verifying && countdown > 0) {
      timer = setInterval(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [verifying, countdown]);

  const handleOfferClick = () => {
    setVerifying(true);
    setCountdown(45);
    setVerifyFailed(false);
  };

  const handleCheckVerification = () => {
    if (countdown > 5) {
      setVerifyFailed(true);
      return;
    }
    onComplete();
  };

  if (!item) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      {/* Background Dimmer */}
      <div 
        onClick={onClose} 
        className="fixed inset-0 bg-black/90 backdrop-blur-md transition-opacity duration-300" 
      />

      {/* Centered Modal */}
      <div className="relative w-full max-w-xl mx-auto my-auto overflow-hidden rounded-2xl border border-white/10 bg-[#0d1117] p-5 sm:p-6 shadow-2xl shadow-black backdrop-blur-2xl">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 flex h-8 w-8 items-center justify-center rounded-full bg-black/60 text-zinc-400 transition hover:bg-white/10 hover:text-white"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        </button>

        {/* 1. REALISTIC VIDEO PLAYER */}
        <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-black border border-white/10 shadow-inner flex flex-col justify-between">
          
          {/* Backdrop Blur Poster */}
          <img 
            src={item.image} 
            alt="" 
            className="absolute inset-0 w-full h-full object-cover opacity-35 blur-[1.5px] scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-black/60" />

          {/* Top Header */}
          <div className="relative z-10 flex items-center justify-between p-3.5">
            <div className="flex items-center gap-2">
              <span className={`flex h-2 w-2 rounded-full ${phase === 2 ? 'bg-emerald-500 animate-pulse' : 'bg-red-500 animate-ping'}`} />
              <span className="text-xs font-bold text-white tracking-wide truncate max-w-[240px]">
                {item.title}
              </span>
            </div>
            <span className="rounded bg-red-600/90 px-2 py-0.5 text-[10px] font-black uppercase tracking-wider text-white shadow">
              1080p HD
            </span>
          </div>

          {/* Center Content: Sequential Server Handshake -> Real Play Button */}
          <div className="relative z-10 flex flex-col items-center justify-center text-center px-4">
            {phase === 0 && (
              <div className="flex flex-col items-center gap-3">
                <div className="h-10 w-10 animate-spin rounded-full border-2 border-red-500/20 border-t-red-500" />
                <p className="text-xs font-semibold text-zinc-300 tracking-wide animate-pulse">
                  Fetching streaming servers...
                </p>
              </div>
            )}

            {phase === 1 && (
              <div className="flex flex-col items-center gap-3">
                <div className="h-10 w-10 animate-spin rounded-full border-2 border-emerald-500/20 border-t-emerald-500" />
                <p className="text-xs font-semibold text-emerald-400 tracking-wide animate-pulse">
                  Selecting the fastest server node...
                </p>
              </div>
            )}

            {phase === 2 && (
              <button
                onClick={() => setShowOffers(true)}
                className="group relative flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-tr from-red-700 via-red-600 to-red-500 text-white shadow-2xl shadow-red-600/60 ring-4 ring-white/10 transition-all duration-300 hover:scale-110 hover:shadow-red-600/80 active:scale-95"
              >
                {/* Realistic Play Button Inner Ring & Glow */}
                <div className="absolute inset-0 rounded-full bg-white/10 opacity-0 transition-opacity group-hover:opacity-100" />
                <svg
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="h-9 w-9 ml-1.5 drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)] transition-transform group-hover:scale-105"
                >
                  <path d="M8 5v14l11-7z" />
                </svg>
              </button>
            )}
          </div>

          {/* Bottom Video Progress Bar */}
          <div className="relative z-10 p-3 bg-gradient-to-t from-black via-black/80 to-transparent">
            <div className="w-full h-1 bg-white/20 rounded-full overflow-hidden mb-2">
              <div 
                className="h-full bg-red-600 transition-all duration-700 ease-out" 
                style={{ width: phase === 0 ? '25%' : phase === 1 ? '70%' : '100%' }}
              />
            </div>
            <div className="flex items-center justify-between text-[11px] text-zinc-400">
              <div className="flex items-center gap-3">
                <svg viewBox="0 0 24 24" fill="currentColor" className="h-3.5 w-3.5 text-zinc-300">
                  <path d="M8 5v14l11-7z" />
                </svg>
                <span>00:00 / 02:14:30</span>
              </div>
              <span className="text-zinc-400 font-medium flex items-center gap-1.5">
                {phase < 2 ? (
                  <span>Initializing Stream...</span>
                ) : (
                  <span className="text-emerald-400 flex items-center gap-1">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" /> Edge Node 1 (Ready)
                  </span>
                )}
              </span>
            </div>
          </div>
        </div>

        {/* 2. LOWER SECTION: SYNCHRONIZED REVEAL */}
        <div className="mt-5">
          {/* While servers are fetching/selecting, show matching synchronized loading bar */}
          {phase < 2 ? (
            <div className="flex items-center justify-center gap-2.5 p-4 rounded-xl border border-white/5 bg-white/[0.02] text-zinc-500 text-xs font-medium">
              <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-zinc-600 border-t-zinc-300" />
              <span>Checking network routes & server capacity...</span>
            </div>
          ) : !showOffers ? (
            /* High Server Load Notice & Continue Button appear together with the Start Button */
            <div className="flex flex-col items-center text-center p-4 rounded-xl border border-amber-500/20 bg-amber-500/5 transition-all duration-500">
              <div className="flex items-center gap-2 mb-2 text-amber-400">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4 shrink-0">
                  <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <span className="text-xs font-bold uppercase tracking-wide">High Server Load Detected</span>
              </div>

              <p className="text-xs sm:text-[13px] text-zinc-300 leading-relaxed max-w-md">
                Due to high traffic, please complete a quick server verification to unlock continuous high-speed streaming.
              </p>

              <button
                onClick={() => setShowOffers(true)}
                className="mt-4 flex w-full max-w-sm items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-red-600 to-red-500 py-3 text-sm font-bold text-white shadow-xl shadow-red-600/30 transition hover:brightness-110 active:scale-95"
              >
                <span>Continue to Verification</span>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="h-4 w-4">
                  <path d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          ) : (
            /* Step 2: The 3 Server Offers */
            <div className="flex flex-col gap-2.5">
              <div className="flex items-center justify-between px-1 mb-0.5">
                <span className="text-xs font-semibold text-zinc-300 flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-emerald-500" /> Choose Verification Server
                </span>
                <span className="text-[11px] text-emerald-400 font-medium">Free Access</span>
              </div>

              {error ? (
                <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-center text-xs text-red-300">
                  {error}
                </div>
              ) : (
                offers.map((offer, idx) => (
                  <a
                    key={offer.offer_id || idx}
                    href={offer.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={handleOfferClick}
                    className="group flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-white/[0.04] p-3 transition-all hover:border-red-500/50 hover:bg-white/[0.08] active:scale-[0.99]"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-red-600/15 border border-red-500/30 text-red-500 group-hover:bg-red-600 group-hover:text-white transition">
                        <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
                          <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
                        </svg>
                      </div>
                      <div className="min-w-0">
                        <h4 className="truncate text-xs font-bold text-zinc-100 group-hover:text-white">
                          {offer.name_short || offer.name || `Server Mirror #${idx + 1}`}
                        </h4>
                        <p className="truncate text-[11px] text-zinc-400">
                          {offer.adcopy || 'Quick verification to start player'}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span className="rounded bg-white/5 px-2 py-1 text-[10px] font-semibold text-zinc-300 group-hover:text-white">
                        Connect
                      </span>
                      <svg viewBox="0 0 24 24" fill="currentColor" className="h-3.5 w-3.5 text-zinc-400 group-hover:text-red-500 transition">
                        <path d="M8 5v14l11-7z" />
                      </svg>
                    </div>
                  </a>
                ))
              )}
            </div>
          )}
        </div>

        {/* 3. VERIFICATION TIMER BUFFER */}
        {verifying && (
          <div className="mt-3.5 rounded-xl border border-white/10 bg-zinc-900/95 p-4">
            <div className="flex items-center gap-3">
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-red-500/20 border-t-red-500 shrink-0" />
              <div className="flex-1">
                <p className="text-xs font-bold text-white">
                  Awaiting Offer Completion...
                </p>
                <p className="text-[11px] text-zinc-400 mt-0.5">
                  Complete the steps in your opened window to unlock full 1080p stream.
                </p>
              </div>
              <span className="font-mono text-xs font-semibold text-red-400 bg-red-500/10 px-2 py-1 rounded">
                {countdown > 0 ? `${countdown}s` : 'Ready'}
              </span>
            </div>

            {verifyFailed && (
              <div className="mt-2.5 flex items-center gap-2 rounded-lg bg-red-500/10 p-2.5 text-[11px] text-red-300 border border-red-500/20">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4 shrink-0 text-red-400">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
                <span>Step not completed yet. Please finish the instructions in the opened window.</span>
              </div>
            )}

            <button
              onClick={handleCheckVerification}
              className={`mt-3 flex w-full items-center justify-center gap-2 rounded-xl py-2.5 text-xs font-bold transition active:scale-95 ${
                countdown <= 5
                  ? 'bg-emerald-500 text-black hover:bg-emerald-400 shadow-lg'
                  : 'bg-zinc-800 text-zinc-400 cursor-not-allowed'
              }`}
            >
              {countdown > 5 ? `Verifying Task... (${countdown}s)` : 'Check Completion & Start Movie'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
