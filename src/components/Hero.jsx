export default function Hero() {
  return (
    <section className="border-b border-line">
      <div className="mx-auto max-w-[1120px] px-5 py-14 sm:px-8 sm:py-20">
        <p className="mb-4 text-[13px] font-500 uppercase tracking-[.16em] text-accent">
          Curated image prompts
        </p>
        <h1 className="max-w-[16ch] font-display text-[38px] font-600 leading-[1.08] tracking-[-.02em] text-ink sm:text-[54px]">
          See the image. Get the exact prompt.
        </h1>
        <p className="mt-5 max-w-[52ch] text-[17px] leading-relaxed text-ink-soft sm:text-[18px]">
          Every image here was made from one carefully written prompt — the lens,
          the light, the palette, all of it. Pick one you like and it's yours to copy.
        </p>
      </div>
    </section>
  );
}
