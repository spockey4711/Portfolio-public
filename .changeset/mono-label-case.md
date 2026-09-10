---
"portfolio": patch
---

Fix `MonoLabel`'s case opt-out, which silently did nothing. Three call sites passed
`className="normal-case"` to keep text that carries its own casing - the Werdegang period
("seit Oktober 2024"), the blog post meta and the Signals widget's kickers. `cn` only joins
class names, so both `uppercase` and `normal-case` landed on the element and Tailwind's
emitted order decided the winner: `uppercase`. The period rendered as "SEIT OKTOBER 2024".

The opt-out is now an explicit `textCase="normal"` prop that emits one class or the other,
so it cannot be defeated by class order. Visible change: the Werdegang periods, the blog
post dates and reading times read in their intended casing again.
