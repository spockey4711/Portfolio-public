import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Divider } from "@/components/ui/Divider";
import { MonoLabel } from "@/components/ui/MonoLabel";
import { Pill } from "@/components/ui/Pill";
import { SectionHeader } from "@/components/ui/SectionHeader";

import type { Metadata } from "next";

// Living reference for the ui/ primitives (P1-2): renders every primitive and
// variant so hover states and tokens can be checked against the handoff. Kept
// out of the index and the sitemap — it is a development aid, not site content.
export const metadata: Metadata = {
  title: "UI primitives",
  robots: { index: false, follow: false },
};

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-4">
      <MonoLabel tone="muted">{label}</MonoLabel>
      <div className="flex flex-wrap items-center gap-4">{children}</div>
    </div>
  );
}

export default function PrimitivesPage() {
  return (
    <main className="mx-auto flex w-full max-w-(--container-max) flex-col gap-16 bg-bg py-24 pr-14 pl-26">
      <header className="flex flex-col gap-3">
        <MonoLabel>P1-2 / UI primitives</MonoLabel>
        <h1 className="font-display text-4xl text-ink">Primitives</h1>
        <p className="max-w-[46ch] font-sans text-ink-soft">
          Every ui/ primitive and its variants. Hover the buttons and links to check the transitions
          against the design handoff.
        </p>
      </header>

      <SectionHeader title="Section header" />

      <Row label="Button / variants">
        <Button variant="primary">Projekte ansehen</Button>
        <Button variant="secondary">CV laden</Button>
        <Button variant="ghost">GitHub</Button>
      </Row>

      <Row label="Button / as link">
        <Button variant="primary" href="#primary-link">
          Projekte ansehen
        </Button>
        <Button variant="ghost" href="https://github.com/spockey4711">
          GitHub
        </Button>
      </Row>

      <Row label="Pill">
        <Pill dot>Verfügbar für Werkstudent</Pill>
        <Pill>Nur Label</Pill>
      </Row>

      <Row label="MonoLabel / tones">
        <MonoLabel tone="pine">Pine kicker</MonoLabel>
        <MonoLabel tone="muted">Muted meta</MonoLabel>
        <MonoLabel tone="ink">Ink label</MonoLabel>
      </Row>

      <Row label="Card">
        <Card className="max-w-sm">
          <MonoLabel>{"// card"}</MonoLabel>
          <p className="mt-2 font-sans text-sm text-ink-soft">
            A raised surface with the line border and 12px radius.
          </p>
        </Card>
      </Row>

      <div className="flex flex-col gap-4">
        <MonoLabel tone="muted">Divider</MonoLabel>
        <Divider />
      </div>
    </main>
  );
}
