import { redirect } from "next/navigation";

// Usage was merged into Billing as a tab (2026-09) — this route now just forwards
// old links/bookmarks there. /settings/usage/firms is a separate page, unaffected.
export default function UsageRedirectPage() {
  redirect("/settings/billing?tab=usage");
}
