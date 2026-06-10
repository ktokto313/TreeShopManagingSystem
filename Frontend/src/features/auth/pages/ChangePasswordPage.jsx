import { useNavigate } from 'react-router-dom'
import Container from '../../../components/global/Container'
import Card from '../../../components/ui/Card'
import { useChangePassword } from '../hooks/useChangePassword' // Sửa lại đường dẫn import hook cho đúng với dự án của bạn

const EyeIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
    </svg>
)

const EyeOffIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
    </svg>
)

function PasswordField({ label, value, onChange, show, onToggle, disabled, error }) {
    return (
        <div>
            <label className="block text-sm font-medium mb-1.5 text-gray-700">{label}</label>
            <div className="relative">
                <input
                    type={show ? 'text' : 'password'}
                    value={value}
                    onChange={onChange}
                    disabled={disabled}
                    className={`w-full border px-3 py-2.5 pr-10 text-sm focus:outline-none disabled:opacity-50 rounded-md transition-colors ${
                        error ? 'border-red-400 focus:border-red-400' : 'border-gray-300 focus:border-green-500'
                    }`}
                />
                <button
                    type="button"
                    onClick={onToggle}
                    tabIndex={-1}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
                >
                    {show ? <EyeOffIcon /> : <EyeIcon />}
                </button>
            </div>
            {error && <p className="mt-1.5 text-xs text-red-600">{error}</p>}
        </div>
    )
}

export default function ChangePasswordPage() {
    const navigate = useNavigate()

    // Gọi Custom Hook chứa toàn bộ logic xử lý
    const {
        values,
        show,
        errors,
        submitting,
        success,
        handleChange,
        toggleShow,
        handleSubmit
    } = useChangePassword()

    return (
        <main>
            <Container className="py-10">
                <Card className="p-6 max-w-md">

                    <div className="flex items-center gap-3 mb-6">
                        <button
                            type="button"
                            onClick={() => navigate('/profile')}
                            className="text-gray-400 hover:text-gray-600 transition cursor-pointer"
                            aria-label="Quay lại"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                            </svg>
                        </button>
                        <h1 className="text-2xl font-semibold">Đổi mật khẩu</h1>
                    </div>

                    {success ? (
                        <div className="p-3 text-sm border border-green-400 text-green-700 bg-green-50 rounded">
                            Đổi mật khẩu thành công! Đang chuyển hướng...
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-4">

                            {errors.form && (
                                <div className="p-3 text-sm border border-red-400 text-red-700 bg-red-50 rounded">
                                    {errors.form}
                                </div>
                            )}

                            <PasswordField
                                label="Mật khẩu hiện tại *"
                                value={values.oldPassword}
                                onChange={handleChange('oldPassword')}
                                show={show.old}
                                onToggle={() => toggleShow('old')}
                                disabled={submitting}
                                error={errors.oldPassword}
                            />

                            <PasswordField
                                label="Mật khẩu mới *"
                                value={values.newPassword}
                                onChange={handleChange('newPassword')}
                                show={show.new}
                                onToggle={() => toggleShow('new')}
                                disabled={submitting}
                                error={errors.newPassword}
                            />

                            <PasswordField
                                label="Xác nhận mật khẩu mới *"
                                value={values.confirmPassword}
                                onChange={handleChange('confirmPassword')}
                                show={show.confirm}
                                onToggle={() => toggleShow('confirm')}
                                disabled={submitting}
                                error={errors.confirmPassword}
                            />

                            <div className="flex gap-2 pt-2">
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 cursor-pointer text-sm font-medium transition disabled:opacity-50"
                                >
                                    {submitting ? 'Đang lưu...' : 'Lưu mật khẩu'}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => navigate('/profile')}
                                    disabled={submitting}
                                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 cursor-pointer text-sm font-medium transition disabled:opacity-50"
                                >
                                    Hủy
                                </button>
                            </div>
                        </form>
                    )}
                </Card>
            </Container>
        </main>
    )
}