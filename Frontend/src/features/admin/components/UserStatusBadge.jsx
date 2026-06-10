/*
 * Name: User Status Badge
 * @Author: DucLM
 * Date: 2026-06-05
 * Version: 2.0
 * Description: Badge component indicating whether a user account is active or banned.
 */
import { cn } from "../../../utils/cn";

/**
 * @param {{ isBanned: boolean }} props
 */
export function UserStatusBadge({ isBanned }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium",
        isBanned
          ? "bg-rose-100 text-rose-700"
          : "bg-emerald-100 text-emerald-700"
      )}
    >
      <span
        className={cn(
          "h-1.5 w-1.5 rounded-full",
          isBanned ? "bg-rose-500" : "bg-emerald-500"
        )}
      />
      {isBanned ? "Banned" : "Active"}
    </span>
  );
}
