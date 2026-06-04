// features/admin-users/components/UserDetailModal.jsx
import { Modal } from "../../../components/ui/Modal";
import { UserStatusBadge } from "./UserStatusBadge";
import { UserRoleBadge } from "./UserRoleBadge";

// Field component extracted to prevent recreation on each render
function Field({ label, value }) {
  return (
    <div>
      <p className="text-xs font-medium text-stone-400 uppercase tracking-wide mb-0.5">
        {label}
      </p>
      <p className="text-sm text-stone-800">{value ?? "—"}</p>
    </div>
  );
}

/**
 * @param {{ user: object|null, isOpen: boolean, onClose: () => void }} props
 */
export function UserDetailModal({ user, isOpen, onClose }) {
  if (!user) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="User Details">
      <div className="flex flex-col gap-5">
        {/* Header */}
        <div className="flex items-center gap-4">
          <div className="h-14 w-14 rounded-full bg-[#283C1D] text-white flex items-center justify-center text-2xl font-bold shrink-0">
            {user.fullName?.[0]?.toUpperCase() ?? "?"}
          </div>
          <div>
            <h3 className="text-base font-semibold text-stone-800">
              {user.fullName}
            </h3>
            <p className="text-sm text-stone-500">{user.email}</p>
            <div className="flex gap-2 mt-1.5">
              <UserRoleBadge role={user.role} />
              <UserStatusBadge isBanned={user.isBanned} />
            </div>
          </div>
        </div>

        {/* Fields */}
        <div className="grid grid-cols-2 gap-4 border-t border-stone-100 pt-4">
          <Field label="User ID" value={user.id} />
          <Field label="Phone" value={user.phone} />
          <Field label="Created At" value={user.createdAt} />
          <Field label="Updated At" value={user.updatedAt} />
        </div>
      </div>
    </Modal>
  );
}
