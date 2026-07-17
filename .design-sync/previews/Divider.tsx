import { Divider, MonoLabel } from "portfolio";

// A 1px horizontal rule in the `line` token — the section separator. Shown
// between two labels so the rule reads as the separator it is.
export const Default = () => (
  <div
    style={{
      display: "flex",
      flexDirection: "column",
      gap: 16,
      minWidth: 320,
      maxWidth: 460,
    }}
  >
    <MonoLabel tone="muted">Werdegang</MonoLabel>
    <Divider />
    <MonoLabel tone="muted">Skills</MonoLabel>
  </div>
);
