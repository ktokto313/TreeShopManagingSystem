/*
 * Created By: MinhLTHE200133
 * Created At: 2026-06-04
 * Last Modified: 2026-07-15
 */
import { useContext, useEffect, useMemo, useState } from "react";
import ReactMarkdown from "react-markdown";
import {
	FaHeart,
	FaLeaf,
	FaRegHeart,
	FaShieldAlt,
	FaShoppingCart,
	FaTruck,
	FaUndo,
} from "react-icons/fa";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import remarkGfm from "remark-gfm";
import { Container } from "../components/global/Container";
import { Badge } from "../components/ui/Badge";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { AuthContext } from "../context/AuthContext";
import { addCartItem } from "../features/cart/cartApi";
import { loadPublicJson } from "../features/catalog/utils/catalogApi";
import { formatCurrency } from "../features/catalog/utils/catalogUtils";
import ProductImageFrame from "../features/products/components/ProductImageFrame";
import { getProductAvailability, isProductActive } from "../features/products/utils/productAvailability";
import { resolveProductImages } from "../features/products/utils/productImageResolver";
import ReviewSection from "../features/review/components/ReviewSection";
import { addWishlistProduct, checkWishlistProduct } from "../features/wishlist/wishlistApi";

function summarizeDescription(value) {
	if (!value) {
		return "Chưa có mô tả chi tiết cho sản phẩm này.";
	}

	return String(value);
}

function createDetailParagraphs(product, categoryName) {
	const baseDescription = summarizeDescription(product?.description);
	const stock = Number(product?.stock ?? 0);
	const categoryText = categoryName && categoryName !== "-" ? categoryName.toLowerCase() : "cây xanh";

	return [
		baseDescription,
		`Sản phẩm thuộc nhóm ${categoryText}, phù hợp để làm mới không gian sống, góc học tập hoặc khu vực làm việc. Khi chọn mua, bạn có thể xem nhanh tình trạng kho, giá bán và ảnh minh họa ngay trên trang này.`,
		stock > 0
			? `Hiện còn ${stock} sản phẩm. Bạn nên đặt mua khi cây còn đúng kích thước và màu dáng mong muốn, đặc biệt với các sản phẩm cây cảnh có số lượng thay đổi theo từng đợt nhập hàng.`
			: "Sản phẩm hiện đã hết hàng. Bạn vẫn có thể lưu vào danh sách yêu thích để quay lại kiểm tra khi cửa hàng cập nhật tồn kho.",
	];
}

function createDetailMarkdownContent(product, categoryName, imageUrl) {
	const stock = Number(product?.stock ?? 0);
	const price = formatCurrency(product?.price);
	const careGuide = product?.careGuide || "Chưa cập nhật";
	const sunlightLevel = product?.sunlightLevel || "Chưa cập nhật";
	const wateringFrequency = product?.wateringFrequency || "Chưa cập nhật";
	const difficulty = product?.difficulty || "Chưa cập nhật";
	const fengShuiElement = product?.fengShuiElement || "Chưa cập nhật";
	const imageBlock = imageUrl
		? `![${product?.name || "Sản phẩm"}](${imageUrl})`
		: "Chưa có ảnh minh họa riêng cho sản phẩm này.";

	const sample = [
		`# ${product?.name || "Thông tin chi tiết của sản phẩm"}`,
		"",
		`## ${categoryName && categoryName !== "-" ? categoryName : "Danh mục sản phẩm"}`,
		"",
		`Sản phẩm phù hợp để bố trí trong không gian sống, bàn làm việc hoặc khu vực thư giãn. Hiện tại sản phẩm đang có **${stock}** sản phẩm với mức giá **${price}**.`,
		"",
		"### Hình ảnh minh họa",
		"",
		imageBlock,
		"",
		"### Thông tin nhanh",
		"",
		`- **Hướng dẫn chăm sóc:** ${careGuide}`,
		`- **Ánh sáng:** ${sunlightLevel}`,
		`- **Tần suất tưới:** ${wateringFrequency}`,
		`- **Độ khó chăm:** ${difficulty}`,
		`- **Phong thủy:** ${fengShuiElement}`,
		"",
		"### Ghi chú",
		"",
		"Sản phẩm này được hiển thị theo nội dung markdown để hỗ trợ thêm ảnh, tiêu đề và các đoạn mô tả chi tiết.",
	];

	return sample.join("\n");
}

function InfoBox({ label, value }) {
	return (
		<div className="rounded-2xl border border-green-200 bg-white/80 p-4 shadow-sm">
			<div className="text-xs uppercase tracking-[0.18em] text-green-700">{label}</div>
			<div className="mt-2 text-sm font-medium text-green-950">{value}</div>
		</div>
	);
}

function SectionTitle({ eyebrow, title, children }) {
	return (
		<div className="space-y-2">
			<p className="text-xs font-semibold uppercase tracking-[0.3em] text-green-700">{eyebrow}</p>
			<h2 className="text-2xl font-semibold text-green-950">{title}</h2>
			{children ? <p className="max-w-3xl text-sm leading-6 text-green-800">{children}</p> : null}
		</div>
	);
}

function PolicyItem({ icon, title, description }) {
	return (
		<div className="rounded-2xl border border-green-200 bg-white/85 p-4 shadow-sm">
			<div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-green-100 text-green-700">
				{icon}
			</div>
			<h3 className="font-semibold text-green-950">{title}</h3>
			<p className="mt-2 text-sm leading-6 text-green-800">{description}</p>
		</div>
	);
}

function MarkdownContent({ content }) {
	return (
		<article className="space-y-4 rounded-3xl border border-green-100 bg-white/95 p-5 text-green-950 shadow-sm">
			<ReactMarkdown
				remarkPlugins={[remarkGfm]}
				components={{
					h1: (props) => <h3 className="text-2xl font-semibold text-green-950" {...props} />,
					h2: (props) => <h4 className="text-xl font-semibold text-green-950" {...props} />,
					h3: (props) => <h5 className="text-lg font-semibold text-green-950" {...props} />,
					p: (props) => <p className="text-sm leading-7 text-green-900" {...props} />,
					ul: (props) => <ul className="list-disc space-y-2 pl-5 text-sm leading-7 text-green-900" {...props} />,
					ol: (props) => <ol className="list-decimal space-y-2 pl-5 text-sm leading-7 text-green-900" {...props} />,
					li: (props) => <li className="pl-1" {...props} />,
					blockquote: (props) => (
						<blockquote className="border-l-4 border-green-300 bg-green-50 px-4 py-3 text-sm leading-7 text-green-900" {...props} />
					),
					img: (props) => (
						<img
							{...props}
							alt={props.alt || ""}
							className="my-4 w-full rounded-2xl border border-green-200 object-cover shadow-sm"
						/>
					),
					a: (props) => (
						<a className="font-medium text-green-700 underline decoration-green-300 underline-offset-4" {...props} />
					),
				}}
			>
				{content}
			</ReactMarkdown>
		</article>
	);
}

function SimilarProductCard({ product, onOpen }) {
	const images = resolveProductImages(product.images);
	const availability = getProductAvailability(product);

	return (
		<button
			type="button"
			className="group rounded-3xl border border-green-200 bg-white/85 p-3 text-left shadow-sm transition hover:-translate-y-1 hover:border-green-400 hover:shadow-lg"
			onClick={() => onOpen(product)}
		>
			<ProductImageFrame
				src={images[0]}
				alt={product.name}
				className="h-36 rounded-2xl bg-green-50"
				fallbackLabel="Chưa có ảnh"
			/>
			<div className="mt-3 space-y-2">
				<h3 className="min-h-12 overflow-hidden font-semibold text-green-950 group-hover:text-green-700">
					{product.name}
				</h3>
				<div className="flex items-center justify-between gap-3">
					<span className="font-semibold text-green-700">{formatCurrency(product.price)}</span>
					<Badge status={availability.badgeStatus} className={availability.badgeClassName}>
						{availability.label}
					</Badge>
				</div>
			</div>
		</button>
	);
}

function pickRandomSimilarProducts(products, product, limit = 4) {
	if (!product) {
		return [];
	}

	const candidates = products.filter(
		(item) =>
			String(item.id) !== String(product.id) &&
			String(item.categoryId) === String(product.categoryId) &&
			isProductActive(item.status),
	);

	for (let index = candidates.length - 1; index > 0; index -= 1) {
		const randomIndex = Math.floor(Math.random() * (index + 1));
		[candidates[index], candidates[randomIndex]] = [candidates[randomIndex], candidates[index]];
	}

	return candidates.slice(0, limit);
}

export default function ProductDetailPage() {
	const navigate = useNavigate();
	const location = useLocation();
	const { productId } = useParams();
	const { logout, isAuthenticated, canManage } = useContext(AuthContext);

	const [categories, setCategories] = useState([]);
	const [products, setProducts] = useState([]);
	const [product, setProduct] = useState(location.state?.product ?? null);
	const [loading, setLoading] = useState(!location.state?.product);
	const [notice, setNotice] = useState("");
	const [activeImageSource, setActiveImageSource] = useState("");
	const [isWishlisted, setIsWishlisted] = useState(false);
	const [addingToCart, setAddingToCart] = useState(false);

	async function loadProductDetail() {
		setLoading(true);
		setNotice("");

		try {
			const [categoryData, productData, productListData] = await Promise.all([
				loadPublicJson("/api/categories"),
				loadPublicJson(`/api/products/${productId}`),
				loadPublicJson("/api/products?status=true"),
			]);

			setCategories(Array.isArray(categoryData) ? categoryData : []);
			setProducts(Array.isArray(productListData) ? productListData : []);

			if (!canManage && productData && !isProductActive(productData.status)) {
				setProduct(null);
				setNotice("Không tìm thấy sản phẩm phù hợp.");
				return;
			}

			setProduct(productData ?? null);
		} catch (error) {
			if (error?.status === 401 && isAuthenticated) {
				logout();
				navigate("/login", {
					replace: true,
					state: { from: { pathname: `/catalog/${productId}` } },
				});
				return;
			}

			setNotice(error.message);
		} finally {
			setLoading(false);
		}
	}

	useEffect(() => {
		// eslint-disable-next-line react-hooks/set-state-in-effect
		void loadProductDetail();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [productId]);

	useEffect(() => {
		async function loadWishlistState() {
			if (!isAuthenticated) {
				setIsWishlisted(false);
				return;
			}

			try {
				const result = await checkWishlistProduct(productId);
				setIsWishlisted(Boolean(result?.wishlisted));
			} catch {
				setIsWishlisted(false);
			}
		}

		void loadWishlistState();
	}, [isAuthenticated, productId]);

	async function handleWishlistAction() {
		if (!product) {
			return;
		}

		if (!isAuthenticated) {
			navigate("/login", {
				state: { from: { pathname: `/catalog/${productId}` } },
			});
			return;
		}

		if (isWishlisted) {
			navigate("/wishlist");
			return;
		}

		setNotice("");

		try {
			await addWishlistProduct(product.id);
			setIsWishlisted(true);
			setNotice(`${product.name} đã được thêm vào danh sách yêu thích.`);
		} catch (error) {
			if (error?.status === 401 && isAuthenticated) {
				logout();
				navigate("/login", {
					replace: true,
					state: { from: { pathname: `/catalog/${productId}` } },
				});
				return;
			}
			setNotice(error?.status === 403 ? "Tính năng yêu thích dành cho tài khoản khách hàng." : error.message);
		}
	}

	async function handleAddToCart() {
		const currentAvailability = getProductAvailability(product);

		if (!product || !currentAvailability.canPurchase) {
			return;
		}

		if (!isAuthenticated) {
			navigate("/login", {
				state: { from: { pathname: `/catalog/${productId}` } },
			});
			return;
		}

		setAddingToCart(true);
		setNotice("");

		try {
			await addCartItem(Number(product.id), 1);
			window.dispatchEvent(new Event("cart-updated"));
			setNotice(`${product.name} đã được thêm vào giỏ hàng.`);
		} catch (error) {
			if (error?.status === 401 && isAuthenticated) {
				logout();
				navigate("/login", {
					replace: true,
					state: { from: { pathname: `/catalog/${productId}` } },
				});
				return;
			}
			setNotice(error.message || "Không thể thêm sản phẩm vào giỏ hàng.");
		} finally {
			setAddingToCart(false);
		}
	}

	function openSimilarProduct(nextProduct) {
		navigate(`/catalog/${nextProduct.id}`, { state: { product: nextProduct } });
		window.scrollTo({ top: 0, behavior: "smooth" });
	}

	const categoryName = product
		? categories.find((category) => String(category.id) === String(product.categoryId))?.name ||
			product.categoryName ||
			"-"
		: "-";

	const productImages = resolveProductImages(product?.images);
	const imagePreview = productImages.includes(activeImageSource) ? activeImageSource : productImages[0];
	const activeImageIndex = Math.max(productImages.indexOf(imagePreview), 0);
	const availability = getProductAvailability(product);
	const categoryValue = product?.categoryId ? (
		<Link className="text-green-700 hover:underline" to={`/catalog/category/${product.categoryId}`}>
			{categoryName}
		</Link>
	) : (
		categoryName
	);
	const detailParagraphs = createDetailParagraphs(product, categoryName);
	const detailMarkdownContent = createDetailMarkdownContent(product, categoryName, imagePreview);
	const plantDetails = [
		{ label: "Hướng dẫn chăm sóc", value: product?.careGuide },
		{ label: "Ánh sáng", value: product?.sunlightLevel },
		{ label: "Tần suất tưới", value: product?.wateringFrequency },
		{ label: "Độ khó chăm", value: product?.difficulty },
		{ label: "Phong thủy", value: product?.fengShuiElement },
	].filter((item) => String(item.value ?? "").trim().length > 0);
	const similarProducts = useMemo(() => pickRandomSimilarProducts(products, product), [products, product]);
	const canAddToCart = availability.canPurchase && !addingToCart;

	return (
		<main className="min-h-screen bg-linear-to-br from-green-100 via-white to-green-200/80">
			<Container className="max-w-384 py-10">
				<div className="mb-6 flex items-center justify-between gap-4">
					<div className="space-y-1">
						<p className="text-sm uppercase tracking-[0.28em] text-green-700">Catalog khách hàng</p>
						<h1 className="text-4xl font-semibold tracking-tight text-green-950">Chi tiết sản phẩm</h1>
					</div>
					<div className="flex flex-wrap items-center gap-3">
						{canManage && product ? (
							<Button className="rounded-full" onClick={() => navigate("/manage", { state: { editProduct: product } })}>
								Sửa sản phẩm
							</Button>
						) : null}
						<Link to="/policy">
							<Button variant="secondary" className="rounded-full">
								Policy
							</Button>
						</Link>
						<Link to="/catalog">
							<Button variant="secondary" className="rounded-full">
								Quay lại catalog
							</Button>
						</Link>
					</div>
				</div>

				{notice ? (
					<div className="mb-6 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900">
						{notice}
					</div>
				) : null}

				{loading ? <Card className="p-6 text-sm text-green-800">Đang tải chi tiết sản phẩm...</Card> : null}

				{product ? (
					<>
						<div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
							<Card className="space-y-5 border-green-200 bg-white/90 p-5 shadow-xl shadow-green-900/5">
								<div className="flex items-start justify-between gap-3">
									<div className="space-y-1">
										<p className="text-sm font-semibold text-green-700">{categoryName}</p>
										<h2 className="text-3xl font-semibold text-green-950">{product.name}</h2>
									</div>
									<Badge status={availability.badgeStatus} className={availability.badgeClassName}>
										{availability.label}
									</Badge>
								</div>

								<div className="relative">
									<ProductImageFrame
										src={imagePreview}
										alt={product.name}
										className="h-96 rounded-3xl bg-green-50 p-4"
										imageClassName="max-h-full max-w-full rounded-2xl object-contain"
									/>
									<button
										type="button"
										className={`absolute right-4 top-4 flex h-12 w-12 items-center justify-center rounded-full border bg-white/95 text-xl shadow-lg transition hover:-translate-y-0.5 ${
											isWishlisted
												? "border-red-200 text-red-600 hover:bg-red-50"
												: "border-green-100 text-green-700 hover:bg-green-50"
										}`}
										disabled={availability.state === "inactive"}
										onClick={() => void handleWishlistAction()}
										aria-label={isWishlisted ? "Đến danh sách yêu thích" : "Thêm vào yêu thích"}
										title={isWishlisted ? "Đến danh sách yêu thích" : "Thêm vào yêu thích"}
									>
										{isWishlisted ? <FaHeart /> : <FaRegHeart />}
									</button>
								</div>

								<div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-green-50 px-4 py-3 text-sm text-green-800">
									<span>
										{productImages.length ? `Ảnh ${activeImageIndex + 1} / ${productImages.length}` : "Sản phẩm chưa có ảnh riêng."}
									</span>
									<div className="flex flex-wrap items-center gap-2">
										{isWishlisted ? (
											<button
												type="button"
												className="rounded-full bg-red-50 px-3 py-1 text-xs font-semibold text-red-700 transition hover:bg-red-100"
												onClick={() => navigate("/wishlist")}
											>
												Đã lưu trong danh sách yêu thích
											</button>
										) : null}
										<span className="font-medium text-green-950">{availability.helper}</span>
									</div>
								</div>

								{productImages.length > 1 ? (
									<div className="grid grid-cols-4 gap-3 sm:grid-cols-5">
										{productImages.map((imageSource, index) => (
											<button
												key={`${imageSource}-${index}`}
												type="button"
												className={`rounded-2xl border p-1 transition ${
													index === activeImageIndex
														? "border-green-600 bg-emerald-50"
														: "border-green-100 bg-white hover:border-green-500"
												}`}
												onClick={() => setActiveImageSource(imageSource)}
											>
												<ProductImageFrame
													src={imageSource}
													alt={`${product.name} ${index + 1}`}
													className="h-16 rounded-xl"
													fallbackLabel="Ảnh lỗi"
												/>
											</button>
										))}
									</div>
								) : null}

								<div className="grid gap-3 sm:grid-cols-2">
									<InfoBox label="Danh mục" value={categoryValue} />
									<InfoBox label="Giá" value={formatCurrency(product.price)} />
									<InfoBox label="Tồn kho" value={`${product.stock ?? 0} - ${availability.label}`} />
									<InfoBox label="Mã SKU" value={product.sku || "-"} />
								</div>
							</Card>

							<div className="space-y-6">
								<Card className="space-y-5 border-green-200 bg-white/90 p-6 shadow-xl shadow-green-900/5">
									<SectionTitle eyebrow="Thông tin mua hàng" title="Sẵn sàng thêm vào không gian của bạn" />

									<div className="rounded-3xl bg-green-950 p-5 text-white">
										<div className="flex flex-wrap items-end justify-between gap-4">
											<div>
												<p className="text-sm text-green-100">Giá bán</p>
												<p className="mt-1 text-4xl font-semibold">{formatCurrency(product.price)}</p>
											</div>
											<Badge status={availability.badgeStatus} className="bg-white/15 text-white">
												{availability.label}
											</Badge>
										</div>
										<p className="mt-4 text-sm leading-6 text-green-100">{availability.helper}</p>
									</div>

									<div className="grid gap-3 sm:grid-cols-2">
										<Button
											className="h-12 gap-2 rounded-full"
											disabled={!canAddToCart}
											onClick={() => void handleAddToCart()}
										>
											<FaShoppingCart />
											{addingToCart ? "Đang thêm..." : "Thêm vào giỏ"}
										</Button>
										<Button
											variant="secondary"
											className="h-12 gap-2 rounded-full border-green-300 text-green-800 hover:bg-green-50"
											onClick={() => void handleWishlistAction()}
											disabled={availability.state === "inactive"}
										>
											{isWishlisted ? <FaHeart className="text-red-600" /> : <FaRegHeart />}
											{isWishlisted ? "Đến danh sách yêu thích" : "Lưu yêu thích"}
										</Button>
									</div>

									<div className="grid gap-3 sm:grid-cols-3">
										<PolicyItem
											icon={<FaTruck />}
											title="Giao hàng"
											description="Đóng gói cây cẩn thận, ưu tiên giữ dáng cây và hạn chế va đập khi vận chuyển."
										/>
										<PolicyItem
											icon={<FaShieldAlt />}
											title="Cam kết"
											description="Sản phẩm được kiểm tra tình trạng trước khi bàn giao cho khách hàng."
										/>
										<PolicyItem
											icon={<FaUndo />}
											title="Hỗ trợ"
											description="Nếu sản phẩm gặp vấn đề, bạn có thể liên hệ cửa hàng để được hướng dẫn xử lý."
										/>
									</div>
								</Card>
							</div>
						</div>

						<div className="mt-8 grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
							<Card className="space-y-5 border-green-200 bg-white/90 p-6 shadow-lg shadow-green-900/5">
								<div className="space-y-5 rounded-3xl border border-green-100 bg-green-50/70 p-5 text-sm leading-7 text-green-950">
									{detailParagraphs.map((paragraph, index) => (
										<p key={index}>{paragraph}</p>
									))}
								</div>

								{plantDetails.length ? (
									<div className="space-y-4">
										<SectionTitle eyebrow="Thông tin cây" title="Dữ liệu chăm sóc và sinh trưởng" />
										<div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
											{plantDetails.map((item) => (
												<InfoBox key={item.label} label={item.label} value={item.value || "Chưa cập nhật"} />
											))}
										</div>
									</div>
								) : null}

								<div className="space-y-4">
									<SectionTitle title="Thông tin chi tiết của sản phẩm" />
									<MarkdownContent
										content={
											product?.content?.trim()
												? `${detailMarkdownContent}\n\n---\n\n${product.content.trim()}`
												: detailMarkdownContent
										}
									/>
								</div>
							</Card>

							<Card className="space-y-4 border-green-200 bg-white/90 p-6 shadow-lg shadow-green-900/5">
								<SectionTitle eyebrow="Gợi ý chăm sóc" title="Nhắc nhanh trước khi mua" />
								<div className="space-y-3 text-sm leading-6 text-green-800">
									<div className="flex gap-3 rounded-2xl bg-green-50 p-4">
										<FaLeaf className="mt-1 shrink-0 text-green-700" />
										<p>Đặt cây ở nơi phù hợp với điều kiện ánh sáng của từng loại cây.</p>
									</div>
									<div className="flex gap-3 rounded-2xl bg-green-50 p-4">
										<FaLeaf className="mt-1 shrink-0 text-green-700" />
										<p>Kiểm tra độ ẩm đất trước khi tưới để tránh úng rễ.</p>
									</div>
									<div className="flex gap-3 rounded-2xl bg-green-50 p-4">
										<FaLeaf className="mt-1 shrink-0 text-green-700" />
										<p>Liên hệ cửa hàng nếu bạn cần tư vấn vị trí đặt cây hoặc cách chăm sóc.</p>
									</div>
								</div>
							</Card>
						</div>

						{similarProducts.length ? (
							<Card className="mt-8 space-y-5 border-green-200 bg-white/90 p-6 shadow-lg shadow-green-900/5">
								<SectionTitle eyebrow="Sản phẩm liên quan" title="Có thể bạn cũng sẽ thích" />
								<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
									{similarProducts.map((item) => (
										<SimilarProductCard key={item.id} product={item} onOpen={openSimilarProduct} />
									))}
								</div>
							</Card>
						) : null}

						<Card className="mt-8 space-y-5 border-green-200 bg-white/90 p-6 shadow-lg shadow-green-900/5">
							<SectionTitle eyebrow="Đánh giá sản phẩm" title="Trải nghiệm từ khách hàng" />
							<ReviewSection productId={productId} />
						</Card>
					</>
				) : !loading ? (
					<Card className="p-6 text-sm text-green-800">Không tìm thấy sản phẩm phù hợp.</Card>
				) : null}
			</Container>
		</main>
	);
}
