import { Link } from 'react-router-dom'
import Container from '../components/global/Container'

function ActionLink({ to, children, variant = 'primary' }) {
  const baseClass =
    'inline-flex items-center justify-center rounded-md px-5 py-3 text-sm font-medium transition'
  const variantClass =
    variant === 'primary'
      ? 'bg-[var(--accent)] text-white hover:opacity-90'
      : 'border border-[var(--border)] bg-white text-[var(--text-h)] hover:bg-[var(--social-bg)]'

  if (typeof to === 'string' && to.startsWith('#')) {
    return (
      <a href={to} className={`${baseClass} ${variantClass}`}>
        {children}
      </a>
    )
  }

  return (
    <Link to={to} className={`${baseClass} ${variantClass}`}>
      {children}
    </Link>
  )
}

export default function HomePage() {
  return (
    <main>
      <section className="bg-gradient-to-br from-emerald-50 via-white to-lime-50">
        <Container className="py-16 lg:py-24">
          <div className="space-y-6">
            <div className="space-y-4">
              <h1 className="max-w-2xl text-4xl font-semibold tracking-tight text-[var(--text-h)] sm:text-5xl">
                Khám phá cây xanh cho không gian sống gần gũi và dễ chăm hơn
              </h1>
              <p className="max-w-2xl text-lg text-[var(--text)]">
                Một cửa vào nhẹ nhàng cho khách yêu cây: xem gợi ý, tìm cảm hứng và bước vào catalog
                để chọn cây phù hợp với nhà ở, bàn làm việc hay góc thư giãn.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <ActionLink to="/catalog" variant="primary">
                Vào catalog
              </ActionLink>
            </div>

            <p className="max-w-2xl text-sm text-[var(--text)]">
              Gợi ý nhanh: cây để bàn, cây lọc không khí, chậu và phụ kiện cho góc xanh của bạn.
            </p>
          </div>
        </Container>
      </section>

      <section className="bg-[var(--accent)]">
        <Container className="py-12">
          <div className="flex flex-col items-start justify-between gap-5 rounded-3xl bg-white p-8 shadow-xl lg:flex-row lg:items-center">
            <div className="space-y-2">
              <h2 className="text-2xl font-semibold text-[var(--text-h)]">
                Mở catalog để xem cây xanh phù hợp với không gian của bạn
              </h2>
              <p className="max-w-2xl text-sm text-[var(--text)]">
                Trang đầu giữ vai trò dẫn hướng nhẹ nhàng cho khách xem cây, khám phá danh mục và chọn sản phẩm phù hợp.
              </p>
            </div>
            <ActionLink to="/catalog" variant="primary">
              Mở catalog
            </ActionLink>
          </div>
        </Container>
      </section>
    </main>
  )
}
