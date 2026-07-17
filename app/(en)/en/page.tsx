import { Onepager } from "@/components/sections/Onepager";

// The English onepager at `/en`. Its metadata - including the hreflang alternates
// back to the German home - comes from the (en) root layout via buildRootMetadata,
// so this page only renders the shared section tree in English.
export default function Home() {
  return <Onepager locale="en" />;
}
