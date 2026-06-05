import { useEffect, useState } from "react";
import { Modal } from "../../../components/ui/Modal";
import { Form } from "../../../components/ui/Form";
import { Input } from "../../../components/ui/Input";
import { Select } from "../../../components/ui/Select";
import { Button } from "../../../components/ui/Button";
import { useUpdateUser } from "../hooks/useUpdateUser";

const ROLES = ["CUSTOMER", "MANAGER", "SHIPPER", "SUPPORT_AGENT"];

function validate(form) {
  const errors = {};
  if (!form.fullName.trim()) errors.fullName = "Full name is required";
  else if (!/^[a-zA-ZÀ-ỹ\s]+$/.test(form.fullName.trim()))
    errors.fullName = "Full name must contain letters only";
  if (form.phone && !/^0\d{8,10}$/.test(form.phone.replace(/\s/g, "")))
    errors.phone = "Phone must start with 0 and be 9–11 digits";
  return errors;
}

export function EditUserModal({ user, isOpen, onClose, onUpdated }) {
  const [form, setForm] = useState({ fullName: "", phone: "", role: "CUSTOMER", password: "" });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (!user) { setForm({ fullName: "", phone: "", role: "CUSTOMER", password: "" }); return; }
    setForm({ fullName: user.fullName ?? "", phone: user.phone ?? "", role: user.role ?? "CUSTOMER", password: "" });
    setErrors({});
  }, [user]);

  const handleChange = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const { handleUpdate, isLoading, hasError } = useUpdateUser(() => { onUpdated(); onClose(); });

  const handleSubmit = (e) => {
    e.preventDefault();
    const errs = validate(form);
    if (Object.keys(errs).length) { setErrors(errs); return; }
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

        <div>
          <Input
            label="Full Name"
            value={form.fullName}
            onChange={handleChange("fullName")}
            required
          />
          {errors.fullName && <p className="text-xs text-rose-500 mt-1">{errors.fullName}</p>}
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

        <Select
          label="Role"
          value={form.role}
          onChange={handleChange("role")}
          options={ROLES.map((r) => ({ label: r.replace("_", " "), value: r }))}
        />

        <div>
          <div className="relative">
            <Input
              label="New Password"
              type={showPassword ? "text" : "password"}
              value={form.password}
              onChange={handleChange("password")}
              placeholder="Leave blank to keep current"
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="absolute right-3 top-8 text-sm text-gray-500 hover:text-gray-800"
            >
              {showPassword ? "Hide" : "Show"}
            </button>
          </div>
        </div>

        {hasError && <p className="text-sm text-rose-600">Something went wrong. Please try again.</p>}

        <div className="flex justify-end gap-2 pt-2">
          <Button variant="outline" type="button" onClick={onClose}>Cancel</Button>
          <Button type="submit" disabled={isLoading}>{isLoading ? "Saving…" : "Save Changes"}</Button>
        </div>
      </Form>
    </Modal>
  );
}