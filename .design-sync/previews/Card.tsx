import { Button, Card, MonoLabel, Pill } from "portfolio";

// The canonical raised surface: surface background, line border, 12px radius.
export const Basic = () => (
  <Card style={{ maxWidth: 380 }}>
    <MonoLabel>{"// card"}</MonoLabel>
    <p
      className="font-sans text-ink-soft"
      style={{ marginTop: 8, fontSize: 14, lineHeight: 1.6 }}
    >
      Eine erhabene Fläche mit line-Border und 12px Radius. Der generische
      Container hinter Projektkarten und Widgets.
    </p>
  </Card>
);

// A realistic composition: the surface used as a project card, with an eyebrow,
// status pill, serif heading and a ghost CTA.
export const ProjectCard = () => (
  <Card className="flex flex-col gap-4" style={{ maxWidth: 380 }}>
    <div className="flex items-center justify-between">
      <MonoLabel tone="pine">01 / Projekt</MonoLabel>
      <Pill dot>Live</Pill>
    </div>
    <h3 className="font-serif text-ink" style={{ fontSize: 22, margin: 0 }}>
      Portfolio
    </h3>
    <p
      className="font-sans text-ink-soft"
      style={{ fontSize: 14, lineHeight: 1.6, margin: 0 }}
    >
      Persönliche Portfolio-Seite, gebaut mit Next.js und einem eigenen
      Design-System.
    </p>
    <Button variant="ghost" href="#projekt">
      Ansehen
    </Button>
  </Card>
);
