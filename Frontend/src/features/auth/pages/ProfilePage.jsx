import { useNavigate } from 'react-router-dom'
import Container from '../../../components/global/Container'
import Card from '../../../components/ui/Card'
import Input from '../../../components/ui/Input'
import { useProfile } from '../hooks/useProfile'

export default function ProfilePage() {
  const navigate = useNavigate()

  const {
    profile,
    loading,
    isEditing,
    formData,
    submitting,
    setIsEditing,
    handleInputChange,
    handleCancel,
    handleSave,
  } = useProfile()

  if (loading) return <div className="p-6 text-center text-gray-500">Loading...</div>
  if (!profile) return <div className="p-6 text-center text-red-500">Không thể tải thông tin người dùng</div>

  function handleChangePassword() {
    if (!profile.hasPassword) {
      alert('Tài khoản Google không có mật khẩu. Vui lòng sử dụng đăng nhập Google.')
      return
    }
    navigate('/change-password')
  }

  return (
      <main>
        <Container className="py-10">
          <Card className="space-y-6 p-6">
            <div className="flex justify-between items-center">
              <h1 className="text-2xl font-semibold">Thông tin cá nhân</h1>
              <div className="space-x-2">
                <button
                    onClick={handleChangePassword}
                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 cursor-pointer text-sm font-medium transition"
                >
                  Đổi mật khẩu
                </button>
                {!isEditing ? (
                    <button
                        onClick={() => setIsEditing(true)}
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 cursor-pointer text-sm font-medium transition"
                    >
                      Chỉnh sửa
                    </button>
                ) : (
                    <>
                      <button
                          onClick={handleCancel}
                          disabled={submitting}
                          className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 cursor-pointer text-sm font-medium transition disabled:opacity-50"
                      >
                        Hủy
                      </button>
                      <button
                          onClick={handleSave}
                          disabled={submitting}
                          className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 cursor-pointer text-sm font-medium transition disabled:opacity-50"
                      >
                        {submitting ? 'Đang lưu...' : 'Lưu'}
                      </button>
                    </>
                )}
              </div>
            </div>

            <div className="space-y-4">
              <Input label="Email" value={profile.email} disabled />
              <Input
                  label="Họ tên"
                  value={formData.fullName}
                  onChange={(e) => handleInputChange(e, 'fullName')}
                  disabled={!isEditing || submitting}
              />
              <Input
                  label="Số điện thoại"
                  value={formData.phone}
                  onChange={(e) => handleInputChange(e, 'phone')}
                  disabled={!isEditing || submitting}
              />
              <Input
                  label="Trạng thái"
                  value={profile.status ? 'Hoạt động' : 'Bị khóa'}
                  disabled
              />
            </div>
          </Card>
        </Container>
      </main>
  )
}