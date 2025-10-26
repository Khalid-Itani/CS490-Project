import React from "react";            // add this

// src/CS490/UC-014/ColorGuide.js
const SWATCHES = [
  { name: "primary-color",   hex: "#1e88e5", use: "Primary actions, headings" },
  { name: "secondary-color", hex: "#1565c0", use: "Secondary actions, highlights" },
  { name: "accent-color",    hex: "#42a5f5", use: "Links, subtle emphasis" },
  { name: "success-color",   hex: "#4caf50", use: "Success states" },
  { name: "warning-color",   hex: "#ffb300", use: "Warnings" },
  { name: "error-color",     hex: "#e53935", use: "Errors" },
  { name: "info-color",      hex: "#29b6f6", use: "Informational" },
  { name: "text-color",      hex: "#212121", use: "Body text" },
  { name: "background-color",hex: "#fafafa", use: "App background" },
];

export default function ColorGuide() {
  return (
    <section style={{ marginTop: 24 }}>
      <h2 style={{ marginBottom: 12 }}>Color Guide</h2>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
          gap: 12,
        }}
      >
        {SWATCHES.map(({ name, hex, use }) => (
          <div
            key={name}
            style={{
              border: "1px solid var(--border-color)",
              borderRadius: 8,
              padding: 12,
              background: "var(--panel-bg)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: 6,
                  background: `var(--${name})`,
                  border: "1px solid var(--border-color)",
                }}
                title={`var(--${name})`}
              />
              <div>
                <div style={{ fontWeight: 600 }}>var(--{name})</div>
                <div style={{ fontSize: 12, color: "var(--muted-text-color)" }}>
                  {hex}
                </div>
              </div>
            </div>
            <div style={{ fontSize: 12, marginTop: 8, color: "var(--muted-text-color)" }}>
              Use: {use}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
