import { useEffect } from 'react';

export default function TrailerModal({ trailerUrl, title, onClose }) {
  useEffect(() => {
    const handleKey = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [onClose]);

  if (!trailerUrl) return null;

  // Convert standard YouTube watch URLs to embed format
  const getEmbedUrl = (url) => {
    if (!url) return '';
    if (url.includes('youtube.com/watch?v=')) {
      return url.replace('watch?v=', 'embed/') + '?autoplay=1';
    }
    if (url.includes('youtu.be/')) {
      return url.replace('youtu.be/', 'www.youtube.com/embed/') + '?autoplay=1';
    }
    return url;
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 sm:p-8 animate-in fade-in duration-200">
      <div className="fixed inset-0 bg-black/90 backdrop-blur-md" onClick={onClose} />
      
      <div className="relative w-full max-w-4xl overflow-hidden rounded-2xl border border-white/10 bg-black shadow-2xl">
        <div className="flex items-center justify-between border-b border-white/10 px-4 py-3 bg-zinc-900">
          <span className="text-sm font-semibold text-zinc-200 truncate">{title} — Official Trailer</span>
          <button
            onClick={onClose}
            className="rounded-full p-1 text-zinc-400 hover:bg-white/10 hover:text-white"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="h-4 w-4">
              <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
            </svg>
          </button>
        </div>
        
        <div className="aspect-video w-full bg-black">
          <iframe
            src={getEmbedUrl(trailerUrl)}
            title={`${title} Trailer`}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="h-full w-full"
          />
        </div>
      </div>
    </div>
  );
}
