/** Simple category chips. Hidden entirely when there's only one group. */
export default function Filters({ tags, active, onPick }) {
  if (!tags || tags.length < 2) return null;
  const all = ['All', ...tags];
  return (
    <div className="mb-7 flex flex-wrap gap-2">
      {all.map((t) => {
        const on = active === t || (t === 'All' && !active);
        return (
          <button
            key={t}
            onClick={() => onPick(t === 'All' ? null : t)}
            className={`rounded-full border px-3.5 py-1.5 text-[13.5px] font-500 transition
              ${on ? 'border-ink bg-ink text-paper' : 'border-line bg-card text-ink-soft hover:border-ink/30'}`}
          >
            {t}
          </button>
        );
      })}
    </div>
  );
}
