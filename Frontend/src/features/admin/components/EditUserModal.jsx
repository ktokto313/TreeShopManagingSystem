/*
 * Name: Edit User Modal
 * @Author: DucLM
 * Date: 2026-06-05
 * Version: 2.0
 * Description: Modal form for updating an existing user's profile fields and role assignment.
 */
import { useState } from "react";
import { Modal } from "../../../components/ui/Modal";
import { Form } from "../../../components/ui/Form";
import { Input } from "../../../components/ui/Input";
import { Select } from "../../../components/ui/Select";
import { Button } from "../../../components/ui/Button";
import { useUpdateUser } from "../hooks/useUpdateUser";

const ROLES = ["CUSTOMER", "MANAGER", "SHIPPER", "SUPPORT_AGENT"];

function validate(form) {
  const errors = {};
  if (!form.fullName.trim()) errors.fullName = "Vui lòng gõ đầy đủ họ tên";
  else if (!/^[a-zA-ZÀ-ỹ\s]+$/.test(form.fullName.trim()))
    errors.fullName = "Họ tên vui lòng không thêm vào ký tự đặc biệt";
  if (form.phone && !/^0\d{8,10}$/.test(form.phone.replace(/\s/g, "")))
    errors.phone = "Số điện thoại phải bắt đầu bằng 0 và chứa từ 9-11 số";
  return errors;
}

export function EditUserModal({ user, isOpen, onClose, onUpdated }) {
  const [form, setForm] = useState(() => ({
    fullName: user?.fullName ?? "",
    phone: user?.phone ?? "",
    role: user?.role ?? "CUSTOMER",
    password: "",
  }));
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);

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
            label="Họ và Tên"
            value={form.fullName}
            onChange={handleChange("fullName")}
            required
          />
          {errors.fullName && <p className="text-xs text-rose-500 mt-1">{errors.fullName}</p>}
        </div>

        <div>
          <Input
            label="Số điện thoại"
            value={form.phone}
            onChange={handleChange("phone")}
            placeholder="0912 345 678"
          />
          {errors.phone && <p className="text-xs text-rose-500 mt-1">{errors.phone}</p>}
        </div>

        <Select
          label="Quyền"
          value={form.role}
          onChange={handleChange("role")}
          options={ROLES.map((r) => ({ label: r.replace("_", " "), value: r }))}
        />

        <div>
          <div className="relative">
            <Input
              label="Mật khẩu mới"
              type={showPassword ? "text" : "password"}
              value={form.password}
              onChange={handleChange("password")}
              placeholder="Để trống để giữ mật khẩu hiện tại"
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="absolute right-3 top-8 text-sm text-gray-500 hover:text-gray-800"
            >
              {showPassword ? "Ẩn" : "Hiện"}
            </button>
          </div>
        </div>

        {hasError && <p className="text-sm text-rose-600">Đã có lỗi xảy ra. Vui lòng thử lại.</p>}

        <div className="flex justify-end gap-2 pt-2">
          <Button variant="outline" type="button" className="bg-red-500 hover:bg-red-400 text-white" onClick={onClose}>Cancel</Button>
          <Button type="submit" disabled={isLoading}>{isLoading ? "Đang Lưu" : "Lưu"}</Button>
        </div>
      </Form>
    </Modal>
  );
}
