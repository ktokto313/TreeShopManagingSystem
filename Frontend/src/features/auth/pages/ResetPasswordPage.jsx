import { useNavigate } from "react-router-dom";
import { useResetPassword } from "../hooks/useResetPassword";

export default function ResetPasswordPage() {
    const navigate = useNavigate();

    const {
        step,
        email,
        otp,
        newPassword,
        loading,
        error,
        countdown,
        setEmail,
        setOtp,
        setNewPassword,
        handleSendOtp,
        handleVerifyOtp,
        handleResetPassword,
    } = useResetPassword();

    const isValidEmail = (email) => /^\S+@\S+\.\S+$/.test(email);

    return (
        <div className="flex items-center justify-center min-h-screen bg-green-100">
            <div className="bg-white p-8 w-[400px] shadow rounded-lg">
                <h2 className="text-xl font-bold mb-6 text-green-700">
                    Reset Password
                </h2>

                {error && (
                    <div className="mb-4 text-red-600 text-sm">{error}</div>
                )}

                {/* EMAIL + SEND OTP */}
                <div className="flex gap-2 mb-2">
                    <input
                        placeholder="Nhập email của bạn: "
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        disabled={loading}
                        className="flex-1 border p-2 rounded focus:outline-none focus:ring-2 focus:ring-green-400"
                    />

                    <button
                        onClick={handleSendOtp}
                        disabled={!isValidEmail(email) || loading || countdown > 0}
                        className="px-4 rounded bg-green-600 text-white text-sm
                                   hover:bg-green-500 transition
                                   disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {countdown > 0 ? `${countdown}s` : "Gửi OTP"}
                    </button>
                </div>

                {/* EMAIL ERROR */}
                {email && !isValidEmail(email) && (
                    <p className="text-xs text-red-500 mb-3">
                        Email không hợp lệ
                    </p>
                )}

                {/* OTP INPUT */}
                <input
                    placeholder="Nhập OTP: "
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    disabled={step < 2 || loading}
                    className="w-full border p-2 mb-4 rounded focus:outline-none focus:ring-2 focus:ring-green-400 disabled:bg-gray-100"
                />

                {/* BUTTON GROUP */}
                <div className="flex gap-2 mb-4">
                    <button
                        onClick={() => navigate('/login')}
                        disabled={loading}
                        className="flex-1 border border-gray-400 text-gray-700 py-2 rounded
                                   hover:bg-gray-100 transition
                                   disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Hủy
                    </button>

                    <button
                        onClick={handleVerifyOtp}
                        disabled={step < 2 || loading}
                        className="flex-1 bg-green-600 text-white py-2 rounded
                                   hover:bg-green-500 transition
                                   disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        OTP
                    </button>
                </div>

                {/* NEW PASSWORD */}
                <input
                    type="password"
                    placeholder="Mật khẩu mới"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    disabled={step < 3 || loading}
                    className="w-full border p-2 mb-4 rounded focus:outline-none focus:ring-2 focus:ring-green-400 disabled:bg-gray-100"
                />

                <button
                    onClick={() => handleResetPassword(navigate)}
                    disabled={step < 3 || loading}
                    className="w-full bg-green-600 text-white py-2 rounded
                               hover:bg-green-500 transition
                               disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    Đặt lại mật khẩu
                </button>
            </div>
        </div>
    );
}