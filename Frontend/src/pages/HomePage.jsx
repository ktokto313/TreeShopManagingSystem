import { Link } from 'react-router-dom'
import Container from '../components/global/Container'
import Badge from '../components/ui/Badge'
import Card from '../components/ui/Card'

const categories = [
  { title: 'Cây trong nhà', description: 'Dễ chăm, hợp phòng khách, phòng làm việc và góc học tập.' },
  { title: 'Cây ngoài trời', description: 'Sức sống tốt, phù hợp ban công, sân vườn và lối đi.' },
  { title: 'Cây để bàn', description: 'Nhỏ gọn, tạo điểm nhấn cho bàn làm việc và kệ sách.' },
  { title: 'Sen đá & xương rồng', description: 'Tối giản, tiết kiệm công chăm sóc, dễ trưng bày.' },
  { title: 'Cây phong thủy', description: 'Gợi ý trang trí theo nhu cầu tài lộc, cân bằng và may mắn.' },
  { title: 'Phụ kiện', description: 'Chậu, đất trồng, dụng cụ và vật tư đi kèm.' },
]

const highlights = [
  {
    title: 'Thông tin về cây',
    description: 'Danh mục chuẩn hóa, dễ tìm theo đặc điểm, vị trí đặt và công năng.',
  },
  {
    title: 'Kiến thức & chăm sóc',
    description: 'Nội dung ngắn gọn, thực dụng cho người mới bắt đầu.',
  },
  {
    title: 'Cảm hứng & ý tưởng',
    description: 'Gợi ý phối cảnh để trang trí nhà ở và văn phòng.',
  },
  {
    title: 'Trang giới thiệu dự án',
    description: 'Dễ thay thế khi cần chuyển sang giao diện chính thức.',
  },
]

const featuredProducts = [
  { name: 'Cây trầu bà đế vương xanh', price: '120.000₫', tag: 'Mới' },
  { name: 'Cây kim ngân ba thân', price: '280.000₫', tag: 'Bán chạy' },
  { name: 'Cây lưỡi hổ mini', price: '160.000₫', tag: 'Dễ chăm' },
  { name: 'Cây hạnh phúc để sàn', price: '550.000₫', tag: 'Cao cấp' },
]

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
      <section className="border-b border-[var(--border)] bg-white/90">
        <Container className="flex flex-wrap items-center justify-between gap-3 py-3 text-sm text-[var(--text)]">
          <div className="flex flex-wrap items-center gap-3">
            <span>08:30 - 22:00</span>
            <span>•</span>
            <span>Hotline: 0838 369 639 - 09 6688 9393</span>
          </div>
          <span className="text-[var(--accent)]">Tree Shop Managing System demo UI</span>
        </Container>
      </section>

      <section className="bg-gradient-to-br from-emerald-50 via-white to-lime-50">
        <Container className="grid gap-10 py-14 lg:grid-cols-[1.2fr_0.8fr] lg:items-center lg:py-20">
          <div className="space-y-6">
            <Badge status="active" className="bg-emerald-100 text-emerald-700">
              Giao diện giới thiệu dự án
            </Badge>
            <div className="space-y-4">
              <h1 className="max-w-2xl text-4xl font-semibold tracking-tight text-[var(--text-h)] sm:text-5xl">
                Tận hưởng không gian sống xanh
              </h1>
              <p className="max-w-2xl text-lg text-[var(--text)]">
                Trang chủ tạm thời cho Tree Shop Managing System. Bố cục được giữ nhẹ, rõ danh mục,
                và dẫn thẳng sang khu quản lý để test CRUD khi cần.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <ActionLink to="#categories" variant="primary">
                Khám phá danh mục
              </ActionLink>
              <ActionLink to="/manage" variant="secondary">
                Vào trang quản lý
              </ActionLink>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              {[
                ['100+', 'sản phẩm mẫu'],
                ['6', 'nhóm danh mục'],
                ['1', 'trang quản lý riêng'],
              ].map(([value, label]) => (
                <Card key={label} className="space-y-1 border-emerald-100 bg-white/90 p-4">
                  <div className="text-2xl font-semibold text-[var(--text-h)]">{value}</div>
                  <div className="text-sm text-[var(--text)]">{label}</div>
                </Card>
              ))}
            </div>
          </div>

          <Card className="space-y-5 border-emerald-100 bg-white/95 p-6 shadow-lg">
            <div className="space-y-2">
              <p className="text-xs uppercase tracking-[0.24em] text-[var(--accent)]">
                Trang tạm thời
              </p>
              <h2 className="text-2xl font-semibold text-[var(--text-h)]">
                Dành cho khách xem và quản trị
              </h2>
              <p className="text-sm text-[var(--text)]">
                Trang chính giữ trải nghiệm kiểu catalog. Khu CRUD được tách riêng để bạn kiểm tra dữ
                liệu mà không làm rối bố cục chính.
              </p>
            </div>

            <div className="grid gap-3">
              {[
                'Dẫn vào khu quản lý bằng một nút riêng',
                'Giữ trang chủ nhẹ, phù hợp trình bày danh mục',
                'Dễ thay thế khi cần đổi sang giao diện chính thức',
              ].map((item) => (
                <div
                  key={item}
                  className="rounded-xl border border-[var(--border)] bg-[var(--social-bg)] px-4 py-3 text-sm text-[var(--text-h)]"
                >
                  {item}
                </div>
              ))}
            </div>
          </Card>
        </Container>
      </section>

      <section id="categories" className="bg-white">
        <Container className="py-14">
          <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-sm font-medium uppercase tracking-[0.2em] text-[var(--accent)]">
                Danh mục sản phẩm
              </p>
              <h2 className="mt-2 text-3xl font-semibold text-[var(--text-h)]">
                Chọn nhanh theo nhu cầu sử dụng
              </h2>
            </div>
            <p className="max-w-xl text-sm text-[var(--text)]">
              Các nhóm dưới đây phản ánh cách dự án tổ chức nội dung: theo không gian, kiểu dáng và
              công năng.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {categories.map((category) => (
              <Card key={category.title} className="space-y-3 border-[var(--border)]">
                <Badge status="active" className="bg-emerald-100 text-emerald-700">
                  Danh mục
                </Badge>
                <h3 className="text-lg font-semibold text-[var(--text-h)]">{category.title}</h3>
                <p className="text-sm leading-6 text-[var(--text)]">{category.description}</p>
              </Card>
            ))}
          </div>
        </Container>
      </section>

      <section className="bg-[var(--social-bg)]/70">
        <Container className="py-14">
          <div className="mb-8">
            <p className="text-sm font-medium uppercase tracking-[0.2em] text-[var(--accent)]">
              Sản phẩm mẫu
            </p>
            <h2 className="mt-2 text-3xl font-semibold text-[var(--text-h)]">
              Một vài mẫu tham khảo cho trang chính
            </h2>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {featuredProducts.map((product) => (
              <Card key={product.name} className="space-y-4 border-[var(--border)]">
                <div className="flex h-40 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-100 via-white to-lime-100 text-5xl">
                  🌿
                </div>
                <div className="flex items-center justify-between gap-3">
                  <Badge status="active" className="bg-emerald-100 text-emerald-700">
                    {product.tag}
                  </Badge>
                  <span className="text-sm font-medium text-[var(--text)]">{product.price}</span>
                </div>
                <h3 className="text-base font-semibold text-[var(--text-h)]">{product.name}</h3>
              </Card>
            ))}
          </div>
        </Container>
      </section>

      <section className="bg-white">
        <Container className="py-14">
          <div className="mb-8">
            <p className="text-sm font-medium uppercase tracking-[0.2em] text-[var(--accent)]">
              Kiến thức & ý tưởng
            </p>
            <h2 className="mt-2 text-3xl font-semibold text-[var(--text-h)]">
              Phần nội dung hỗ trợ giống trang catalog thật
            </h2>
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {highlights.map((item) => (
              <Card key={item.title} className="space-y-3 border-[var(--border)]">
                <h3 className="text-lg font-semibold text-[var(--text-h)]">{item.title}</h3>
                <p className="text-sm leading-6 text-[var(--text)]">{item.description}</p>
              </Card>
            ))}
          </div>
        </Container>
      </section>

      <section className="bg-[var(--accent)]">
        <Container className="py-12">
          <div className="flex flex-col items-start justify-between gap-5 rounded-3xl bg-white p-8 shadow-xl lg:flex-row lg:items-center">
            <div className="space-y-2">
              <p className="text-sm font-medium uppercase tracking-[0.2em] text-[var(--accent)]">
                Quản lý nội dung
              </p>
              <h2 className="text-2xl font-semibold text-[var(--text-h)]">
                Chuyển sang trang CRUD để test categories và products
              </h2>
              <p className="max-w-2xl text-sm text-[var(--text)]">
                Trang chủ giữ vai trò giới thiệu. Khu quản lý nằm riêng để bạn thao tác dữ liệu mà
                không làm rối trải nghiệm bên ngoài.
              </p>
            </div>
            <ActionLink to="/manage" variant="primary">
              Mở trang CRUD
            </ActionLink>
          </div>
        </Container>
      </section>
    </main>
  )
}
