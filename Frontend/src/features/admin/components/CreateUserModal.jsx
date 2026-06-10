/*
 * Name: Create User Modal
 * @Author: DucLM
 * Date: 2026-06-05
 * Version: 2.0
 * Description: Modal form for SYSTEM_ADMIN to create new users with role, credentials, and contact details.
 */
import { useState } from "react";
import { Modal } from "../../../components/ui/Modal";
import { Form } from "../../../components/ui/Form";
import { Input } from "../../../components/ui/Input";
import { Select } from "../../../components/ui/Select";
import { Button } from "../../../components/ui/Button";
import { useCreateUser } from "../hooks/useCreateUser";

const ROLES = ["CUSTOMER", "MANAGER", "SHIPPER", "SUPPORT_AGENT"];

function validate(form) {
  const errors = {};
  if (!form.fullName.trim()) errors.fullName = "Full name is required";
  else if (!/^[a-zA-ZÀ-ỹ\s]+$/.test(form.fullName.trim()))
    errors.fullName = "Full name must contain letters only";
  if (!form.email.trim()) errors.email = "Email is required";
  if (form.phone && !/^0\d{8,10}$/.test(form.phone.replace(/\s/g, "")))
    errors.phone = "Phone must start with 0 and be 9–11 digits";
  if (!form.password) errors.password = "Password is required";
  return errors;
}

export function CreateUserModal({ isOpen, onClose, onCreated }) {
  const [form, setForm] = useState({ fullName: "", email: "", phone: "", password: "", role: "CUSTOMER" });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const { handleCreate, isLoading, hasError } = useCreateUser(() => {
    onCreated();
    onClose();
    setForm({ fullName: "", email: "", phone: "", password: "", role: "CUSTOMER" });
    setErrors({});
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    const errs = validate(form);
    if (Object.keys(errs).length) { setErrors(errs); return; }
    handleCreate(form);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create New User">
      <Form onSubmit={handleSubmit} className="flex flex-col gap-4">

        <div>
          <Input
            label="Full Name"
            value={form.fullName}
            onChange={handleChange("fullName")}
            placeholder="Nguyen Van A"
            required
          />
          {errors.fullName && <p className="text-xs text-rose-500 mt-1">{errors.fullName}</p>}
        </div>

        <div>
          <Input
            label="Email"
            type="email"
            value={form.email}
            onChange={handleChange("email")}
            placeholder="user@example.com"
            required
          />
          {errors.email && <p className="text-xs text-rose-500 mt-1">{errors.email}</p>}
        </div>

        <div>
          <Input
            label="Phone"
            value={form.phone}
            onChange={handleChange("phone")}
            placeholder="0912 345 678"
          />
          {errors.phone && <p className="text-xs text-rose-500 mt-1">{errors.phone}</p>}
        </div>

        <div>
          <div className="relative">
            <Input
              label="Password"
              type={showPassword ? "text" : "password"}
              value={form.password}
              onChange={handleChange("password")}
              placeholder="••••••••"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="absolute right-3 top-8 text-sm text-gray-500 hover:text-gray-800"
            >
              {showPassword ? "Hide" : "Show"}
            </button>
          </div>
          {errors.password && <p className="text-xs text-rose-500 mt-1">{errors.password}</p>}
        </div>

        <Select
          label="Role"
          value={form.role}
          onChange={handleChange("role")}
          options={ROLES.map((r) => ({ label: r.replace("_", " "), value: r }))}
        />

        {hasError && <p className="text-sm text-rose-600">Something went wrong. Please try again.</p>}

        <div className="flex justify-end gap-2 pt-2">
          <Button variant="outline" type="button" onClick={onClose}>Cancel</Button>
          <Button type="submit" disabled={isLoading}>{isLoading ? "Creating…" : "Create User"}</Button>
        </div>
      </Form>
    </Modal>
  );
}