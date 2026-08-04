import { useState, useEffect, useCallback } from "react";
import toast from "react-hot-toast";
import { rolesApi } from "../../../lib/api/modules/roles.api";
import { Role, Permission, RoleInput } from "../types";

export function useRoles() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadRolesAndPermissions = useCallback(async () => {
    await Promise.resolve();
    setIsLoading(true);
    setError(null);
    try {
      const [rolesData, permissionsData] = await Promise.all([
        rolesApi.getRoles(),
        rolesApi.getPermissions(),
      ]);
      setRoles(rolesData as Role[]);
      setPermissions(permissionsData as Permission[]);
    } catch (err: unknown) {
      let msg = "Failed to load roles and permissions";
      const errorObj = err as Record<string, unknown>;
      if (errorObj && typeof errorObj === "object" && "response" in errorObj) {
        const responseObj = errorObj.response as Record<string, unknown>;
        if (responseObj && typeof responseObj === "object" && "data" in responseObj) {
          const dataObj = responseObj.data as Record<string, unknown>;
          if (dataObj && typeof dataObj === "object" && "message" in dataObj) {
            msg = String(dataObj.message);
          }
        }
      }
      setError(msg);
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const addRole = async (roleData: RoleInput) => {
    setIsLoading(true);
    try {
      await rolesApi.createRole({
        ...roleData,
        firmUid: "system",
      } as Record<string, unknown>);
      toast.success("Role created successfully");
      await loadRolesAndPermissions();
    } catch (err: unknown) {
      let msg = "Failed to create role";
      const errorObj = err as Record<string, unknown>;
      if (errorObj && typeof errorObj === "object" && "response" in errorObj) {
        const responseObj = errorObj.response as Record<string, unknown>;
        if (responseObj && typeof responseObj === "object" && "data" in responseObj) {
          const dataObj = responseObj.data as Record<string, unknown>;
          if (dataObj && typeof dataObj === "object" && "message" in dataObj) {
            msg = String(dataObj.message);
          }
        }
      }
      toast.error(msg);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const updateRolePermissions = async (roleUid: string, permissionUids: string[]) => {
    setIsLoading(true);
    try {
      await rolesApi.assignPermissionsToRole(roleUid, permissionUids);
      toast.success("Permissions updated successfully");
      await loadRolesAndPermissions();
    } catch (err: unknown) {
      let msg = "Failed to update permissions";
      const errorObj = err as Record<string, unknown>;
      if (errorObj && typeof errorObj === "object" && "response" in errorObj) {
        const responseObj = errorObj.response as Record<string, unknown>;
        if (responseObj && typeof responseObj === "object" && "data" in responseObj) {
          const dataObj = responseObj.data as Record<string, unknown>;
          if (dataObj && typeof dataObj === "object" && "message" in dataObj) {
            msg = String(dataObj.message);
          }
        }
      }
      toast.error(msg);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      loadRolesAndPermissions();
    }, 0);
    return () => {
      clearTimeout(timer);
    };
  }, [loadRolesAndPermissions]);

  return {
    roles,
    permissions,
    isLoading,
    error,
    loadRolesAndPermissions,
    addRole,
    updateRolePermissions,
  };
}
