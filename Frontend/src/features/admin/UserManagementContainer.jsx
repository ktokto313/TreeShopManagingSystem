/*
 * Name: User Management Container
 * @Author: DucLM
 * Date: 2026-06-05
 * Version: 2.0
 * Description: Main admin dashboard composing the user table, search bar, sorting, and create/edit/detail modals.
 */
import { useMemo, useState } from "react";
import { useManageUsers } from "./hooks/useManageUsers";
import { UserTableRow } from "./components/UserTableRow";
import { UserSearchBar } from "./components/UserSearchBar";
import { CreateUserModal } from "./components/CreateUserModal";
import { EditUserModal } from "./components/EditUserModal";
import { UserDetailModal } from "./components/UserDetailModal";

const SORT_OPTIONS = {
  user_asc:    (a, b) => (a.fullName ?? "").localeCompare(b.fullName ?? ""),
  user_desc:   (a, b) => (b.fullName ?? "").localeCompare(a.fullName ?? ""),
  role_asc:    (a, b) => (a.role ?? "").localeCompare(b.role ?? ""),
  role_desc:   (a, b) => (b.role ?? "").localeCompare(a.role ?? ""),
  status_asc:  (a, b) => Number(a.isBanned) - Number(b.isBanned),
  status_desc: (a, b) => Number(b.isBanned) - Number(a.isBanned),
  phone_asc:   (a, b) => (a.phone ?? "").localeCompare(b.phone ?? ""),
  phone_desc:  (a, b) => (b.phone ?? "").localeCompare(a.phone ?? ""),
};

const USERS_PER_PAGE = 10;

function SortIcon({ active, direction }) {
  return (
    <span className={`ml-1 ${active ? "text-[#283C1D]" : "text-stone-300"}`}>
      {active && direction === "desc" ? "â†“" : "â†‘"}
    </span>
  );
}

function getPageItems(currentPage, totalPages) {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  if (currentPage <= 4) {
    return [1, 2, 3, 4, 5, "...", totalPages];
  }

  if (currentPage >= totalPages - 3) {
    return [1, "...", totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
  }

  return [1, "...", currentPage - 1, currentPage, currentPage + 1, "...", totalPages];
}

export function UserManagementContainer() {
  const {
    users, isLoading, hasError, refetch,
    handleBan, handleUnban, handleDelete,
    searchResults, isSearching, handleSearch, handleClear,
    isActionLoading
  } = useManageUsers();

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [editingUser, setEditingUser] = useState(null);
  const [sortKey, setSortKey] = useState(null);
  const [sortDir, setSortDir] = useState("asc");
  const [currentPage, setCurrentPage] = useState(1);

  const handleBanToggle = (user) => {
    if (user.isBanned) handleUnban(user.id);
    else handleBan(user.id);
  };

  const handleSort = (key) => {
    if (sortKey === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else { setSortKey(key); setSortDir("asc"); }
  };

  const handleSearchWithPaginationReset = (query) => {
    setCurrentPage(1);
    handleSearch(query);
  };

  const handleClearWithPaginationReset = () => {
    setCurrentPage(1);
    handleClear();
  };

  const displayedUsers = useMemo(() => {
    const list = searchResults ?? users;
    if (!sortKey) return list;
    return [...list].sort(SORT_OPTIONS[`${sortKey}_${sortDir}`]);
  }, [searchResults, users, sortKey, sortDir]);

  const totalUsers = displayedUsers.length;
  const totalPages = Math.max(1, Math.ceil(totalUsers / USERS_PER_PAGE));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const firstUserIndex = totalUsers === 0 ? 0 : (safeCurrentPage - 1) * USERS_PER_PAGE + 1;
  const lastUserIndex = Math.min(safeCurrentPage * USERS_PER_PAGE, totalUsers);
  const paginatedUsers = useMemo(() => {
    const start = (safeCurrentPage - 1) * USERS_PER_PAGE;
    return displayedUsers.slice(start, start + USERS_PER_PAGE);
  }, [displayedUsers, safeCurrentPage]);
  const pageItems = useMemo(
    () => getPageItems(safeCurrentPage, totalPages),
    [safeCurrentPage, totalPages],
  );

  const thClass =
    "px-4 py-3 text-xs font-medium text-stone-500 uppercase tracking-wide cursor-pointer select-none hover:text-stone-800";

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-stone-800">User Management</h1>
          <p className="text-sm text-stone-500 mt-0.5">
            {searchResults
              ? `${searchResults.length} result(s) found`
              : `${users.length} total users`}
          </p>
        </div>
        <button
          type="button"
          onClick={() => setIsCreateModalOpen(true)}
          className="h-10 px-4 text-sm rounded-md font-medium bg-[#283C1D] text-white hover:opacity-90"
        >
          + Create User
        </button>
      </div>

      <UserSearchBar
        onSearch={handleSearchWithPaginationReset}
        onClear={handleClearWithPaginationReset}
        isSearching={isSearching}
      />

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
                <th className={thClass} onClick={() => handleSort("user")}>
                  User <SortIcon active={sortKey === "user"} direction={sortDir} />
                </th>
                <th className={thClass} onClick={() => handleSort("role")}>
                  Role <SortIcon active={sortKey === "role"} direction={sortDir} />
                </th>
                <th className={thClass} onClick={() => handleSort("status")}>
                  Status <SortIcon active={sortKey === "status"} direction={sortDir} />
                </th>
                <th className={thClass} onClick={() => handleSort("phone")}>
                  Phone <SortIcon active={sortKey === "phone"} direction={sortDir} />
                </th>
                <th className="px-4 py-3 text-xs font-medium text-stone-500 uppercase tracking-wide">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody>
              {isLoading
                ? Array.from({ length: USERS_PER_PAGE }).map((_, i) => (
                    <tr key={i} className="border-b border-stone-100">
                      {Array.from({ length: 5 }).map((_, j) => (
                        <td key={j} className="px-4 py-3">
                          <div className="animate-pulse bg-stone-200 h-4 w-full rounded" />
                        </td>
                      ))}
                    </tr>
                  ))
                : totalUsers === 0
                ? (
                  <tr>
                    <td colSpan={5} className="py-16 text-center text-sm text-stone-400">
                      {searchResults ? "No users match your search." : "No users found."}
                    </td>
                  </tr>
                )
                : paginatedUsers.map((user) => (
                    <UserTableRow
                      key={user.id}
                      user={user}
                      onView={(id) =>
                        setSelectedUser(displayedUsers.find((u) => u.id === id) ?? null)
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

      {!hasError && !isLoading && (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-stone-500">
            Showing {firstUserIndex}-{lastUserIndex} of {totalUsers} users
          </p>

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
              disabled={safeCurrentPage === 1}
              className="h-9 min-w-9 rounded-md border border-stone-200 px-3 text-sm font-medium text-stone-700 hover:bg-stone-50 disabled:cursor-not-allowed disabled:opacity-40"
            >
              &lt;
            </button>
            {pageItems.map((page, index) =>
              page === "..." ? (
                <span
                  key={`ellipsis-${index}`}
                  className="flex h-9 min-w-9 items-center justify-center text-sm text-stone-400"
                >
                  ...
                </span>
              ) : (
                <button
                  key={page}
                  type="button"
                  onClick={() => setCurrentPage(page)}
                  className={`h-9 min-w-9 rounded-md border px-3 text-sm font-medium ${
                    safeCurrentPage === page
                      ? "border-[#283C1D] bg-[#283C1D] text-white"
                      : "border-stone-200 text-stone-700 hover:bg-stone-50"
                  }`}
                >
                  {page}
                </button>
              ),
            )}
            <button
              type="button"
              onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
              disabled={safeCurrentPage === totalPages}
              className="h-9 min-w-9 rounded-md border border-stone-200 px-3 text-sm font-medium text-stone-700 hover:bg-stone-50 disabled:cursor-not-allowed disabled:opacity-40"
            >
              &gt;
            </button>
          </div>
        </div>
      )}

      <CreateUserModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreated={refetch}
      />
      {editingUser && (
        <EditUserModal
          key={editingUser.id}
          user={editingUser}
          isOpen
          onClose={() => setEditingUser(null)}
          onUpdated={refetch}
        />
      )}
      <UserDetailModal
        user={selectedUser}
        isOpen={!!selectedUser}
        onClose={() => setSelectedUser(null)}
      />
    </div>
  );
}
