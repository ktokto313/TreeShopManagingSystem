// features/admin-users/components/CreateUserModal.jsx
import { useState } from "react";
import { Modal } from "../../../components/ui/Modal";
import { Form } from "../../../components/ui/Form";
import { Input } from "../../../components/ui/Input";
import { Select } from "../../../components/ui/Select";
import { Button } from "../../../components/ui/Button";
import { useCreateUser } from "../hooks/useCreateUser";

const ROLES = ["CUSTOMER", "MANAGER", "SHIPPER", "SUPPORT_AGENT", "SYSTEM_ADMIN"];

/**
 * @param {{ isOpen: boolean, onClose: () => void, onCreated: () => void }} props
 */
export function CreateUserModal({ isOpen, onClose, onCreated }) {
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    password: "",
    role: "CUSTOMER",
  });

  const handleChange = (field) => (e) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const { handleCreate, isLoading, hasError } = useCreateUser(() => {
    onCreated();
    onClose();
    setForm({ fullName: "", email: "", phone: "", password: "", role: "CUSTOMER" });
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    handleCreate(form);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create New User">
      <Form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Input
          label="Full Name"
          value={form.fullName}
          onChange={handleChange("fullName")}
          placeholder="Nguyen Van A"
          required
        />
        <Input
          label="Email"
          type="email"
          value={form.email}
          onChange={handleChange("email")}
          placeholder="user@example.com"
          required
        />
        <Input
          label="Phone"
          value={form.phone}
          onChange={handleChange("phone")}
          placeholder="0912 345 678"
        />
        <Input
          label="Password"
          type="password"
          value={form.password}
          onChange={handleChange("password")}
          placeholder="••••••••"
          required
        />
        <Select
          label="Role"
          value={form.role}
          onChange={handleChange("role")}
          options={ROLES.map((r) => ({ label: r.replace("_", " "), value: r }))}
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
            {isLoading ? "Creating…" : "Create User"}
          </Button>
        </div>
      </Form>
    </Modal>
  );
}
