import { useContext, useEffect, useState } from 'react'
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom'
import {Container} from '../components/global/Container'
import {Badge} from '../components/ui/Badge'
import {Button} from '../components/ui/Button'
import {Card} from '../components/ui/Card'
import { AuthContext } from '../context/AuthContext'
import { loadPublicJson } from '../features/catalog/utils/catalogApi'
import { formatCurrency } from '../features/catalog/utils/catalogUtils'
import ProductImageFrame from '../features/products/components/ProductImageFrame'
import { getProductAvailability } from '../features/products/utils/productAvailability'
import { resolveProductImages } from '../features/products/utils/productImageResolver'
import { parseVariantGroups } from '../features/products/utils/variantUtils'
import ReviewSection from '../features/products/components/Review/ReviewSection'

function summarizeDescription(value) {
	if (!value) {
		return "Chưa có mô tả.";
	}

	return String(value);
}

function InfoBox({ label, value }) {
	return (
		<div className="rounded-xl border border-[var(--border)] bg-[var(--bg)] p-4">
			<div className="text-xs uppercase tracking-[0.18em] text-[var(--accent)]">
				{label}
			</div>
			<div className="mt-2 text-sm font-medium text-[var(--text-h)]">
				{value}
			</div>
		</div>
	);
}

export default function ProductDetailPage() {
	const navigate = useNavigate();
	const location = useLocation();
	const { productId } = useParams();
	const { logout, isAuthenticated, canManage } = useContext(AuthContext);;

	const [categories, setCategories] = useState([]);
	const [product, setProduct] = useState(location.state?.product ?? null);
	const [loading, setLoading] = useState(!location.state?.product);
	const [notice, setNotice] = useState("");
	const [activeImageSource, setActiveImageSource] = useState("");

	async function loadProductDetail() {
		setLoading(true);
		setNotice("");

		try {
			const [categoryData, productData] = await Promise.all([
				loadPublicJson("/api/categories"),
				loadPublicJson(`/api/products/${productId}`),
			]);

			setCategories(Array.isArray(categoryData) ? categoryData : []);
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

	const categoryName = product
		? categories.find(
				(category) => String(category.id) === String(product.categoryId),
			)?.name ||
			product.categoryName ||
			"-"
		: "-";

	const productImages = resolveProductImages(product?.images);
	const variantGroups = parseVariantGroups(product?.variants);
	const imagePreview = productImages.includes(activeImageSource)
		? activeImageSource
		: productImages[0];
	const activeImageIndex = Math.max(productImages.indexOf(imagePreview), 0);
	const availability = getProductAvailability(product);
	const categoryValue = product?.categoryId ? (
		<Link
			className="text-[var(--accent)] hover:underline"
			to={`/catalog/category/${product.categoryId}`}
		>
			{categoryName}
		</Link>
	) : (
		categoryName
	);

	return (
		<main className="bg-[var(--social-bg)]/50">
			<Container className="py-10">
				<div className="mb-6 flex items-center justify-between gap-4">
					<div className="space-y-1">
						<p className="text-sm uppercase tracking-[0.2em] text-[var(--accent)]">
							Catalog khách hàng
						</p>
						<h1 className="text-3xl font-semibold text-[var(--text-h)]">
							Chi tiết sản phẩm
						</h1>
					</div>
					<div className="flex flex-wrap items-center gap-3">
						{canManage && product ? (
							<Button
								onClick={() =>
									navigate("/manage", { state: { editProduct: product } })
								}
							>
								Sửa sản phẩm
							</Button>
						) : null}
						<Link to="/catalog">
							<Button variant="secondary">Quay lại catalog</Button>
						</Link>
					</div>
				</div>

				{notice ? (
					<div className="mb-6 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900">
						{notice}
					</div>
				) : null}

				{loading ? (
					<Card className="p-6 text-sm text-[var(--text)]">
						Đang tải chi tiết sản phẩm...
					</Card>
				) : null}

				{product ? (
					<div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
						<Card className="space-y-4 border-[var(--border)] bg-white/95 p-5">
							<div className="flex items-start justify-between gap-3">
								<div className="space-y-1">
									<h2 className="text-2xl font-semibold text-[var(--text-h)]">
										{product.name}
									</h2>
								</div>
								<Badge
									status={availability.badgeStatus}
									className={availability.badgeClassName}
								>
									{availability.label}
								</Badge>
							</div>

							<ProductImageFrame
								src={imagePreview}
								alt={product.name}
								className="h-80 rounded-3xl p-4"
								imageClassName="max-h-full max-w-full rounded-2xl object-contain"
							/>

							<div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-[var(--social-bg)] px-4 py-3 text-sm text-[var(--text)]">
								<span>
									{productImages.length
										? `Ảnh ${activeImageIndex + 1} / ${productImages.length}`
										: "Sản phẩm chưa có ảnh riêng."}
								</span>
								<span className="font-medium text-[var(--text-h)]">
									{availability.helper}
								</span>
							</div>

							{productImages.length > 1 ? (
								<div className="grid grid-cols-4 gap-3 sm:grid-cols-5">
									{productImages.map((imageSource, index) => (
										<button
											key={`${imageSource}-${index}`}
											type="button"
											className={`rounded-2xl border p-1 transition ${
												index === activeImageIndex
													? "border-[var(--accent)] bg-emerald-50"
													: "border-[var(--border)] bg-white hover:border-[var(--accent)]"
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
								<InfoBox
									label="Tồn kho"
									value={`${product.stock ?? 0} - ${availability.label}`}
								/>
								<InfoBox
									label="Biến thể"
									value={`${variantGroups.length} nhóm`}
								/>
							</div>
						</Card>

						<div className="space-y-6">
							<Card className="space-y-4 border-[var(--border)] bg-white/95 p-5">
								<div className="space-y-2">
									<p className="text-xs uppercase tracking-[0.2em] text-[var(--accent)]">
										Mô tả & biến thể
									</p>
									<div className="space-y-4 rounded-2xl border border-[var(--border)] bg-[var(--bg)] p-4 text-sm leading-7 text-[var(--text)]">
										<p>{summarizeDescription(product.description)}</p>

										<div className="space-y-3 border-t border-[var(--border)] pt-4">
											<div className="text-xs uppercase tracking-[0.18em] text-[var(--accent)]">
												Biến thể
											</div>
											{variantGroups.length ? (
												<div className="grid gap-3">
													{variantGroups.map((group) => (
														<div
															key={group.name}
															className="rounded-xl border border-[var(--border)] bg-white px-4 py-3"
														>
															<div className="text-sm font-semibold text-[var(--text-h)]">
																{group.name}
															</div>
															<div className="mt-2 flex flex-wrap gap-2">
																{group.values.map((value) => (
																	<span
																		key={`${group.name}-${value}`}
																		className="rounded-full bg-[var(--social-bg)] px-3 py-1.5 text-xs font-medium text-[var(--text-h)]"
																	>
																		{value}
																	</span>
																))}
															</div>
														</div>
													))}
												</div>
											) : (
												<div className="rounded-xl bg-[var(--social-bg)] px-3 py-2 text-sm text-[var(--text)]">
													Chưa có biến thể nào.
												</div>
											)}
										</div>
									</div>
								</div>
							</Card>

							<Card className="space-y-4 border-[var(--border)] bg-white/95 p-5">
								<div className="space-y-2">
									<p className="text-xs uppercase tracking-[0.2em] text-[var(--accent)]">
										Mua hàng
									</p>
									<div className="rounded-2xl border border-[var(--border)] bg-[var(--social-bg)] p-4 text-sm text-[var(--text)]">
										<p className="leading-7">
											{availability.canPurchase
												? "Sản phẩm hiện có thể mua. Luồng giỏ hàng sẽ được kết nối ở bước mua hàng sau."
												: availability.helper}
										</p>
										<Button
											className="mt-4"
											disabled={!availability.canPurchase}
											onClick={() =>
												setNotice(
													`${product.name} có thể thêm vào giỏ hàng khi luồng mua hàng được bật.`,
												)
											}
										>
											Thêm vào giỏ hàng
										</Button>
									</div>
								</div>
							</Card>
						</div>
					</div>
				) : !loading ? (
					<Card className="p-6 text-sm text-[var(--text)]">
						Không tìm thấy sản phẩm phù hợp.
					</Card>
				) : null}

				<hr className="my-8 w-[98%] mx-auto"></hr>

				<ReviewSection className={"w-[75%]"} productId={productId}></ReviewSection>
			</Container>

		</main>
	);
}
