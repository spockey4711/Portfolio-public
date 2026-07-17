import { SectionHeader } from "portfolio";

// The shared section eyebrow: a numbered mono label (NN / Title) followed by a
// divider line that fills the remaining width. Numbered from 1.
export const Default = () => (
  <div style={{ minWidth: 520 }}>
    <SectionHeader index={1} title="Projekte" />
  </div>
);

// Several headers stacked, as they appear down the page.
export const Numbered = () => (
  <div
    style={{
      display: "flex",
      flexDirection: "column",
      gap: 28,
      minWidth: 520,
    }}
  >
    <SectionHeader index={2} title="Über mich" />
    <SectionHeader index={4} title="Skills" />
    <SectionHeader index={5} title="Kontakt" />
  </div>
);
