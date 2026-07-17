import { Button } from "portfolio";

const row: React.CSSProperties = {
  display: "flex",
  gap: 16,
  alignItems: "center",
  flexWrap: "wrap",
};

// The three variants and their hover moves: primary (pine surface), secondary
// (control border), ghost (pine text only). Sweeps the primary variant axis.
export const Variants = () => (
  <div style={row}>
    <Button variant="primary">Projekte ansehen</Button>
    <Button variant="secondary">CV laden</Button>
    <Button variant="ghost">GitHub</Button>
  </div>
);

// With `href` the same variants render as anchors — how most CTAs on the site
// are used (jump to a section, open GitHub).
export const AsLink = () => (
  <div style={row}>
    <Button variant="primary" href="#projekte">
      Projekte ansehen
    </Button>
    <Button variant="ghost" href="https://github.com/spockey4711">
      GitHub
    </Button>
  </div>
);
