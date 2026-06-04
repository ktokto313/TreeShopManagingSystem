import { useEffect, useState } from 'react'
import Container from '../components/global/Container'
import Card from '../components/ui/Card'
import Input from '../components/ui/Input'
import { requestJson } from '../utils/api'

export default function ProfilePage() {
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  // State quản lý chế độ chỉnh sửa
  const [isEditing, setIsEditing] = useState(false)
  // State lưu dữ liệu form khi người dùng nhập dữ liệu mới
  const [formData, setFormData] = useState({ fullName: '', phone: '' })
  // State quản lý trạng thái đang gửi API cập nhật
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    fetchProfile()
  }, [])

  const fetchProfile = () => {
    setLoading(true)
    requestJson('/api/profile')
        .then((data) => {
          setProfile(data)
          // Khởi tạo giá trị form ban đầu từ profile tải về
          setFormData({ fullName: data.fullName, phone: data.phone })
        })
        .catch(() => setProfile(null))
        .finally(() => setLoading(false))
  }

  // Xử lý khi người dùng gõ phím thay đổi dữ liệu trong Input
  const handleInputChange = (e, field) => {
    setFormData({
      ...formData,
      [field]: e.target.value
    })
  }

  // Xử lý khi bấm nút "Hủy" - trả về dữ liệu cũ
  const handleCancel = () => {
    setIsEditing(false)
    if (profile) {
      setFormData({ fullName: profile.fullName, phone: profile.phone })
    }
  }

  // Xử lý gửi dữ liệu cập nhật lên Backend
  const handleSave = async () => {
    if (!formData.fullName.trim()) {
      alert("Họ tên không được để trống!")
      return
    }

    setSubmitting(true)
    try {
      // 1. Gọi API cập nhật lên Backend
      await requestJson('/api/profile', {
        method: 'PUT',
        body: formData
      })

      // 2. Cập nhật trực tiếp vào state profile bằng cách giữ các trường cũ và đè dữ liệu mới lên
      setProfile((prevProfile) => ({
        ...prevProfile,
        fullName: formData.fullName,
        phone: formData.phone
      }))

      setIsEditing(false)
      alert("Cập nhật thông tin cá nhân thành công!")
    } catch (error) {
      console.error(error)
      alert("Có lỗi xảy ra khi cập nhật thông tin!")
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return <div className="p-6 text-center text-gray-500">Loading...</div>
  }

  if (!profile) {
    return <div className="p-6 text-center text-red-500">Không thể tải thông tin người dùng</div>
  }

  return (
      <main>
        <Container className="py-10">
          <Card className="space-y-6 p-6">
            <div className="flex justify-between items-center">
              <h1 className="text-2xl font-semibold">Thông tin cá nhân</h1>

              <div className="space-x-2">
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
              <Input
                  label="Email"
                  value={profile.email}
                  disabled
              />

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