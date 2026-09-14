"use client";

import React, { useState } from "react";
import { useRoles } from "@/modules/roles/hooks/useRoles";
import { PermissionGate } from "@/components/shared/PermissionGate";
import { PERMISSIONS } from "@/lib/utils/permissions";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Input, Textarea } from "@/components/ui/Input";
import { 
  HiPlus, 
  HiLockClosed, 
  HiX, 
  HiSave, 
  HiShieldCheck, 
  HiKey, 
  HiUsers, 
  HiEye, 
  HiCheck, 
  HiLockOpen, 
  HiShieldExclamation 
} from "react-icons/hi";
import { Role } from "@/modules/roles/types";

// Helper to determine premium role aesthetic details dynamically.
// Colors are drawn from the same token/semantic palette as Badge (primary/warning/info),
// never raw hues like purple/indigo/yellow that fall outside the design system.
const getRoleIconAndColor = (roleName: string) => {
  const name = roleName.toLowerCase();
  if (name.includes("admin") || name.includes("owner")) {
    return {
      icon: HiShieldCheck,
      bgColor: "bg-primary/10 text-primary border-primary/10",
      activeBg: "bg-primary text-on-primary shadow-lg shadow-primary/20",
      accentBg: "border-primary",
      badgeVariant: "primary" as const,
    };
  }
  if (name.includes("audit") || name.includes("complia")) {
    return {
      icon: HiEye,
      bgColor: "bg-amber-50 text-amber-700 border-amber-200",
      activeBg: "bg-amber-600 text-on-primary shadow-lg shadow-amber-200/40",
      accentBg: "border-amber-500",
      badgeVariant: "warning" as const,
    };
  }
  if (name.includes("read") || name.includes("view") || name.includes("guest")) {
    return {
      icon: HiKey,
      bgColor: "bg-hover text-ink/70 border-border",
      activeBg: "bg-primary text-on-primary shadow-lg shadow-primary/10",
      accentBg: "border-primary",
      badgeVariant: "neutral" as const,
    };
  }
  if (name.includes("user") || name.includes("member") || name.includes("staff")) {
    return {
      icon: HiUsers,
      bgColor: "bg-blue-50 text-blue-700 border-blue-100",
      activeBg: "bg-blue-600 text-on-primary shadow-lg shadow-blue-200/40",
      accentBg: "border-blue-500",
      badgeVariant: "info" as const,
    };
  }
  return {
    icon: HiLockClosed,
    bgColor: "bg-primary/10 text-primary border-primary/10",
    activeBg: "bg-primary text-on-primary shadow-lg shadow-primary/20",
    accentBg: "border-primary",
    badgeVariant: "primary" as const,
  };
};

// Helper to determine security operation tags from the permission's own action field
// (CREATE/READ/UPDATE/DELETE/APPROVE/ADMIN/WRITE, set authoritatively by the backend's
// PermissionDefinition registrars — not guessed from the opaque permission uid).
const getPermissionBadge = (action: string) => {
  switch ((action || "").toUpperCase()) {
    case "DELETE":
      return { label: "Danger", variant: "error" as const };
    case "APPROVE":
      return { label: "Approve", variant: "warning" as const };
    case "ADMIN":
      return { label: "Admin", variant: "primary" as const };
    case "UPDATE":
      return { label: "Update", variant: "info" as const };
    case "CREATE":
    case "WRITE":
      return { label: "Create", variant: "success" as const };
    default:
      return { label: "Read", variant: "neutral" as const };
  }
};

export default function RolesPage() {
  const {
    roles,
    permissions,
    isLoading,
    addRole,
    updateRolePermissions,
  } = useRoles();

  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newRole, setNewRole] = useState({ name: "", description: "" });
  const [selectedPermissionUids, setSelectedPermissionUids] = useState<string[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [isSavingPermissions, setIsSavingPermissions] = useState(false);

  const handleSelectRole = (role: Role) => {
    setSelectedRole(role);
    setSelectedPermissionUids(role.permissions?.map((p) => p.uid) || []);
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await addRole({
        name: newRole.name,
        description: newRole.description,
        permissionsUids: [],
      });
      setIsCreateOpen(false);
      setNewRole({ name: "", description: "" });
    } catch {
      
    } finally {
      setIsSaving(false);
    }
  };

  const handlePermissionToggle = (uid: string) => {
    setSelectedPermissionUids((prev) =>
      prev.includes(uid) ? prev.filter((id) => id !== uid) : [...prev, uid]
    );
  };

  const handleSavePermissions = async () => {
    if (!selectedRole) return;
    setIsSavingPermissions(true);
    try {
      await updateRolePermissions(selectedRole.uid, selectedPermissionUids);
    } finally {
      setIsSavingPermissions(false);
    }
  };

  const activeRole = selectedRole
    ? roles.find((r) => r.uid === selectedRole.uid) || selectedRole
    : roles[0] || null;

  if (activeRole && (!selectedRole || selectedRole.uid !== activeRole.uid)) {
    setSelectedRole(activeRole);
    setSelectedPermissionUids(activeRole.permissions?.map((p) => p.uid) || []);
  }

  const permissionsByModule = permissions.reduce((acc: Record<string, typeof permissions>, p) => {
    const mod = p.module || "General System";
    if (!acc[mod]) acc[mod] = [];
    acc[mod].push(p);
    return acc;
  }, {});

  return (
    <PermissionGate permission={PERMISSIONS.ROLE_READ}>
      <div className="p-8 max-w-6xl w-full mx-auto flex flex-col gap-6 animate-fade-in select-none">
        
        {/* Page Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 border-b border-border pb-6 shrink-0">
          <div>
            <h1 className="text-2xl font-bold text-ink tracking-tight flex items-center gap-2">
              <HiShieldExclamation className="w-7 h-7 text-primary shrink-0" />
              Roles & Permissions
            </h1>
            <p className="text-sm text-ink/60 mt-1">
              Configure organizational roles, map granular permissions, and restrict platform access.
            </p>
          </div>
          <PermissionGate permission={PERMISSIONS.ROLE_CREATE}>
            <button
              onClick={() => setIsCreateOpen(true)}
              type="button"
              className="inline-flex items-center whitespace-nowrap gap-1.5 px-4.5 py-2.5 bg-primary hover:bg-primary-hover text-on-primary rounded-full text-xs font-bold shadow-md shadow-primary/10 hover:shadow-lg transition-all cursor-pointer"
            >
              <HiPlus className="w-4 h-4" />
              Create Custom Role
            </button>
          </PermissionGate>
        </div>

        {isLoading && roles.length === 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            <div className="lg:col-span-4 flex flex-col gap-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-28 bg-field/60 rounded-[2rem] animate-pulse" />
              ))}
            </div>
            <div className="lg:col-span-8">
              <div className="h-[520px] bg-field/60 rounded-[2rem] animate-pulse" />
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Left Sidebar Pane: Role cards */}
            <div className="lg:col-span-4 flex flex-col gap-4">
              <div className="px-1 text-[10px] font-extrabold text-ink/60 uppercase tracking-widest">
                Available Firm Roles ({roles.length})
              </div>
              <div className="flex flex-col gap-3 overflow-y-auto rates-scrollable max-h-[70vh] pr-1">
                {roles.length === 0 ? (
                  <div className="bg-surface rounded-[2rem] border border-border p-8 text-center text-ink/60 text-xs font-semibold">
                    No custom roles registered in this firm.
                  </div>
                ) : (
                  roles.map((role) => {
                    const isSelected = activeRole?.uid === role.uid;
                    const aesthetic = getRoleIconAndColor(role.name);
                    const RoleIcon = aesthetic.icon;

                    return (
                      <div
                        key={role.uid}
                        onClick={() => handleSelectRole(role)}
                        role="button"
                        tabIndex={0}
                        aria-pressed={isSelected}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault();
                            handleSelectRole(role);
                          }
                        }}
                        className={`bg-surface rounded-[2rem] p-5 border transition-all cursor-pointer flex items-start gap-4 relative overflow-hidden select-none group shrink-0 ${
                          isSelected
                            ? "border-primary shadow-md ring-2 ring-primary/5"
                            : "border-border/60 hover:border-ink/20 shadow-sm"
                        }`}
                      >
                        {/* Selected vertical stripe glow */}
                        {isSelected && (
                          <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary rounded-r-md" />
                        )}

                        <div
                          className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-all duration-300 ${
                            isSelected ? aesthetic.activeBg : aesthetic.bgColor + " group-hover:scale-105"
                          }`}
                        >
                          <RoleIcon className="w-5 h-5" />
                        </div>
                        <div className="flex-1">
                          <h4 className={`font-semibold text-sm transition-colors ${isSelected ? "text-primary" : "text-ink"}`}>
                            {role.name}
                          </h4>
                          <p className="text-xs text-ink/60 mt-1 line-clamp-2 leading-relaxed">
                            {role.description || "No specific description configured."}
                          </p>
                          <div className="flex items-center gap-1.5 mt-3.5">
                            <Badge variant={isSelected ? aesthetic.badgeVariant : "neutral"}>
                              {role.permissions?.length || 0} Operations Authorized
                            </Badge>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Right Pane: Perm mapping dashboard */}
            <div className="lg:col-span-8">
              {activeRole ? (
                <div className="bg-surface rounded-[2rem] shadow-sm border border-border/60 p-6 flex flex-col gap-6">
                  
                  {/* Dashboard pane header */}
                  <div className="flex items-start justify-between border-b border-border pb-5 gap-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <Badge variant="primary">Active Role</Badge>
                      </div>
                      <h3 className="text-lg font-bold text-ink mt-1.5">{activeRole.name}</h3>
                      <p className="text-xs text-ink/60 mt-1 leading-normal">
                        {activeRole.description || "No operational description provided."}
                      </p>
                    </div>
                    <PermissionGate permission={PERMISSIONS.ROLE_UPDATE}>
                      <button
                        onClick={handleSavePermissions}
                        disabled={isSavingPermissions}
                        type="button"
                        className="inline-flex items-center whitespace-nowrap gap-1.5 px-4.5 py-2.5 bg-primary hover:bg-primary-hover text-on-primary rounded-full text-xs font-bold shadow-md shadow-primary/10 hover:shadow-lg transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed select-none shrink-0"
                      >
                        {isSavingPermissions ? (
                          <div className="w-4 h-4 animate-spin rounded-full border-2 border-on-primary/20 border-b-on-primary" />
                        ) : (
                          <HiSave className="w-4 h-4" />
                        )}
                        {isSavingPermissions ? "Saving Details..." : "Save Configured Scope"}
                      </button>
                    </PermissionGate>
                  </div>

                  {/* Core checklist items nested by module */}
                  <div className="flex flex-col gap-6 overflow-y-auto pr-1 rates-scrollable max-h-[50vh]">
                    {Object.entries(permissionsByModule).map(([moduleName, modulePerms]) => (
                      <div key={moduleName} className="flex flex-col gap-3 shrink-0">
                        <h5 className="text-[10px] font-extrabold text-ink/60 uppercase tracking-widest px-1">
                          {moduleName} Module Controls
                        </h5>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {modulePerms.map((perm) => {
                            const isChecked = selectedPermissionUids.includes(perm.uid);
                            const category = getPermissionBadge(perm.action);

                            return (
                              <div
                                key={perm.uid}
                                onClick={() => handlePermissionToggle(perm.uid)}
                                role="checkbox"
                                aria-checked={isChecked}
                                tabIndex={0}
                                onKeyDown={(e) => {
                                  if (e.key === "Enter" || e.key === " ") {
                                    e.preventDefault();
                                    handlePermissionToggle(perm.uid);
                                  }
                                }}
                                className={`flex items-start justify-between gap-4 p-4.5 rounded-[2rem] border transition-all duration-200 cursor-pointer select-none group relative ${
                                  isChecked
                                    ? "bg-primary/[0.01] border-primary/80 shadow-sm"
                                    : "border-border hover:border-ink/20 bg-surface"
                                }`}
                              >
                                <div className="flex-1 pr-2">
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <span className={`text-sm font-bold transition-colors ${isChecked ? "text-primary" : "text-ink"}`}>
                                      {perm.name}
                                    </span>
                                    <Badge variant={category.variant}>{category.label}</Badge>
                                  </div>
                                  <span className="text-xs text-ink/60 mt-1.5 block leading-relaxed">
                                    {perm.description || "Grants platform operational clearance."}
                                  </span>
                                </div>

                                {/* Custom toggle switch slider */}
                                <div className="flex items-center shrink-0 pt-0.5">
                                  <div
                                    className={`w-9 h-5 rounded-full p-0.5 transition-colors duration-200 ${
                                      isChecked ? "bg-primary" : "bg-field"
                                    }`}
                                  >
                                    <div
                                      className={`w-4 h-4 rounded-full bg-surface shadow-sm transform duration-200 ease-out flex items-center justify-center ${
                                        isChecked ? "translate-x-4" : "translate-x-0"
                                      }`}
                                    >
                                      {isChecked && (
                                        <HiCheck className="w-2.5 h-2.5 text-primary stroke-[3]" />
                                      )}
                                    </div>
                                  </div>
                                </div>

                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>

                </div>
              ) : (
                <div className="bg-surface rounded-[2rem] border border-border/60 p-24 text-center flex flex-col items-center justify-center gap-2">
                  <div className="w-12 h-12 bg-primary/10 text-primary rounded-2xl flex items-center justify-center">
                    <HiLockOpen className="w-6 h-6" />
                  </div>
                  <span className="text-xs font-bold text-ink mt-2">No Active Selection</span>
                  <span className="text-xs text-ink/60">Select a structural role from the sidebar to inspect and configure security rules.</span>
                </div>
              )}
            </div>

          </div>
        )}

        {/* Modal creator sheet */}
        {isCreateOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/35 backdrop-blur-sm animate-fade-in select-none">
            <div className="bg-surface rounded-[2rem] shadow-xl w-full max-w-md border border-border/60 overflow-hidden flex flex-col">
              <div className="px-6 py-5 border-b border-border flex items-center justify-between">
                <h3 className="text-base font-bold text-ink">Create New Firm Role</h3>
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(false)}
                  aria-label="Close"
                  className="text-ink/60 hover:text-ink p-1 hover:bg-field rounded-full transition-colors cursor-pointer"
                >
                  <HiX className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCreateSubmit} className="p-6 space-y-5">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-extrabold text-ink/60 uppercase tracking-widest">
                    Role Name
                  </label>
                  <Input aria-label="Role Name"
                    type="text"
                    required
                    value={newRole.name}
                    onChange={(e) => setNewRole({ ...newRole, name: e.target.value })}
                    placeholder="e.g. Rate Card Approver"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-extrabold text-ink/60 uppercase tracking-widest">
                    Role Description
                  </label>
                  <Textarea aria-label="Role Description"
                    required
                    rows={3}
                    value={newRole.description}
                    onChange={(e) => setNewRole({ ...newRole, description: e.target.value })}
                    className="leading-relaxed"
                    placeholder="Provide a description of this role's operational authority..."
                  />
                </div>

                <div className="pt-4 border-t border-border flex items-center justify-end gap-3 shrink-0">
                  <button
                    type="button"
                    onClick={() => setIsCreateOpen(false)}
                    disabled={isSaving}
                    className="px-5 py-2 text-xs font-bold text-ink/70 bg-field hover:bg-hover hover:text-ink rounded-full border border-border transition-all cursor-pointer disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="inline-flex items-center whitespace-nowrap gap-1.5 px-5 py-2 bg-primary hover:bg-primary-hover text-on-primary rounded-full text-xs font-bold shadow-md shadow-primary/10 hover:shadow-lg transition-all cursor-pointer disabled:opacity-50"
                  >
                    {isSaving && (
                      <div className="w-3.5 h-3.5 animate-spin rounded-full border-2 border-on-primary/20 border-b-on-primary" />
                    )}
                    {isSaving ? "Creating..." : "Confirm & Create"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

      </div>
    </PermissionGate>
  );
}
