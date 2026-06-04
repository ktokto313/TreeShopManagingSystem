import { useEffect, useState } from "react";
import { Modal } from "../../../components/ui/Modal";
import { Form } from "../../../components/ui/Form";
import { Input } from "../../../components/ui/Input";
import { Select } from "../../../components/ui/Select";
import { Button } from "../../../components/ui/Button";
import { useUpdateUser } from "../hooks/useUpdateUser";

const ROLES = ["CUSTOMER", "MANAGER", "SHIPPER", "SUPPORT_AGENT"];

/**
 * @param {{ user: object|null, isOpen: boolean, onClose: () => void, onUpdated: () => void }} props
 */
export function EditUserModal({ user, isOpen, onClose, onUpdated }) {
  const [form, setForm] = useState({
    fullName: "",
    phone: "",
    role: "CUSTOMER",
    password: "",
  });

  useEffect(() => {
    if (!user) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setForm({
        fullName: "",
        phone: "",
        role: "CUSTOMER",
        password: "",
      });
      return;
    }
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setForm({
      fullName: user.fullName ?? "",
      phone: user.phone ?? "",
      role: user.role ?? "CUSTOMER",
      password: "",
    });
  }, [user]);

  const handleChange = (field) => (e) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const { handleUpdate, isLoading, hasError } = useUpdateUser(() => {
    onUpdated();
    onClose();
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!user?.id) return;
    const payload = { ...form };
    if (!payload.password) delete payload.password;
    handleUpdate(user.id, payload);
  };

  if (!user) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Edit User">
      <Form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Input label="Email" value={user.email} disabled />
        <Input
          label="Full Name"
          value={form.fullName}
          onChange={handleChange("fullName")}
          required
        />
        <Input
          label="Phone"
          value={form.phone}
          onChange={handleChange("phone")}
          placeholder="0912 345 678"
        />
        <Select
          label="Role"
          value={form.role}
          onChange={handleChange("role")}
          options={ROLES.map((r) => ({ label: r.replace("_", " "), value: r }))}
        />
        <Input
          label="New Password"
          type="password"
          value={form.password}
          onChange={handleChange("password")}
          placeholder="Leave blank to keep current"
        />

        {hasError && (
          <p className="text-sm text-rose-600">
            Something went wrong. Please try again.
          </p>
        )}

        <div className="flex justify-end gap-2 pt-2">
          <Button variant="outline" type="button" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Saving…" : "Save Changes"}
          </Button>
        </div>
      </Form>
    </Modal>
  );
}
