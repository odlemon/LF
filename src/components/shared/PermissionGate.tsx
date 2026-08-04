"use client";

import React from "react";
import { usePermission } from "@/hooks/usePermission";
import { Permission } from "@/lib/utils/permissions";

export interface PermissionGateProps {
  permission: Permission;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function PermissionGate({
  permission,
  children,
  fallback = null,
}: PermissionGateProps) {
  const hasAccess = usePermission(permission);
  if (!hasAccess) {
    return <>{fallback}</>;
  }
  return <>{children}</>;
}
