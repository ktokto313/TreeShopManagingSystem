/*
 * Name: Delete User Hook
 * @Author: DucLM
 * Date: 2026-06-05
 * Version: 2.0
 * Description: React hook for deleting users by ID with loading state and optional success callback.
 */
import { useState } from "react";
import { userApi } from "../data/userApi";

export function useDeleteUser(onSuccess) {
  const [isLoading, setIsLoading] = useState(false);

  const handleDelete = async (id) => {
    setIsLoading(true);
    try {
      await userApi.remove(id);
      onSuccess?.();
    } finally {
      setIsLoading(false);
    }
  };

  return { handleDelete, isLoading };
}
