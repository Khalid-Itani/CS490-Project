import React from "react";

const Panel = ({ title, style }) => (
  <div
    style={{
      background: "var(--panel-bg)",
      border: "1px solid var(--border-color)",
      borderRadius: 12,
      padding: 16,
      ...style
    }}
  >
    <div style={{ fontWeight: 600, marginBottom: 8 }}>{title}</div>
    <p style={{ margin: 0, color: "var(--text-color)" }}>
      Body text — should be easy to read.
    </p>
    <p style={{ marginTop: 6, color: "var(--muted-text-color)" }}>
      Muted text — for hints, helper copy, metadata.
    </p>
    <a href="/" style={{ display: "inline-block", marginTop: 6 }}>
      Link sample
    </a>
  </div>
);

export default function ContrastSamples() {
  return (
    <section style={{ marginTop: 24 }}>
      <h2 style={{ marginBottom: 12 }}>Contrast Samples</h2>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
          gap: 12
        }}
      >
        <Panel title="Light Panel" />
        <div
          style={{
            /* Force dark palette just for this card’s preview */
            background: "var(--background-color)",
            borderRadius: 12,
            padding: 0
          }}
          aria-label="Dark preview wrapper"
        >
          <div
            style={{
              /* Temporarily apply dark theme vars inside this card */
              /* Tip: using a nested attribute selector in CSS would be cleaner, 
                 but inline keeps it simple for the demo */
              color: "var(--text-color)"
            }}
          >
            <div
              style={{
                background: "var(--panel-bg)",
                border: "1px solid var(--border-color)",
                borderRadius: 12,
                padding: 16
              }}
            >
              <div style={{ fontWeight: 600, marginBottom: 8 }}>Dark Panel</div>
              <p style={{ margin: 0 }}>Body text — should be easy to read.</p>
              <p style={{ marginTop: 6, color: "var(--muted-text-color)" }}>
                Muted text — for hints, helper copy, metadata.
              </p>
              <a href="/" style={{ display: "inline-block", marginTop: 6 }}>
                Link sample
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}