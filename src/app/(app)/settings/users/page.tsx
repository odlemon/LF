"use client";

import React, { useState } from "react";
import { useUsers } from "@/modules/users/hooks/useUsers";
import { useRoles } from "@/modules/roles/hooks/useRoles";
import { PermissionGate } from "@/components/shared/PermissionGate";
import { PERMISSIONS } from "@/lib/utils/permissions";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { User } from "@/modules/users/types";
import { useAuth } from "@/hooks/useAuth";
import toast from "react-hot-toast";
import {
  HiPlus,
  HiPencil,
  HiTrash,
  HiUserGroup,
  HiX,
  HiCheck,
  HiUser,
} from "react-icons/hi";

interface UserFormState {
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  password?: string;
}

export default function UsersPage() {
  const {
    users,
    isLoading: usersLoading,
    addUser,
    editUser,
    toggleDeactivation,
    removeUser,
    assignRole,
    revokeRole,
  } = useUsers();

  const { roles, isLoading: rolesLoading } = useRoles();
  const { user: currentUser } = useAuth();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingUserUid, setEditingUserUid] = useState<string | null>(null);
  const [formState, setFormState] = useState<UserFormState>({
    email: "",
    firstName: "",
    lastName: "",
    phoneNumber: "",
    password: "",
  });

  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
  const [activeUserUid, setActiveUserUid] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [processingUserUid, setProcessingUserUid] = useState<string | null>(null);
  const [processingAction, setProcessingAction] = useState<"deactivate" | "delete" | null>(null);

  const openAddModal = () => {
    setEditingUserUid(null);
    setFormState({
      email: "",
      firstName: "",
      lastName: "",
      phoneNumber: "",
      password: "",
    });
    setIsFormOpen(true);
  };

  const openEditModal = (user: User) => {
    setEditingUserUid(user.uid);
    setFormState({
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      phoneNumber: user.phoneNumber || "",
    });
    setIsFormOpen(true);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      if (editingUserUid) {
        await editUser(editingUserUid, formState);
      } else {
        await addUser(formState);
      }
      setIsFormOpen(false);
    } catch {
      
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggleDeactivation = async (uid: string) => {
    setProcessingUserUid(uid);
    setProcessingAction("deactivate");
    try {
      await toggleDeactivation(uid);
    } finally {
      setProcessingUserUid(null);
      setProcessingAction(null);
    }
  };

  const handleRemoveUser = async (uid: string) => {
    setProcessingUserUid(uid);
    setProcessingAction("delete");
    try {
      await removeUser(uid);
    } finally {
      setProcessingUserUid(null);
      setProcessingAction(null);
    }
  };

  const handleRoleToggle = async (roleUid: string, userHasRole: boolean) => {
    if (!activeUserUid) return;
    if (userHasRole) {
      await revokeRole(activeUserUid, roleUid);
    } else {
      await assignRole(activeUserUid, roleUid);
    }
  };

  const activeUser = users.find((u) => u.uid === activeUserUid);

  return (
    <PermissionGate permission={PERMISSIONS.USER_READ}>
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-ink">Users</h1>
            <p className="text-sm text-ink/55 mt-1">
              Manage law firm team members, assign operational roles, and set access status
            </p>
          </div>
          <PermissionGate permission={PERMISSIONS.USER_CREATE}>
            <Button onClick={openAddModal} variant="cta">
              <HiPlus className="w-5 h-5" />
              Add User
            </Button>
          </PermissionGate>
        </div>

        {usersLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
          </div>
        ) : (
          <div className="bg-surface rounded-2xl shadow-sm border border-border/50 overflow-hidden">
            <div className="overflow-x-auto rates-scrollable">
              <table className={`w-full text-left border-collapse transition-all duration-300 ${processingUserUid ? "blur-[2px] pointer-events-none select-none opacity-80" : ""}`}>
                <thead>
                  <tr className="border-b border-border/50 bg-field/50">
                    <th className="px-6 py-4 text-xs font-semibold text-ink/55 uppercase tracking-wider">
                      Name
                    </th>
                    <th className="px-6 py-4 text-xs font-semibold text-ink/55 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-6 py-4 text-xs font-semibold text-ink/55 uppercase tracking-wider">
                      Roles
                    </th>
                    <th className="px-6 py-4 text-xs font-semibold text-ink/55 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-4 text-xs font-semibold text-ink/55 uppercase tracking-wider text-right">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {users.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-12 text-center text-ink/55">
                        No users registered in the workspace
                      </td>
                    </tr>
                  ) : (
                    users.map((user) => (
                      <tr key={user.uid} className="hover:bg-field/50 transition-colors">
                        <td className="px-6 py-4.5 font-medium text-ink">
                          {user.firstName} {user.lastName}
                        </td>
                        <td className="px-6 py-4.5 text-ink/65">
                          {user.email}
                        </td>
                        <td className="px-6 py-4.5">
                          <div className="flex flex-wrap gap-1.5">
                            {user.roles && user.roles.length > 0 ? (
                              user.roles.map((role) => (
                                <span
                                  key={role.uid}
                                  className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold bg-primary/10 text-primary border border-primary/10"
                                >
                                  {role.name}
                                </span>
                              ))
                            ) : (
                              <span className="text-xs text-ink/40 font-medium">No roles</span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4.5">
                          <span
                            className={`inline-flex items-center px-3 py-1 rounded-lg text-xs font-semibold ${
                              user.active
                                ? "bg-hover text-ink border border-border"
                                : "bg-red-50 text-red-700 border border-red-100"
                            }`}
                          >
                            {user.active ? "Active" : "Inactive"}
                          </span>
                        </td>
                        <td className="px-6 py-4.5 text-right space-x-2">
                          <PermissionGate permission={PERMISSIONS.ROLE_UPDATE}>
                            <button
                              onClick={() => {
                                setActiveUserUid(user.uid);
                                setIsRoleModalOpen(true);
                              }}
                              className="inline-flex items-center justify-center p-1.5 text-ink/55 hover:text-primary hover:bg-primary/5 rounded-lg transition-all cursor-pointer"
                            >
                              <HiUserGroup className="w-4.5 h-4.5" />
                            </button>
                          </PermissionGate>
                          <PermissionGate permission={PERMISSIONS.USER_UPDATE}>
                            <button
                              onClick={() => openEditModal(user)}
                              className="inline-flex items-center justify-center p-1.5 text-ink/55 hover:text-primary hover:bg-primary/5 rounded-lg transition-all cursor-pointer"
                            >
                              <HiPencil className="w-4.5 h-4.5" />
                            </button>
                            <button
                              disabled={currentUser?.id === user.uid}
                              onClick={() => {
                                if (currentUser?.id === user.uid) {
                                  toast.error("You cannot deactivate your own account.");
                                  return;
                                }
                                handleToggleDeactivation(user.uid);
                              }}
                              className={`inline-flex items-center justify-center p-1.5 rounded-lg transition-all ${
                                currentUser?.id === user.uid
                                  ? "text-gray-300 cursor-not-allowed opacity-40"
                                  : "text-ink/55 hover:text-primary hover:bg-primary/5 cursor-pointer"
                              }`}
                              title={currentUser?.id === user.uid ? "Cannot deactivate own account" : undefined}
                            >
                              {processingUserUid === user.uid && processingAction === "deactivate" ? (
                                <div className={`w-4.5 h-4.5 animate-spin rounded-full border-2 ${user.active ? "border-yellow-600/20 border-b-yellow-600" : "border-primary/20 border-b-primary"}`} />
                              ) : user.active ? (
                                <HiX className={`w-4.5 h-4.5 ${currentUser?.id === user.uid ? "text-gray-300" : "text-yellow-600"}`} />
                              ) : (
                                <HiCheck className={`w-4.5 h-4.5 ${currentUser?.id === user.uid ? "text-gray-300" : "text-ink/70"}`} />
                              )}
                            </button>
                          </PermissionGate>
                          <PermissionGate permission={PERMISSIONS.USER_DELETE}>
                            <button
                              disabled={currentUser?.id === user.uid}
                              onClick={() => {
                                if (currentUser?.id === user.uid) {
                                  toast.error("You cannot delete your own account.");
                                  return;
                                }
                                handleRemoveUser(user.uid);
                              }}
                              className={`inline-flex items-center justify-center p-1.5 rounded-lg transition-all ${
                                currentUser?.id === user.uid
                                  ? "text-gray-300 cursor-not-allowed opacity-40"
                                  : "text-ink/55 hover:text-red-700 hover:bg-red-50 cursor-pointer"
                              }`}
                              title={currentUser?.id === user.uid ? "Cannot delete own account" : undefined}
                            >
                              {processingUserUid === user.uid && processingAction === "delete" ? (
                                <div className="w-4.5 h-4.5 animate-spin rounded-full border-2 border-red-200 border-b-red-650" />
                              ) : (
                                <HiTrash className="w-4.5 h-4.5" />
                              )}
                            </button>
                          </PermissionGate>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {isFormOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm animate-fade-in">
            <div className="bg-surface rounded-2xl shadow-xl w-full max-w-xl max-h-[90vh] overflow-hidden flex flex-col border border-border/50">
              <div className="px-6 py-4.5 border-b border-border flex items-center justify-between">
                <h3 className="text-lg font-semibold text-ink">
                  {editingUserUid ? "Edit User Details" : "Create New User"}
                </h3>
                <button
                  onClick={() => setIsFormOpen(false)}
                  className="text-ink/40 hover:text-ink/65 p-1 hover:bg-field rounded-full"
                >
                  <HiX className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleFormSubmit} className="flex-1 overflow-y-auto p-6 space-y-5">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-ink/55 uppercase tracking-wider">
                      First Name
                    </label>
                    <Input aria-label="First Name"
                      type="text"
                      required
                      value={formState.firstName}
                      onChange={(e) =>
                        setFormState({ ...formState, firstName: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-ink/55 uppercase tracking-wider">
                      Last Name
                    </label>
                    <Input aria-label="Last Name"
                      type="text"
                      required
                      value={formState.lastName}
                      onChange={(e) =>
                        setFormState({ ...formState, lastName: e.target.value })
                      }
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-ink/55 uppercase tracking-wider">
                    Email Address
                  </label>
                  <Input aria-label="Email Address"
                    type="email"
                    required
                    value={formState.email}
                    onChange={(e) =>
                      setFormState({ ...formState, email: e.target.value })
                    }
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-ink/55 uppercase tracking-wider">
                    Phone Number
                  </label>
                  <Input aria-label="Phone Number"
                    type="text"
                    value={formState.phoneNumber}
                    onChange={(e) =>
                      setFormState({ ...formState, phoneNumber: e.target.value })
                    }
                  />
                </div>

                {!editingUserUid && (
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-ink/55 uppercase tracking-wider">
                      Initial Password
                    </label>
                    <Input aria-label="Initial Password"
                      type="password"
                      required
                      value={formState.password || ""}
                      onChange={(e) =>
                        setFormState({ ...formState, password: e.target.value })
                      }
                    />
                  </div>
                )}

                <div className="pt-4 border-t border-border flex items-center justify-end gap-3">
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => setIsFormOpen(false)}
                    disabled={isSaving}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" variant="primary" loading={isSaving}>
                    {editingUserUid ? "Save Changes" : "Create User"}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}

        {isRoleModalOpen && activeUser && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm animate-fade-in">
            <div className="bg-surface rounded-2xl shadow-xl w-full max-w-md border border-border/50 overflow-hidden">
              <div className="px-6 py-4.5 border-b border-border flex items-center justify-between">
                <h3 className="text-lg font-semibold text-ink">
                  Manage User Roles
                </h3>
                <button
                  onClick={() => setIsRoleModalOpen(false)}
                  className="text-ink/40 hover:text-ink/65 p-1 hover:bg-field rounded-full"
                >
                  <HiX className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 space-y-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                    <HiUser className="text-primary w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-ink">
                      {activeUser.firstName} {activeUser.lastName}
                    </h4>
                    <p className="text-xs text-ink/55">{activeUser.email}</p>
                  </div>
                </div>

                {rolesLoading ? (
                  <div className="flex justify-center items-center h-32">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary" />
                  </div>
                ) : (
                  <div className="space-y-3">
                    <span className="text-xs font-semibold text-ink/55 uppercase tracking-wider block">
                      Assign System Roles
                    </span>
                    <div className="space-y-2.5 max-h-[40vh] overflow-y-auto pr-1 rates-scrollable">
                      {roles.length === 0 ? (
                        <div className="p-4 text-center text-sm text-ink/55 bg-field/50 border border-border/50 rounded-xl">
                          No roles defined in the system
                        </div>
                      ) : (
                        roles.map((role) => {
                          const hasRole = activeUser.roles?.some(
                            (r) => r.uid === role.uid
                          ) || false;
                          return (
                            <div
                              key={role.uid}
                              onClick={() => handleRoleToggle(role.uid, hasRole)}
                              className={`group flex items-center justify-between p-4 rounded-xl border transition-all duration-200 cursor-pointer ${
                                hasRole
                                  ? "border-primary bg-primary/[0.02] shadow-sm"
                                  : "border-border/80 bg-surface hover:border-gray-300 hover:bg-field/30"
                              }`}
                            >
                              <div className="flex-1 pr-4">
                                <span className={`text-sm font-semibold block transition-colors ${hasRole ? "text-primary" : "text-ink"}`}>
                                  {role.name}
                                </span>
                                <span className="text-xs text-ink/55 mt-1 block leading-normal">
                                  {role.description || "No description provided"}
                                </span>
                              </div>
                              <div className={`w-5 h-5 rounded-md border flex items-center justify-center transition-all duration-200 shrink-0 ${
                                hasRole
                                  ? "bg-primary border-primary text-white"
                                  : "border-gray-400 bg-surface group-hover:border-primary"
                              }`}>
                                {hasRole && <HiCheck className="w-3.5 h-3.5 stroke-[2.5]" />}
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-end">
                  <Button variant="primary" onClick={() => setIsRoleModalOpen(false)}>
                    Close
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </PermissionGate>
  );
}
