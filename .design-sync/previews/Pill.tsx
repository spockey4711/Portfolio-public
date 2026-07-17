import { Pill } from "portfolio";

// The status pill with its pulsing signal-green dot — the availability marker
// from the hero ("Verfügbar für Werkstudent").
export const WithDot = () => <Pill dot>Verfügbar für Werkstudent</Pill>;

// Plain label, no dot.
export const LabelOnly = () => <Pill>Nur Label</Pill>;

// How pills are used as skill tags across the site.
export const SkillTags = () => (
  <div style={{ display: "flex", gap: 8, flexWrap: "wrap", maxWidth: 360 }}>
    <Pill>TypeScript</Pill>
    <Pill>React</Pill>
    <Pill>Next.js</Pill>
    <Pill>Tailwind CSS</Pill>
  </div>
);
