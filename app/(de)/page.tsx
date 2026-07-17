import { Onepager } from "@/components/sections/Onepager";

// The German onepager at the canonical root (`/`). Its metadata - including the
// hreflang alternates to the English home - comes from the (de) root layout via
// buildRootMetadata, so this page only renders the shared section tree.
export default function Home() {
  return <Onepager locale="de" />;
}
