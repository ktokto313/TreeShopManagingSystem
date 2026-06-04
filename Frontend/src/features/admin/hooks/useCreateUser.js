import { useState } from "react";
import { userApi } from "../data/userApi";
import { mapUserToApi } from "../data/userMapper";

export function useCreateUser(onSuccess) {
  const [isLoading, setIsLoading] = useState(false);
  const [hasError, setHasError] = useState(false);

  const handleCreate = async (formUser) => {
    setIsLoading(true);
    setHasError(false);
    try {
      await userApi.create(mapUserToApi(formUser, { forCreate: true }));
      onSuccess?.();
    } catch {
      setHasError(true);
    } finally {
      setIsLoading(false);
    }
  };

  return { handleCreate, isLoading, hasError };
}
