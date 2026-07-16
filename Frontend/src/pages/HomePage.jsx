import { Link } from "react-router-dom";
import { Container } from "../components/global/Container";
import { cn } from "../utils/cn";
import bg from "../assets/images/home-bg.jpg";
import { MdOutlineTipsAndUpdates } from "react-icons/md";
import ValuePropositions from "../features/homepage/components/ValuePropositions";
import CategoriesGrid from "../features/homepage/components/CategoriesGrid";
import FeaturedProducts from "../features/homepage/components/FeaturedProducts";
import TestimonialSlider from "../features/homepage/components/TestimonialSlider";
import BlogHighlight from "../features/homepage/components/BlogHighlight";
import NewsletterFAQ from "../features/homepage/components/NewsletterFAQ";
import RecommendationSection from "../features/recommendations/components/RecommendationSection";
import { useContext, useEffect } from "react";
import { AuthContext } from "../context/AuthContext";
import { BiLeaf } from "react-icons/bi";

function ActionLink({ className, to, children, variant = "primary" }) {
	const baseClass = cn(
		"inline-flex items-center justify-center rounded-md px-5 py-3 text-sm font-medium transition text-nowrap",
		className,
	);
	const variantClass =
		variant === "primary"
			? "bg-yellow-500 text-white hover:bg-yellow-400"
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
	const { canManage } = useContext(AuthContext);

	useEffect(() => {
		window.scrollTo(0, 0);
	}, []);

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

						<div className="flex w-70 flex-wrap gap-3 mt-8">
							<ActionLink
								to="/catalog"
								variant="primary"
								className="flex gap-2 grow text-xl hover:-translate-y-1 duration-300"
							>
								<BiLeaf></BiLeaf>
								 Khám phá gian hàng
								 <BiLeaf></BiLeaf>
							</ActionLink>
							{canManage && (
								<ActionLink
									to="/manage"
									variant="secondary"
									className="hover:-translate-y-1 duration-300"
								>
									Vào quản lý
								</ActionLink>
							)}
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

			<ValuePropositions />
			<CategoriesGrid />
			<FeaturedProducts />
			<RecommendationSection />
			<TestimonialSlider />
			<BlogHighlight />
			<NewsletterFAQ />
		</main>
	);
}
