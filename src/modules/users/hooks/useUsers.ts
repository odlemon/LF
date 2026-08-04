import { useState, useEffect, useCallback } from "react";
import toast from "react-hot-toast";
import { usersApi } from "../../../lib/api/modules/users.api";
import { User, UserInput } from "../types";

export function useUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadUsers = useCallback(async () => {
    await Promise.resolve();
    setIsLoading(true);
    setError(null);
    try {
      const data = await usersApi.getUsers();
      setUsers(data as User[]);
    } catch (err: unknown) {
      let msg = "Failed to load users";
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

  const addUser = async (userData: UserInput) => {
    setIsLoading(true);
    try {
      await usersApi.createUser(userData as unknown as Record<string, unknown>);
      toast.success("User created successfully");
      await loadUsers();
    } catch (err: unknown) {
      let msg = "Failed to create user";
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

  const editUser = async (uid: string, userData: UserInput) => {
    setIsLoading(true);
    try {
      await usersApi.updateUser(uid, userData as unknown as Record<string, unknown>);
      toast.success("User updated successfully");
      await loadUsers();
    } catch (err: unknown) {
      let msg = "Failed to update user";
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

  const toggleDeactivation = async (uid: string) => {
    setIsLoading(true);
    try {
      await usersApi.deactivateUser(uid);
      toast.success("User status changed");
      await loadUsers();
    } catch (err: unknown) {
      let msg = "Failed to toggle user status";
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
    } finally {
      setIsLoading(false);
    }
  };

  const removeUser = async (uid: string) => {
    setIsLoading(true);
    try {
      await usersApi.deleteUser(uid);
      toast.success("User deleted successfully");
      await loadUsers();
    } catch (err: unknown) {
      let msg = "Failed to delete user";
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
    } finally {
      setIsLoading(false);
    }
  };

  const assignRole = async (userUid: string, roleUid: string) => {
    setIsLoading(true);
    try {
      await usersApi.assignRoleToUser(userUid, roleUid);
      toast.success("Role assigned successfully");
      await loadUsers();
    } catch (err: unknown) {
      let msg = "Failed to assign role";
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
    } finally {
      setIsLoading(false);
    }
  };

  const revokeRole = async (userUid: string, roleUid: string) => {
    setIsLoading(true);
    try {
      await usersApi.removeRoleFromUser(userUid, roleUid);
      toast.success("Role removed successfully");
      await loadUsers();
    } catch (err: unknown) {
      let msg = "Failed to remove role";
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
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      loadUsers();
    }, 0);
    return () => {
      clearTimeout(timer);
    };
  }, [loadUsers]);

  return {
    users,
    isLoading,
    error,
    loadUsers,
    addUser,
    editUser,
    toggleDeactivation,
    removeUser,
    assignRole,
    revokeRole,
  };
}
