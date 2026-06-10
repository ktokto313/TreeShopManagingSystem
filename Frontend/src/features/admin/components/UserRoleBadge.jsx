/*
 * Name: User Role Badge
 * @Author: DucLM
 * Date: 2026-06-05
 * Version: 2.0
 * Description: Styled badge component that renders a color-coded label for each user role.
 */
import { cn } from "../../../utils/cn";

const ROLE_STYLES = {
  SYSTEM_ADMIN: "bg-violet-100 text-violet-700",
  MANAGER: "bg-sky-100 text-sky-700",
  SHIPPER: "bg-amber-100 text-amber-700",
  SUPPORT_AGENT: "bg-teal-100 text-teal-700",
  CUSTOMER: "bg-stone-100 text-stone-600",
};

/**
 * @param {{ role: string }} props
 */
export function UserRoleBadge({ role }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium",
        ROLE_STYLES[role] ?? "bg-stone-100 text-stone-600"
      )}
    >
      {role?.replace("_", " ")}
    </span>
  );
}
