// features/admin-users/UserManagementContainer.jsx
import { useState } from "react";
import { useUsers } from "./hooks/useUsers";
import { useBanUser } from "./hooks/useBanUser";
import { useDeleteUser } from "./hooks/useDeleteUser";
import { useUserSearch } from "./hooks/useUserSearch";
import { UserTableRow } from "./components/UserTableRow";
import { UserSearchBar } from "./components/UserSearchBar";
import { CreateUserModal } from "./components/CreateUserModal";
import { EditUserModal } from "./components/EditUserModal";
import { UserDetailModal } from "./components/UserDetailModal";
import { Button } from "../../components/ui/Button";
import { Skeleton } from "../../components/ui/Skeleton";

export function UserManagementContainer() {
  const { users, isLoading, hasError, refetch } = useUsers();

  const { handleBan, handleUnban, isLoading: isBanLoading } = useBanUser(refetch);
  const { handleDelete, isLoading: isDeleteLoading } = useDeleteUser(refetch);

  const {
    results: searchResults,
    isSearching,
    handleSearch,
    handleClear,
  } = useUserSearch();

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [editingUser, setEditingUser] = useState(null);

  const handleBanToggle = (user) => {
    if (user.isBanned) handleUnban(user.id);
    else handleBan(user.id);
  };

  const displayedUsers = searchResults ?? users;
  const isActionLoading = isBanLoading || isDeleteLoading;

  return (
    <div className="flex flex-col gap-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-stone-800">
            User Management
          </h1>
          <p className="text-sm text-stone-500 mt-0.5">
            {searchResults
              ? `${searchResults.length} result(s) found`
              : `${users.length} total users`}
          </p>
        </div>
        <Button onClick={() => setIsCreateModalOpen(true)}>
          + Create User
        </Button>
      </div>

      {/* Search Bar */}
      <UserSearchBar
        onSearch={handleSearch}
        onClear={handleClear}
        isSearching={isSearching}
      />

      {/* Table */}
      <div className="rounded-xl border border-stone-200 overflow-hidden bg-white">
        {hasError ? (
          <div className="py-16 text-center">
            <p className="text-stone-500 text-sm">
              Failed to load users.{" "}
              <button
                onClick={refetch}
                className="text-[#283C1D] underline underline-offset-2"
              >
                Try again
              </button>
            </p>
          </div>
        ) : (
          <table className="w-full text-left">
            <thead>
              <tr className="bg-stone-50 border-b border-stone-200">
                <th className="px-4 py-3 text-xs font-medium text-stone-500 uppercase tracking-wide">
                  User
                </th>
                <th className="px-4 py-3 text-xs font-medium text-stone-500 uppercase tracking-wide">
                  Role
                </th>
                <th className="px-4 py-3 text-xs font-medium text-stone-500 uppercase tracking-wide">
                  Status
                </th>
                <th className="px-4 py-3 text-xs font-medium text-stone-500 uppercase tracking-wide">
                  Phone
                </th>
                <th className="px-4 py-3 text-xs font-medium text-stone-500 uppercase tracking-wide">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody>
              {isLoading
                ? Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i} className="border-b border-stone-100">
                      {Array.from({ length: 5 }).map((_, j) => (
                        <td key={j} className="px-4 py-3">
                          <Skeleton className="h-4 w-full rounded" />
                        </td>
                      ))}
                    </tr>
                  ))
                : displayedUsers.length === 0
                ? (
                  <tr>
                    <td colSpan={5} className="py-16 text-center text-sm text-stone-400">
                      {searchResults ? "No users match your search." : "No users found."}
                    </td>
                  </tr>
                )
                : displayedUsers.map((user) => (
                    <UserTableRow
                      key={user.id}
                      user={user}
                      onView={(id) =>
                        setSelectedUser(
                          displayedUsers.find((u) => u.id === id) ?? null
                        )
                      }
                      onEdit={(u) => setEditingUser(u)}
                      onDelete={handleDelete}
                      onBanToggle={handleBanToggle}
                      isActionLoading={isActionLoading}
                    />
                  ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Modals */}
      <CreateUserModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreated={refetch}
      />

      <EditUserModal
        user={editingUser}
        isOpen={!!editingUser}
        onClose={() => setEditingUser(null)}
        onUpdated={refetch}
      />

      <UserDetailModal
        user={selectedUser}
        isOpen={!!selectedUser}
        onClose={() => setSelectedUser(null)}
      />
    </div>
  );
}
