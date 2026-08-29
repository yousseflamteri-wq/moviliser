export default function SectionHead({ title, count }) {
  return (
    <div className="mb-6 mt-4 flex items-baseline gap-3">
      <h2 className="font-display text-[26px] font-600 tracking-tight text-ink">{title}</h2>
      {count != null && <span className="text-[14px] text-ink-faint">{count} prompts</span>}
    </div>
  );
}
