/*
 * Name: Users List Hook
 * @Author: DucLM
 * Date: 2026-06-05
 * Version: 2.0
 * Description: React hook that loads all users on mount and exposes refetch for admin table refresh.
 */
import { useEffect, useState } from "react";
import { userApi } from "../data/userApi";
import { mapUsersFromApi } from "../data/userMapper";

export function useUsers() {
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  const fetchAll = async () => {
    setIsLoading(true);
    setHasError(false);
    try {
      const data = await userApi.getAll();
      setUsers(mapUsersFromApi(data));
    } catch {
      setHasError(true);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchAll();
  }, []);

  return { users, isLoading, hasError, refetch: fetchAll };
}
