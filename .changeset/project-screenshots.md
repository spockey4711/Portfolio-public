---
"portfolio": minor
---

Add a screenshots section to the project detail pages. ADR-0011 defines a "carried"
project as one whose detail page shows real screenshots of the running product, and the
data model had no place for them. A case study can now carry a list of
`{ src, alt, caption }` shots, rendered between the features and the architecture - the
features claim what the product does, the shots show it, the architecture explains how.
`alt` and `caption` are both required per shot: the alt text replaces the image for a
screen reader, the caption tells every reader what the shot proves. English translates
both and inherits `src`, since one image file serves both languages. A project without
shots renders no section at all, which is every project for now - this ships the
infrastructure, the images follow with the content. The unused `media.screenshots` field
is dropped so there is only one place a screenshot can go.
