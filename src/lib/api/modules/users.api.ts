import { apiClient } from "../client";
import { ENDPOINTS } from "../endpoints";

export const usersApi = {
  getUsers: async () => {
    const response = await apiClient.get(ENDPOINTS.USERS.LIST);
    return response.data;
  },

  getUserByUid: async (uid: string) => {
    const response = await apiClient.get(ENDPOINTS.USERS.DETAIL(uid));
    return response.data;
  },

  createUser: async (userData: Record<string, unknown>) => {
    const response = await apiClient.post(ENDPOINTS.USERS.CREATE, userData);
    return response.data;
  },

  inviteUser: async (userData: Record<string, unknown>) => {
    const response = await apiClient.post(ENDPOINTS.USERS.INVITE, userData);
    return response.data;
  },

  updateUser: async (uid: string, userData: Record<string, unknown>) => {
    const response = await apiClient.put(ENDPOINTS.USERS.DETAIL(uid), userData);
    return response.data;
  },

  deleteUser: async (uid: string) => {
    const response = await apiClient.delete(ENDPOINTS.USERS.DETAIL(uid));
    return response.data;
  },

  deactivateUser: async (uid: string) => {
    const response = await apiClient.post(ENDPOINTS.USERS.DEACTIVATE(uid));
    return response.data;
  },

  assignRoleToUser: async (userUid: string, roleUid: string) => {
    const response = await apiClient.post(ENDPOINTS.USERS.ASSIGN_ROLE(userUid, roleUid));
    return response.data;
  },

  removeRoleFromUser: async (userUid: string, roleUid: string) => {
    const response = await apiClient.delete(ENDPOINTS.USERS.REMOVE_ROLE(userUid, roleUid));
    return response.data;
  },
};
