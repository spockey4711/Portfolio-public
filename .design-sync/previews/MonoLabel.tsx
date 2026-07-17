import { MonoLabel } from "portfolio";

// Uppercase, letter-spaced mono micro-text — the "technical" voice of the
// design. Sweeps the three tones (pine, muted, ink).
export const Tones = () => (
  <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
    <MonoLabel tone="pine">Pine kicker</MonoLabel>
    <MonoLabel tone="muted">Muted meta</MonoLabel>
    <MonoLabel tone="ink">Ink label</MonoLabel>
  </div>
);
