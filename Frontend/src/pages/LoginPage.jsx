import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import Container from '../components/global/Container'
import Badge from '../components/ui/Badge'
import Button from '../components/ui/Button'
import Card from '../components/ui/Card'
import Form from '../components/ui/Form'
import Input from '../components/ui/Input'
import { useAuth } from '../hooks/useAuth'

function canAccessManagement(role) {
  return role === 'MANAGER' || role === 'SYSTEM_ADMIN'
}

export default function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { login, canManage } = useAuth()
  const [values, setValues] = useState({
    email: 'admin@greenshop.vn',
    password: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const fromPath = location.state?.from?.pathname || '/manage'

  function handleChange(event) {
    const { name, value } = event.target
    setValues((current) => ({
      ...current,
      [name]: value,
    }))
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setLoading(true)
    setError('')

    try {
      const loggedInUser = await login(values.email, values.password)
      const targetPath = canAccessManagement(loggedInUser.role)
        ? fromPath === '/login'
          ? '/manage'
          : fromPath
        : '/catalog'

      navigate(targetPath, { replace: true })
    } catch (loginError) {
      if (loginError.status === 401) {
        setError('Đăng nhập thất bại. Vui lòng kiểm tra lại email và mật khẩu.')
      } else {
        setError(loginError.message || 'Không thể đăng nhập ngay lúc này.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="bg-[var(--social-bg)]/70">
      <Container className="grid min-h-[calc(100vh-8rem)] items-center py-10 lg:grid-cols-[1fr_420px] lg:gap-8">
        <section className="space-y-6 rounded-3xl border border-emerald-100 bg-gradient-to-br from-emerald-50 via-white to-lime-50 p-8 shadow-sm">
          <Badge status="active" className="bg-emerald-100 text-emerald-700">
            Đăng nhập quản lý
          </Badge>
          <div className="space-y-4">
            <h1 className="text-4xl font-semibold tracking-tight text-[var(--text-h)]">
              Truy cập khu dành cho quản lý
            </h1>
            <p className="max-w-2xl text-base leading-7 text-[var(--text)]">
              Trang này mở danh sách danh mục và sản phẩm sau khi xác thực. Nếu tài khoản của bạn là
              quản lý hoặc quản trị viên, hãy đăng nhập để tải dữ liệu và thao tác.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {[
              ['Manager', 'Quản lý categories, products và luồng kiểm thử CRUD.'],
              ['System Admin', 'Toàn quyền truy cập các màn hình quản trị.'],
              ['Customer', 'Phù hợp cho luồng browse, không vào khu CRUD.'],
              ['Cookie JWT', 'Phiên đăng nhập được giữ để request đi qua backend.'],
            ].map(([title, description]) => (
              <Card key={title} className="space-y-2 border-emerald-100 bg-white/95">
                <h2 className="text-lg font-semibold text-[var(--text-h)]">{title}</h2>
                <p className="text-sm leading-6 text-[var(--text)]">{description}</p>
              </Card>
            ))}
          </div>
        </section>

        <Card className="space-y-6 border-emerald-100 bg-white/95 p-6 shadow-lg">
          <div className="space-y-2">
            <p className="text-sm font-medium uppercase tracking-[0.2em] text-[var(--accent)]">
              GreenShop
            </p>
            <h2 className="text-2xl font-semibold text-[var(--text-h)]">Đăng nhập</h2>
            <p className="text-sm leading-6 text-[var(--text)]">
              Dùng tài khoản đã có trong dữ liệu seed của dự án. Nếu bạn đang thử khu quản lý, hãy
              đăng nhập bằng tài khoản có quyền của Manager hoặc System Admin.
            </p>
          </div>

          {error ? (
            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          ) : null}

          <Form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Email"
              name="email"
              type="email"
              autoComplete="email"
              value={values.email}
              onChange={handleChange}
            />
            <Input
              label="Mật khẩu"
              name="password"
              type="password"
              autoComplete="current-password"
              value={values.password}
              onChange={handleChange}
            />

            <div className="flex flex-wrap gap-3 pt-2">
              <Button type="submit" disabled={loading}>
                {loading ? 'Đang đăng ký' : 'Đăng ký'}
              </Button>
              <Button type="button" variant="secondary" onClick={() => navigate('/', { replace: true })}>
                Quay lại trang chủ
              </Button>
            </div>
          </Form>

          <div className="rounded-xl border border-[var(--border)] bg-[var(--social-bg)] p-4 text-sm text-[var(--text)]">
            <div className="font-medium text-[var(--text-h)]">
              Current session: {canManage ? 'Có thể truy cập với tư cách Manager' : 'Chưa được cấp quyền'}
            </div>
            <p className="mt-1 leading-6">
              Sau khi đăng nhập, ứng dụng giữ lại JWT cookie để có thể load các request của CRUD mà không dính cổng 401.
            </p>
          </div>
        </Card>
      </Container>
    </main>
  )
}
