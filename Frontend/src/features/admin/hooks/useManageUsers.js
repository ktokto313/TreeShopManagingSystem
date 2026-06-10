/*
 * Name: Manage Users Hook
 * @Author: DucLM
 * Date: 2026-06-10
 * Version: 2.0
 * Description: Orchestrator hook combining list, search, ban, and delete actions for the admin user dashboard.
 */
import { useUsers } from "./useUsers";
import { useBanUser } from "./useBanUser";
import { useDeleteUser } from "./useDeleteUser";
import { useUserSearch } from "./useUserSearch";

export function useManageUsers() {
  const { users, isLoading, hasError, refetch } = useUsers();
  const { handleBan, handleUnban, isLoading: isBanLoading } = useBanUser(refetch);
  const { handleDelete, isLoading: isDeleteLoading } = useDeleteUser(refetch);
  const { results: searchResults, isSearching, handleSearch, handleClear } = useUserSearch();

  const isActionLoading = isBanLoading || isDeleteLoading;

  return {
    users,
    isLoading,
    hasError,
    refetch,
    handleBan,
    handleUnban,
    handleDelete,
    searchResults,
    isSearching,
    handleSearch,
    handleClear,
    isActionLoading
  };
}
