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
    fetchAll();
  }, []);

  return { users, isLoading, hasError, refetch: fetchAll };
}
