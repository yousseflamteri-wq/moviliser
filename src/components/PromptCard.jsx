import { useState } from 'react';

/**
 * PromptCard — image-forward, one clear action.
 *
 * The props are `teaser` and `hiddenChars`. There is deliberately no `hiddenText`
 * prop: the server never sent those characters, so React never holds them. The
 * card can't leak what it was never given. `fullPrompt` only arrives after the
 * server confirms a completed offer.
 */
export default function PromptCard({ item, busy, onUnlock, onCopy }) {
  const { title, image, tags, teaser, unlocked, fullPrompt } = item;
  const [copied, setCopied] = useState(false);

  async function copy() {
    await onCopy(item);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  }

  return (
    <article className="group flex flex-col overflow-hidden rounded-2xl border border-line bg-card
                        shadow-card transition-shadow duration-200 hover:shadow-lift">
      <div className="relative aspect-[4/5] overflow-hidden bg-line">
        <img
          src={image}
          alt={title}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
        />
        {!unlocked && (
          <span className="absolute left-3 top-3 rounded-full bg-ink/80 px-2.5 py-1 text-[11px]
                           font-500 text-paper backdrop-blur-sm">
            Prompt locked
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col p-4 sm:p-5">
        <h3 className="font-display text-[19px] font-600 leading-snug text-ink">{title}</h3>

        {tags?.length > 0 && (
          <p className="mt-1 text-[12.5px] text-ink-faint">{tags.join(' · ')}</p>
        )}

        <p className="prompt-preview mt-3 flex-1">
          {unlocked ? (
            fullPrompt
          ) : (
            <>
              <span className="text-ink-soft">{teaser}</span>
              <span className="text-ink-faint">… </span>
              <span className="text-ink-faint">— the rest opens after one quick step.</span>
            </>
          )}
        </p>

        <div className="mt-4">
          {unlocked ? (
            <button
              onClick={copy}
              className="w-full rounded-full border border-line bg-paper py-2.5 text-[14.5px]
                         font-600 text-ink transition hover:border-ink/30"
            >
              {copied ? 'Copied ✓' : 'Copy prompt'}
            </button>
          ) : (
            <button
              onClick={() => onUnlock(item)}
              disabled={busy}
              className="w-full rounded-full bg-ink py-2.5 text-[14.5px] font-600 text-paper
                         transition hover:bg-black disabled:opacity-50"
            >
              {busy ? 'Opening…' : 'Get the prompt'}
            </button>
          )}
        </div>
      </div>
    </article>
  );
}
