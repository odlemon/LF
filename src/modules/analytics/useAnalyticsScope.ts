"use client";

import { useAuth } from "@/hooks/useAuth";

const FIRM_WIDE_ROLES = ["ADMIN", "SUPER_ADMIN", "PARTNER", "FINANCE"];

/**
 * Mirrors the server's `AnalyticsRoleScope`: a CRM user without a firm-wide role sees only
 * proposal performance and rate recommendations.
 *
 * <p>The rule lives in the backend and is enforced there — this exists so the interface does
 * not offer a screen the policy will refuse. Showing a CRM user an "Analytics" tab that lands
 * on "You do not have permission to perform this action" is worse than not showing the tab:
 * it reads as a broken product rather than a deliberate boundary.
 */
export function useAnalyticsScope() {
  const { user } = useAuth();
  const roles = (user?.roles || []).map((r) =>
    typeof r === "string" ? r : (r as { name?: string }).name || ""
  );
  const firmWide = roles.some((r) => FIRM_WIDE_ROLES.includes(r.toUpperCase()));
  const crmRestricted = !firmWide && roles.some((r) => r.toUpperCase() === "CRM");
  return { crmRestricted, firmWide };
}
