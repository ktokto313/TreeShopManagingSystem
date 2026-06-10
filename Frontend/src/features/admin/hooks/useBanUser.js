/*
 * Name: Ban User Hook
 * @Author: DucLM
 * Date: 2026-06-05
 * Version: 2.0
 * Description: React hook exposing ban and unban handlers that call the user API and refresh on success.
 */
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
