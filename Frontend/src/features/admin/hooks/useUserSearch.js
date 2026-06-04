import { useState, useCallback } from "react";
import { userApi } from "../data/userApi";
import { mapUserFromApi, mapUsersFromApi } from "../data/userMapper";

export function useUserSearch() {
  const [results, setResults] = useState(null);
  const [isSearching, setIsSearching] = useState(false);
  const [hasError, setHasError] = useState(false);

  const handleSearch = useCallback(async (query) => {
    const trimmed = query.trim();
    if (!trimmed) {
      setResults(null);
      return;
    }
    setIsSearching(true);
    setHasError(false);
    try {
      const isEmail = trimmed.includes("@");
      if (isEmail) {
        const data = await userApi.searchByEmail(trimmed);
        const user = mapUserFromApi(data);
        setResults(user ? [user] : []);
      } else {
        const data = await userApi.searchByKeyword(trimmed);
        setResults(mapUsersFromApi(data));
      }
    } catch (err) {
      if (err.status === 404) {
        setResults([]);
      } else {
        setHasError(true);
      }
    } finally {
      setIsSearching(false);
    }
  }, []);

  const handleClear = () => setResults(null);

  return { results, isSearching, hasError, handleSearch, handleClear };
}
