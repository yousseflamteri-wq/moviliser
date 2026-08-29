export default function Header({ credits }) {
  return (
    <header className="sticky top-0 z-40 border-b border-line bg-paper/85 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-[1120px] items-center justify-between px-5 sm:px-8">
        <a href="/" className="flex items-baseline gap-2">
          <span className="font-display text-[22px] font-600 tracking-tight text-ink">Prompt Vault</span>
        </a>
        {credits > 0 && (
          <span className="rounded-full bg-accent-soft px-3.5 py-1.5 text-[13px] font-500 text-accent">
            {credits} unlock{credits === 1 ? '' : 's'} ready
          </span>
        )}
      </div>
    </header>
  );
}
