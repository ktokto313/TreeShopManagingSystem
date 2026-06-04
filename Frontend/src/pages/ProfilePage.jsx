import { useEffect, useState } from 'react'
import Container from '../components/global/Container'
import Card from '../components/ui/Card'
import Input from '../components/ui/Input'
import { requestJson } from '../utils/api'

export default function ProfilePage() {
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    requestJson('/api/profile')
        .then((data) => setProfile(data))
        .catch(() => setProfile(null))
        .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return <div className="p-6">Loading...</div>
  }

  if (!profile) {
    return <div className="p-6">Không thể tải thông tin người dùng</div>
  }

  return (
      <main>
        <Container className="py-10">
          <Card className="space-y-6 p-6">
            <h1 className="text-2xl font-semibold">Thông tin cá nhân</h1>

            <div className="space-y-4">
              <Input
                  label="Email"
                  value={profile.email}
                  disabled
              />

              <Input
                  label="Họ tên"
                  value={profile.fullName}
                  disabled
              />

              <Input
                  label="Số điện thoại"
                  value={profile.phone}
                  disabled
              />

              <Input
                  label="Trạng thái"
                  value={profile.active ? 'Hoạt động' : 'Bị khóa'}
                  disabled
              />
            </div>
          </Card>
        </Container>
      </main>
  )
}