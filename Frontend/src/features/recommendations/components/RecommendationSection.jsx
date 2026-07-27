import { useContext, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Card } from "../../../components/ui/Card";
import { AuthContext } from "../../../context/AuthContext";
import { requestJson } from "../../../utils/api";
import { loadPublicJson } from "../../catalog/utils/catalogApi";
import { formatCurrency } from "../../catalog/utils/catalogUtils";
import ProductImageFrame from "../../products/components/ProductImageFrame";
import { getProductAvailability } from "../../products/utils/productAvailability";
import { resolveProductImages } from "../../products/utils/productImageResolver";

function normalizeText(value) {
	return String(value ?? "")
		.trim()
		.toLowerCase()
		.replace(/[_-]+/g, " ")
		.replace(/\s+/g, " ");
}

function tokenize(value) {
	return normalizeText(value)
		.split(" ")
		.map((token) => token.trim())
		.filter(Boolean);
}

function attachCategoryName(product, categoryMap) {
	return {
		...product,
		categoryName: categoryMap.get(String(product.categoryId)) || "",
	};
}

function collectPurchaseSignals(orders, products) {
	const productById = new Map(products.map((product) => [String(product.id), product]));

	const purchasedProductIds = new Set();
	const purchasedCategories = new Map();
	const purchasedDifficulties = new Set();
	const purchasedFengShui = new Set();
	const purchasedTokens = new Set();
	const purchasePrices = [];

	const sortedOrders = [...(Array.isArray(orders) ? orders : [])].sort(
		(left, right) => new Date(right?.createdAt ?? 0).getTime() - new Date(left?.createdAt ?? 0).getTime(),
	);

	for (const order of sortedOrders) {
		const details = Array.isArray(order?.orderDetailList) ? order.orderDetailList : [];
		for (const detail of details) {
			const productId = String(detail?.productId);
			if (!productId || productId === 'null' || productId === 'undefined') {
				continue;
			}

			const matchedProduct = productById.get(productId);
			if (!matchedProduct) {
				continue;
			}

			purchasedProductIds.add(String(matchedProduct.id));

			const quantity = Math.max(1, Number(detail?.quantity ?? 1));
			const categoryKey = String(matchedProduct.categoryId ?? "");
			purchasedCategories.set(categoryKey, (purchasedCategories.get(categoryKey) ?? 0) + quantity);

			const difficulty = normalizeText(matchedProduct.difficulty);
			if (difficulty) {
				purchasedDifficulties.add(difficulty);
			}

			const fengShuiElement = normalizeText(matchedProduct.fengShuiElement);
			if (fengShuiElement) {
				purchasedFengShui.add(fengShuiElement);
			}

			const price = Number(matchedProduct.price ?? 0);
			if (!Number.isNaN(price)) {
				purchasePrices.push(price);
			}

			tokenize(
				[
					matchedProduct.name,
					matchedProduct.description,
					matchedProduct.content,
					matchedProduct.careGuide,
					matchedProduct.difficulty,
					matchedProduct.fengShuiElement,
				].join(" "),
			).forEach((token) => purchasedTokens.add(token));
		}
	}

	return {
		hasHistory: purchasedProductIds.size > 0,
		purchasedProductIds,
		purchasedCategories,
		purchasedDifficulties,
		purchasedFengShui,
		purchasedTokens,
		averagePurchasePrice:
			purchasePrices.length > 0
				? purchasePrices.reduce((sum, price) => sum + price, 0) / purchasePrices.length
				: null,
	};
}

function buildPurchaseRecommendations(products, categoryMap, signals) {
	return products
		.map((product) => {
			if (signals.purchasedProductIds.has(String(product.id))) {
				return null;
			}

			const stock = Number(product.stock ?? 0);
			if (stock <= 0) {
				return null;
			}

			const categoryName = categoryMap.get(String(product.categoryId)) || "";
			const reasons = [];
			let score = 0;

			const categoryWeight = signals.purchasedCategories.get(String(product.categoryId ?? "")) ?? 0;
			if (categoryWeight > 0) {
				score += 45 + Math.min(categoryWeight * 4, 20);
				reasons.push("Cùng danh mục với sản phẩm bạn đã mua");
			}

			const productDifficulty = normalizeText(product.difficulty);
			if (productDifficulty && signals.purchasedDifficulties.has(productDifficulty)) {
				score += 12;
				reasons.push("Độ khó chăm tương tự");
			}

			const productFengShui = normalizeText(product.fengShuiElement);
			if (productFengShui && signals.purchasedFengShui.has(productFengShui)) {
				score += 10;
				reasons.push("Phong thủy tương tự");
			}

			const sharedTokenCount = tokenize(
				[
					product.name,
					product.description,
					product.content,
					product.careGuide,
					product.difficulty,
					product.fengShuiElement,
					categoryName,
				].join(" "),
			).filter((token) => signals.purchasedTokens.has(token)).length;

			if (sharedTokenCount > 0) {
				score += Math.min(sharedTokenCount * 2, 12);
				reasons.push("Nội dung gần với sản phẩm đã mua");
			}

			if (signals.averagePurchasePrice !== null) {
				const price = Number(product.price ?? 0);
				if (!Number.isNaN(price) && signals.averagePurchasePrice > 0) {
					const ratio = Math.abs(price - signals.averagePurchasePrice) / signals.averagePurchasePrice;
					score += Math.max(0, 8 - ratio * 8);
					reasons.push("Mức giá gần với đơn hàng trước");
				}
			}

			score += Math.min(stock, 20) * 0.4;
			if (!reasons.length) {
				reasons.push("Gợi ý dựa trên lịch sử mua hàng");
			}

			return {
				...product,
				categoryName,
				matchScore: score,
				matchReasons: reasons,
			};
		})
		.filter(Boolean)
		.sort(
			(left, right) =>
				(right?.matchScore ?? 0) - (left?.matchScore ?? 0) ||
				Number(right?.price ?? 0) - Number(left?.price ?? 0) ||
				String(left?.name ?? "").localeCompare(String(right?.name ?? "")),
		);
}

function buildFallbackRecommendations(products, categoryMap) {
	return [...products]
		.filter((product) => Number(product.stock ?? 0) > 0)
		.sort(
			(left, right) =>
				Number(right?.id ?? 0) - Number(left?.id ?? 0) ||
				Number(right?.stock ?? 0) - Number(left?.stock ?? 0),
		)
		.slice(0, 6)
		.map((product, index) => ({
			...attachCategoryName(product, categoryMap),
			matchScore: Math.max(100 - index * 5, 50),
			matchReasons: ["Sản phẩm đang hoạt động và còn hàng"],
		}));
}

function RecommendationCard({ product }) {
	const images = resolveProductImages(product.images);
	const availability = getProductAvailability(product);
	const reasons = Array.isArray(product.matchReasons) ? product.matchReasons : [];

	return (
		<Link
			to={`/catalog/${product.id}`}
			className="group overflow-hidden rounded-3xl border border-green-200 bg-white/90 shadow-sm transition hover:-translate-y-1 hover:border-green-400 hover:shadow-xl"
		>
			<ProductImageFrame
				src={images[0]}
				alt={product.name}
				className="h-44 bg-green-50"
				fallbackLabel="Chưa có ảnh"
			/>
			<div className="space-y-3 p-4">
				<div className="space-y-1">
					<h3 className="font-semibold text-green-950 group-hover:text-green-700">{product.name}</h3>
					<p className="text-sm text-green-700">{product.categoryName || "Sản phẩm phù hợp"}</p>
				</div>

				<div className="flex items-center justify-between gap-3">
					<span className="font-semibold text-green-700">{formatCurrency(product.price)}</span>
					<span className="rounded-full bg-green-50 px-3 py-1 text-xs font-semibold text-green-700">
						{availability.label}
					</span>
				</div>

				{reasons.length ? (
					<ul className="space-y-1 text-sm leading-6 text-green-800">
						{reasons.slice(0, 2).map((reason) => (
							<li key={reason}>• {reason}</li>
						))}
					</ul>
				) : null}
			</div>
		</Link>
	);
}

export default function RecommendationSection() {
	const { isAuthenticated } = useContext(AuthContext);
	const [results, setResults] = useState([]);
	const [loading, setLoading] = useState(false);

	useEffect(() => {
		let cancelled = false;

		if (!isAuthenticated) {
			setResults([]);
			setLoading(false);
			return () => {
				cancelled = true;
			};
		}

		async function loadRecommendations() {
			setLoading(true);

			try {
				const [categoryData, productData] = await Promise.all([
					loadPublicJson("/api/categories"),
					loadPublicJson("/api/products?status=true"),
				]);

				if (cancelled) {
					return;
				}

				const categories = Array.isArray(categoryData) ? categoryData : [];
				const products = Array.isArray(productData) ? productData : [];
				const categoryMap = new Map(categories.map((category) => [String(category.id), category.name]));
				const activeProducts = products.filter((product) => Number(product.stock ?? 0) > 0 && product.status !== false);

				let orders = [];
				if (isAuthenticated) {
					try {
						const orderData = await requestJson("/api/orders");
						orders = Array.isArray(orderData) ? orderData : [];
					} catch (error) {
						if (error?.status !== 401) {
							throw error;
						}
					}
				}

				const signals = collectPurchaseSignals(orders, activeProducts);
				const nextResults = signals.hasHistory
					? buildPurchaseRecommendations(activeProducts, categoryMap, signals).slice(0, 6)
					: buildFallbackRecommendations(activeProducts, categoryMap);

				setResults(nextResults);

			} catch {
				if (!cancelled) {
					setResults([]);
				}
			} finally {
				if (!cancelled) {
					setLoading(false);
				}
			}
		}

		void loadRecommendations();

		return () => {
			cancelled = true;
		};
	}, [isAuthenticated]);

	if (!isAuthenticated) {
		return null;
	}

	return (
		<section>
			<Card className="border-green-200 bg-white/90 p-6 shadow-lg shadow-green-900/5">
				<div className="mb-6 space-y-2">
					<p className="text-xs font-semibold uppercase tracking-[0.3em] text-green-700">
						Gợi ý mua hàng
					</p>
					<h2 className="text-3xl font-semibold tracking-tight text-green-950">
						Gợi ý cây phù hợp từ lịch sử mua hàng
					</h2>
				</div>

				<div className="space-y-4">
					<div className="flex flex-wrap items-center justify-between gap-3">
						<div>
							<h3 className="text-lg font-semibold text-green-950">Kết quả đề xuất</h3>
						</div>
						{results.length ? (
							<span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
								{results.length} kết quả
							</span>
						) : null}
					</div>

					{loading ? (
						<div className="rounded-3xl border border-dashed border-green-200 bg-white/80 p-8 text-sm text-green-800">
							Đang tải gợi ý...
						</div>
					) : results.length ? (
						<div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
							{results.map((product) => (
								<RecommendationCard key={product.id} product={product} />
							))}
						</div>
					) : (
						<div className="rounded-3xl border border-dashed border-green-200 bg-white/80 p-8 text-sm text-green-800">
							Chưa có kết quả hiển thị.
						</div>
					)}
				</div>
			</Card>
		</section>
	);
}


