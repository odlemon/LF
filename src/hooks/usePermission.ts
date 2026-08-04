"use client";

import { useAuth } from "./useAuth";
import { Permission } from "@/lib/utils/permissions";

export function usePermission(permission: Permission): boolean {
  const { user } = useAuth();
  if (!user) {
    return false;
  }
  const roles = user.roles || [];
  if (roles.includes("SUPER_ADMIN") || roles.includes("ADMIN")) {
    return true;
  }
  if (!user.permissions) {
    return false;
  }
  return user.permissions.includes(permission);
}
