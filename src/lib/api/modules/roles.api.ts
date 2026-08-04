import { apiClient } from "../client";
import { ENDPOINTS } from "../endpoints";

export const rolesApi = {
  getRoles: async () => {
    const response = await apiClient.get(ENDPOINTS.ROLES.LIST);
    return response.data;
  },

  createRole: async (roleData: Record<string, unknown>) => {
    const response = await apiClient.post(ENDPOINTS.ROLES.CREATE, roleData);
    return response.data;
  },

  assignPermissionsToRole: async (roleUid: string, permissionIds: string[]) => {
    const response = await apiClient.put(ENDPOINTS.ROLES.ASSIGN_PERMISSIONS(roleUid), {
      permissionUids: permissionIds,
    });
    return response.data;
  },

  getPermissions: async () => {
    const response = await apiClient.get(ENDPOINTS.ROLES.PERMISSIONS);
    return response.data;
  },
};
