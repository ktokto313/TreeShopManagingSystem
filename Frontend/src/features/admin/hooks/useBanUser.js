// features/admin-users/hooks/useBanUser.js
import { useState } from "react";
import { userApi } from "../data/userApi";

export function useBanUser(onSuccess) {
  const [isLoading, setIsLoading] = useState(false);

  const handleBan = async (id) => {
    setIsLoading(true);
    try {
      await userApi.ban(id);
      onSuccess?.();
    } finally {
      setIsLoading(false);
    }
  };

  const handleUnban = async (id) => {
    setIsLoading(true);
    try {
      await userApi.unban(id);
      onSuccess?.();
    } finally {
      setIsLoading(false);
    }
  };

  return { handleBan, handleUnban, isLoading };
}
