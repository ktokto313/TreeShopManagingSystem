/*
 * Name: User Table Row
 * @Author: DucLM
 * Date: 2026-06-05
 * Version: 2.0
 * Description: Table row rendering user summary data with view, edit, delete, and ban/unban action buttons.
 */
import { UserStatusBadge } from "./UserStatusBadge";
import { UserRoleBadge } from "./UserRoleBadge";
import { Button } from "../../../components/ui/Button";

/**
 * @param {{
 *   user: object,
 *   onView: (id: string) => void,
 *   onEdit: (user: object) => void,
 *   onDelete: (id: string) => void,
 *   onBanToggle: (user: object) => void,
 *   isActionLoading: boolean,
 * }} props
 */
export function UserTableRow({
  user,
  onView,
  onEdit,
  onDelete,
  onBanToggle,
  isActionLoading,
}) {
  return (
    <tr className="border-b border-stone-100 hover:bg-stone-50 transition-colors">
      {/* Avatar + Name */}
      <td className="px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-full bg-[#283C1D] text-white flex items-center justify-center text-sm font-semibold shrink-0">
            {user.fullName?.[0]?.toUpperCase() ?? "?"}
          </div>
          <div>
            <p className="text-sm font-medium text-stone-800 leading-tight">
              {user.fullName}
            </p>
            <p className="text-xs text-stone-400">{user.email}</p>
          </div>
        </div>
      </td>

      {/* Role */}
      <td className="px-4 py-3">
        <UserRoleBadge role={user.role} />
      </td>

      {/* Status */}
      <td className="px-4 py-3">
        <UserStatusBadge isBanned={user.isBanned} />
      </td>

      {/* Phone */}
      <td className="px-4 py-3 text-sm text-stone-500">
        {user.phone ?? "—"}
      </td>

      {/* Actions */}
      <td className="px-4 py-3">
        <div className="flex items-center gap-1.5">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onView(user.id)}
            title="View details"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
              <circle cx="12" cy="12" r="3" />
            </svg>
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => onEdit(user)}
            title="Edit user"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
            </svg>
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => onBanToggle(user)}
            disabled={isActionLoading}
            title={user.isBanned ? "Bỏ khóa tài khoản" : "Khóa tài khoản"}
            className={
              user.isBanned ? "text-emerald-600 hover:text-emerald-700" : "text-amber-600 hover:text-amber-700"
            }
          >
            {user.isBanned ? (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                <circle cx="12" cy="12" r="10" />
                <path d="M8 12l3 3 5-5" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                <circle cx="12" cy="12" r="10" />
                <line x1="4.93" y1="4.93" x2="19.07" y2="19.07" />
              </svg>
            )}
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDelete(user.id)}
            disabled={isActionLoading}
            title="Xóa tài khoản"
            className="text-rose-500 hover:text-rose-700"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
            >
              <polyline points="3 6 5 6 21 6" />
              <path d="M19 6l-1 14H6L5 6" />
              <path d="M10 11v6M14 11v6" />
              <path d="M9 6V4h6v2" />
            </svg>
          </Button>
        </div>
      </td>
    </tr>
  );
}
