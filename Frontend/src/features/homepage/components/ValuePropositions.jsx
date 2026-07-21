import { useScrollReveal } from "../hooks/useScrollReveal";
import {
	FiCheckCircle,
	FiTruck,
	FiHeadphones,
	FiPackage,
} from "react-icons/fi";

const reasons = [
	{
		icon: <FiCheckCircle className="w-6 h-6 text-green-600" />,
		title: "Cây Khỏe Đảm Bảo",
		desc: "Tuyển chọn kỹ lưỡng, rễ khỏe, thân đẹp.",
		delay: "delay-100",
	},
	{
		icon: <FiHeadphones className="w-6 h-6 text-green-600" />,
		title: "Tư Vấn Trọn Đời",
		desc: "Đội ngũ chuyên gia hỗ trợ kỹ thuật và chăm sóc cây 24/7.",
		delay: "delay-300",
	},
	{
		icon: <FiPackage className="w-6 h-6 text-green-600" />,
		title: "Đóng Gói Kỹ Lưỡng",
		desc: "Hộp giấy bảo vệ môi trường, thiết kế chống sốc cho cây.",
		delay: "delay-500",
	},
	{
		icon: <FiTruck className="w-6 h-6 text-green-600" />,
		title: "Giao Hàng Hoả Tốc",
		desc: "Hỗ trợ ship nhanh nội thành để cây giữ nguyên độ tươi mới.",
		delay: "delay-700",
	},
];

export default function ValuePropositions() {
	const { ref, isVisible } = useScrollReveal({ threshold: 0.2 });

	return (
		<section className="lg:pt-10 overflow-hidden bg-green-50/50 mx-auto max-w-385 @container" ref={ref}>
			<div className="grid grid-cols-1 lg:grid-cols-2 gap-1 items-center">
				{/* Left Column */}
				<div
					className={`flex from-green-700 to-green-500 bg-linear-to-br items-center lg:rounded-tr-[35cqi] lg:rounded-bl-[28cqi] h-full justify-center transition-all duration-1000 ease-out transform ${
						isVisible
							? "translate-x-0 opacity-100"
							: "-translate-x-full opacity-0"
					}`}
				>
					<div className="px-5 py-15">
						<h2 className="text-2xl md:text-4xl font-bold text-white mb-4">
							Tại sao chọn chúng tôi?
						</h2>
						<p className="text-white/90 text-sm md:text-base max-w-md">
							Tại Greenshop, mỗi chậu cây không chỉ là sản phẩm mà còn là một
							phần thiên nhiên được nâng niu trao đến tay bạn với chất lượng
							dịch vụ tốt nhất.
						</p>
					</div>
				</div>

				{/* Right Column */}
				<div className="grid grid-cols-2 px-5 pt-7 sm:grid-cols-2 gap-2 sm:gap-6">
					{reasons.map((reason, idx) => (
						<div
							key={idx}
							className={`flex flex-col gap-2 p-6 bg-white rounded-2xl shadow-sm border border-green-500 transition-all duration-1000 ease-out transform ${
								isVisible
									? "translate-x-0 opacity-100"
									: "translate-x-full opacity-0"
							} ${reason.delay}`}
						>
							<div className="p-3 bg-green-100 w-max rounded-xl">
								{reason.icon}
							</div>
							<h3 className="text-lg font-semibold text-green-800">
								{reason.title}
							</h3>
							<p className="text-xs sm:text-sm text-green-600">{reason.desc}</p>
						</div>
					))}
				</div>
			</div>
		</section>
	);
}
