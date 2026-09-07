import { apiClient } from "@/lib/api/client";
import { ENDPOINTS } from "@/lib/api/endpoints";

export interface PortalMe {
  uid: string;
  email: string;
  name: string;
  clientName?: string | null;
  clientProfileUid?: string | null;
  firmUid?: string | null;
  mustChangePassword?: boolean;
  active?: boolean;
  contactEmail?: string | null;
  country?: string | null;
  roleLabel?: string | null;
}

export async function getPortalMe(): Promise<PortalMe> {
  const res = await apiClient.get(ENDPOINTS.PORTAL_ACCOUNT.ME);
  return res.data;
}

export async function updatePortalMe(name: string): Promise<PortalMe> {
  const res = await apiClient.patch(ENDPOINTS.PORTAL_ACCOUNT.UPDATE_ME, { name });
  return res.data;
}

export async function changePortalPassword(
  currentPassword: string,
  newPassword: string
): Promise<void> {
  await apiClient.post(ENDPOINTS.PORTAL_ACCOUNT.CHANGE_PASSWORD, {
    currentPassword,
    newPassword,
  });
}

const NOTIF_KEY = "lysp.portal.notificationPrefs";

export type PortalNotificationPrefs = {
  proposalAlerts: boolean;
  weeklyDigest: boolean;
  coachTips: boolean;
};

export function loadNotificationPrefs(): PortalNotificationPrefs {
  if (typeof window === "undefined") {
    return { proposalAlerts: true, weeklyDigest: false, coachTips: true };
  }
  try {
    const raw = localStorage.getItem(NOTIF_KEY);
    if (!raw) return { proposalAlerts: true, weeklyDigest: false, coachTips: true };
    return { ...{ proposalAlerts: true, weeklyDigest: false, coachTips: true }, ...JSON.parse(raw) };
  } catch {
    return { proposalAlerts: true, weeklyDigest: false, coachTips: true };
  }
}

export function saveNotificationPrefs(prefs: PortalNotificationPrefs) {
  if (typeof window === "undefined") return;
  localStorage.setItem(NOTIF_KEY, JSON.stringify(prefs));
}
