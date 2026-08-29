/**
 * ConfirmingBanner — shown when the visitor is back from the offer but the
 * server-to-server postback hasn't landed yet. Gives them a manual "Check now"
 * so they never feel stuck waiting.
 */
export default function ConfirmingBanner({ visible, onCheck, checking }) {
  if (!visible) return null;
  return (
    <div className="sticky top-16 z-30 border-b border-line bg-accent-soft">
      <div className="mx-auto flex max-w-[1120px] flex-wrap items-center gap-3 px-5 py-3 sm:px-8">
        <span className="h-4 w-4 shrink-0 animate-spin rounded-full border-2 border-accent/30 border-t-accent" />
        <p className="flex-1 text-[14px] text-ink">
          Confirming your step — this can take up to a minute. Your prompt opens automatically.
        </p>
        <button
          onClick={onCheck}
          disabled={checking}
          className="rounded-full bg-ink px-4 py-1.5 text-[13px] font-600 text-paper transition
                     hover:bg-black disabled:opacity-50"
        >
          {checking ? 'Checking…' : 'Check now'}
        </button>
      </div>
    </div>
  );
}
