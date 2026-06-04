// features/admin-users/hooks/useDeleteUser.js
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
