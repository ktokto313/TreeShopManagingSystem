/*
 * Name: Update User Hook
 * @Author: DucLM
 * Date: 2026-06-05
 * Version: 2.0
 * Description: React hook for updating existing user records via PUT /api/users/{id}.
 */
import { useState } from "react";
import { userApi } from "../data/userApi";
import { mapUserToApi } from "../data/userMapper";

export function useUpdateUser(onSuccess) {
  const [isLoading, setIsLoading] = useState(false);
  const [hasError, setHasError] = useState(false);

  const handleUpdate = async (id, formUser) => {
    setIsLoading(true);
    setHasError(false);
    try {
      await userApi.update(id, mapUserToApi(formUser));
      onSuccess?.();
    } catch {
      setHasError(true);
    } finally {
      setIsLoading(false);
    }
  };

  return { handleUpdate, isLoading, hasError };
}
