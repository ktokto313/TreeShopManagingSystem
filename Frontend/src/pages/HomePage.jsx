import { Link } from "react-router-dom";
import { Container } from "../components/global/Container";
import { cn } from "../utils/cn";
import bg from "../assets/images/home-bg.jpg";
import { MdOutlineTipsAndUpdates } from "react-icons/md";

function ActionLink({ className, to, children, variant = "primary" }) {
	const baseClass = cn(
		"inline-flex items-center justify-center rounded-md px-5 py-3 text-sm font-medium transition text-nowrap",
		className,
	);
	const variantClass =
		variant === "primary"
			? "bg-green-500 text-white hover:bg-green-400"
			: "border border-green-600 bg-white text-green-700 hover:opacity-60";

	if (typeof to === "string" && to.startsWith("#")) {
		return (
			<a href={to} className={`${baseClass} ${variantClass}`}>
				{children}
			</a>
		);
	}

	return (
		<Link to={to} className={`${baseClass} ${variantClass}`}>
			{children}
		</Link>
	);
}

export default function HomePage() {
	return (
		<main>
			<section className="relative overflow-hidden">
				<Container className="py-16 lg:py-24">
					<img
						src={bg}
						className="absolute object-cover inset-0 h-full w-full -z-20"
					></img>

					{/* Color filter for the section */}
					{/* <div className="absolute opacity-80 inset-0 bg-linear-to-br from-green-300/80 via-white/70 to-green-200/80 -z-10 backdrop-blur-sm"></div> */}

					<div className="relative bg-linear-to-b rounded-3xl from-green-300/80 via-50% via-white/70 to-transparent p-5 sm:p-8 lg:p-12">
						<div className="space-y-4">
							<h1 className="max-w-2xl text-2xl sm:text-3xl md:text-4xl font-semibold tracking-tight text-green-800">
								Khám phá cây xanh cho không gian sống gần gũi và dễ chăm hơn
							</h1>
							<p className="max-w-2xl text-base sm:text-lg md:text-xl text-green-700">
								Một cửa vào nhẹ nhàng cho khách yêu cây: xem gợi ý, tìm cảm hứng
								và bước vào catalog để chọn cây phù hợp với nhà ở, bàn làm việc
								hay góc thư giãn.
							</p>
						</div>

						<div className="flex flex-wrap gap-3 mt-8">
							<ActionLink
								to="/catalog"
								variant="primary"
								className="hover:-translate-y-1 duration-300"
							>
								Vào catalog
							</ActionLink>
							<ActionLink
								to="/manage"
								variant="secondary"
								className="hover:-translate-y-1 duration-300"
							>
								Vào quản lý
							</ActionLink>
						</div>

						<div className="flex gap-1 items-center text-xs sm:text-sm mt-7 text-white/90 bg-green-500/60 rounded-xl p-2 px-4 w-max max-w-full">
							<MdOutlineTipsAndUpdates className="text-base md:text-lg"></MdOutlineTipsAndUpdates>
							<p>
								Gợi ý nhanh: cây để bàn, cây lọc không khí, chậu và phụ kiện cho
								góc xanh của bạn.
							</p>
						</div>
					</div>
				</Container>
			</section>

			<section className="bg-green-400">
				<Container className="py-12">
					<div className="flex flex-col items-start justify-between gap-5 rounded-3xl bg-bg-surface p-8 shadow-xl lg:flex-row lg:items-center">
						<div className="space-y-2">
							<h2 className="text-2xl font-semibold text-green-700">
								Mở catalog để xem cây, hoặc vào quản lý nếu cần cập nhật sản
								phẩm
							</h2>
							<p className="max-w-2xl text-sm text-green-600">
								Trang đầu giữ vai trò dẫn hướng đơn giản cho khách xem cây và
								cho quản trị viên cập nhật dữ liệu.
							</p>
						</div>
						<ActionLink to="/catalog" variant="primary">
							Mở catalog
						</ActionLink>
					</div>
				</Container>
			</section>
		</main>
	);
}
