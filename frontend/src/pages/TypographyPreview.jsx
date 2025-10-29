export default function TypographyPreview() {
  return (
    <main className="mx-auto max-w-4xl px-6 py-10 space-y-8">
      <div className="space-y-2">
        <p className="eyebrow">Typography System</p>
        <h1>H1 — Hero Headline</h1>
        <p className="caption">Caption: Inter · 14px · leading-5 · gray-400</p>
      </div>

      <section className="space-y-4">
        <h2>H2 — Section Heading</h2>
        <p>
          Body text uses <strong>Inter</strong> with readable <em>line heights</em>.
          Resize your window to verify responsive heading scales and hierarchy.
        </p>
      </section>

      <section className="space-y-2">
        <h3>H3 — Subsection</h3>
        <p>Links look like <a href="#">this link</a>. Captions below:</p>
        <small>Small text · captions for meta information or helper text</small>
      </section>

      <section className="space-y-1">
        <h4>H4 — Card Title</h4>
        <h5>H5 — Minor Heading</h5>
        <h6>H6 — Small Heading</h6>
      </section>
    </main>
  );
}
