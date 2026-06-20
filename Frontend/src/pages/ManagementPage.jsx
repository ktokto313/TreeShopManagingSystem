import { useContext, useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Container } from "../components/global/Container";
import { Badge } from "../components/ui/Badge";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { Modal } from "../components/ui/Modal";
import {
	createCategory,
	deleteCategory,
	getCategories,
	updateCategory,
} from "../features/categories/categoryApi";
import CategoryForm from "../features/categories/components/CategoryForm";
import CategoryTable from "../features/categories/components/CategoryTable";
import ProductForm from "../features/products/components/ProductForm";
import ProductTable from "../features/products/components/ProductTable";
import {
	createProduct,
	deactivateProduct,
	getProducts,
	updateProduct,
	uploadProductImages,
} from "../features/products/productApi";
import { sortCategories } from "../utils/categorySort";
import { AuthContext } from "../context/AuthContext";

const emptyCategoryForm = { id: "", name: "", description: "" };
const emptyProductForm = {
	id: "",
	categoryId: "",
	name: "",
	price: "",
	stock: 0,
	status: true,
	sku: "",
	description: "",
	variants: "",
	images: [],
	imageFiles: [],
};
const emptyFilters = {
	keyword: "",
	categoryId: "",
	status: "",
	stockState: "",
};
const SKU_PATTERN = /^[A-Za-z0-9_-]+$/;
const MAX_IMAGE_FILES = 5;
const MAX_IMAGE_FILE_SIZE = 5 * 1024 * 1024;

function hasErrors(errors) {
	return Object.keys(errors).length > 0;
}

function isBlank(value) {
	return String(value ?? "").trim() === "";
}

function isJsonObject(value) {
	if (isBlank(value)) {
		return true;
	}

	try {
		const parsed = JSON.parse(value);
		return parsed && typeof parsed === "object" && !Array.isArray(parsed);
	} catch {
		return false;
	}
}

function validateCategoryForm(values) {
	const errors = {};
	const name = String(values.name ?? "").trim();
	const description = String(values.description ?? "").trim();

	if (!name) {
		errors.name = "Vui lòng nhập tên danh mục.";
	} else if (name.length > 100) {
		errors.name = "Tên danh mục tối đa 100 ký tự.";
	}

	if (description.length > 1000) {
		errors.description = "Mô tả tối đa 1000 ký tự.";
	}

	return errors;
}

function validateProductImages(files = []) {
	if (!files.length) {
		return "";
	}

	if (files.length > MAX_IMAGE_FILES) {
		return `Chỉ được tải tối đa ${MAX_IMAGE_FILES} ảnh.`;
	}

	const invalidType = files.find(
		(file) => file?.type && !file.type.startsWith("image/"),
	);
	if (invalidType) {
		return "Tệp tải lên phải là ảnh.";
	}

	const oversizedFile = files.find(
		(file) => Number(file?.size ?? 0) > MAX_IMAGE_FILE_SIZE,
	);
	if (oversizedFile) {
		return "Mỗi ảnh tối đa 5MB.";
	}

	return "";
}

function validateProductForm(values) {
	const errors = {};
	const name = String(values.name ?? "").trim();
	const sku = String(values.sku ?? "").trim();
	const description = String(values.description ?? "").trim();
	const price = values.price === "" ? null : Number(values.price);
	const stock = values.stock === "" ? null : Number(values.stock);

	if (isBlank(values.categoryId)) {
		errors.categoryId = "Vui lòng chọn danh mục.";
	}

	if (!name) {
		errors.name = "Vui lòng nhập tên sản phẩm.";
	} else if (name.length > 200) {
		errors.name = "Tên sản phẩm tối đa 200 ký tự.";
	}

	if (!sku) {
		errors.sku = "Vui lòng nhập mã SKU.";
	} else if (sku.length > 50) {
		errors.sku = "SKU tối đa 50 ký tự.";
	} else if (!SKU_PATTERN.test(sku)) {
		errors.sku = "SKU chỉ gồm chữ, số, dấu gạch ngang hoặc gạch dưới.";
	}

	if (price === null || Number.isNaN(price)) {
		errors.price = "Vui lòng nhập giá hợp lệ.";
	} else if (price <= 0) {
		errors.price = "Giá phải lớn hơn 0.";
	}

	if (stock === null || Number.isNaN(stock)) {
		errors.stock = "Vui lòng nhập tồn kho hợp lệ.";
	} else if (!Number.isInteger(stock)) {
		errors.stock = "Tồn kho phải là số nguyên.";
	} else if (stock < 0) {
		errors.stock = "Tồn kho không được âm.";
	}

	if (description.length > 1000) {
		errors.description = "Mô tả tối đa 1000 ký tự.";
	}

	if (!isJsonObject(values.variants)) {
		errors.variants = "Biến thể phải là JSON object hợp lệ.";
	}

	const imageError = validateProductImages(values.imageFiles);
	if (imageError) {
		errors.images = imageError;
	}

	return errors;
}

function parseImageList(value) {
	if (!value) {
		return [];
	}

	if (Array.isArray(value)) {
		return value;
	}

	try {
		const parsed = JSON.parse(value);
		return Array.isArray(parsed) ? parsed : [];
	} catch {
		return [String(value)];
	}
}

function toProductApiFilters(filters) {
	return {
		keyword: filters.keyword,
		categoryId: filters.categoryId,
		status: filters.status,
	};
}

function isOutOfStockProduct(product) {
	return Number(product?.stock ?? 0) <= 0 || product?.status === false;
}

export default function ManagementPage() {
	const navigate = useNavigate();
	const location = useLocation();
	const { logout } = useContext(AuthContext);
	const [categories, setCategories] = useState([]);
	const [products, setProducts] = useState([]);
	const [categoryForm, setCategoryForm] = useState(emptyCategoryForm);
	const [productForm, setProductForm] = useState(emptyProductForm);
	const [categoryErrors, setCategoryErrors] = useState({});
	const [productErrors, setProductErrors] = useState({});
	const [filters, setFilters] = useState(emptyFilters);
	const [activeTab, setActiveTab] = useState("categories");
	const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
	const [isProductModalOpen, setIsProductModalOpen] = useState(false);
	const [notice, setNotice] = useState("");

	function handleAuthError(error) {
		if (error?.status !== 401) {
			return false;
		}

		logout();
		navigate("/login", {
			replace: true,
			state: { from: { pathname: "/manage" } },
		});
		return true;
	}

	const categoryLookup = useMemo(() => {
		return new Map(
			categories.map((category) => [String(category.id), category.name]),
		);
	}, [categories]);

	const productsWithCategoryName = useMemo(() => {
		return products.map((product) => ({
			...product,
			categoryName: categoryLookup.get(String(product.categoryId)) || "",
		}));
	}, [products, categoryLookup]);

	const filteredProductsWithCategoryName = useMemo(() => {
		if (filters.stockState !== "out-of-stock") {
			return productsWithCategoryName;
		}

		return productsWithCategoryName.filter(isOutOfStockProduct);
	}, [filters.stockState, productsWithCategoryName]);

	async function loadInitialData() {
		setNotice("");

		try {
			const [categoryData, productData] = await Promise.all([
				getCategories(),
				getProducts(),
			]);
			setCategories(
				Array.isArray(categoryData) ? sortCategories(categoryData) : [],
			);
			setProducts(Array.isArray(productData) ? productData : []);
		} catch (error) {
			if (handleAuthError(error)) {
				return;
			}
			setNotice(error.message);
		}
	}

	async function loadCategories() {
		try {
			const categoryData = await getCategories();
			setCategories(
				Array.isArray(categoryData) ? sortCategories(categoryData) : [],
			);
		} catch (error) {
			if (handleAuthError(error)) {
				return;
			}
			setNotice(error.message);
		}
	}

	async function loadProducts(nextFilters = filters) {
		try {
			const productData = await getProducts(toProductApiFilters(nextFilters));
			setProducts(Array.isArray(productData) ? productData : []);
		} catch (error) {
			if (handleAuthError(error)) {
				return;
			}
			setNotice(error.message);
		}
	}

	useEffect(() => {
		// eslint-disable-next-line react-hooks/set-state-in-effect
		void loadInitialData();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	useEffect(() => {
		const productToEdit = location.state?.editProduct;

		if (!productToEdit) {
			return;
		}

		openEditProductModal(productToEdit);
	}, [location.state]);

	function resetCategoryForm() {
		setCategoryForm(emptyCategoryForm);
		setCategoryErrors({});
	}

	function resetProductForm() {
		setProductForm(emptyProductForm);
		setProductErrors({});
	}

	function updateCategoryFormField(name, value) {
		setCategoryForm((current) => ({
			...current,
			[name]: value,
		}));
		setCategoryErrors((current) => {
			const remainingErrors = { ...current };
			delete remainingErrors[name];
			return remainingErrors;
		});
	}

	function updateProductFormField(name, value) {
		setProductForm((current) => ({
			...current,
			[name]: value,
		}));
		setProductErrors((current) => {
			const nextErrors = { ...current };
			delete nextErrors[name];
			if (name === "imageFiles") {
				delete nextErrors.images;
			}
			return nextErrors;
		});
	}

	function openCreateCategoryModal() {
		resetCategoryForm();
		setActiveTab("categories");
		setIsCategoryModalOpen(true);
	}

	function openEditCategoryModal(category) {
		setActiveTab("categories");
		setCategoryErrors({});
		setCategoryForm({
			id: category.id,
			name: category.name ?? "",
			description: category.description ?? "",
		});
		setIsCategoryModalOpen(true);
	}

	function closeCategoryModal() {
		setIsCategoryModalOpen(false);
	}

	function openCreateProductModal() {
		resetProductForm();
		setActiveTab("products");
		setIsProductModalOpen(true);
	}

	function openEditProductModal(product) {
		setActiveTab("products");
		setProductErrors({});
		setProductForm({
			id: product.id,
			categoryId: product.categoryId ?? "",
			name: product.name ?? "",
			price: product.price ?? "",
			stock: product.stock ?? 0,
			status: Boolean(product.status),
			sku: product.sku ?? "",
			description: product.description ?? "",
			variants: product.variants ?? "",
			images: parseImageList(product.images),
			imageFiles: [],
		});
		setIsProductModalOpen(true);
	}

	function closeProductModal() {
		setIsProductModalOpen(false);
	}

	function editCategory(category) {
		openEditCategoryModal(category);
	}

	async function saveCategory(event) {
		event.preventDefault();
		setNotice("");

		try {
			const validationErrors = validateCategoryForm(categoryForm);
			setCategoryErrors(validationErrors);
			if (hasErrors(validationErrors)) {
				return;
			}

			const payload = {
				name: categoryForm.name.trim(),
				description: categoryForm.description.trim(),
			};

			if (categoryForm.id) {
				await updateCategory(categoryForm.id, payload);
				setNotice("Đã cập nhật danh mục.");
			} else {
				await createCategory(payload);
				setNotice("Đã tạo danh mục.");
			}

			resetCategoryForm();
			closeCategoryModal();
			await loadCategories();
			await loadProducts();
		} catch (error) {
			if (handleAuthError(error)) {
				return;
			}
			setNotice(`Lưu danh mục thất bại: ${error.message}`);
		}
	}

	async function saveProduct(event) {
		event.preventDefault();
		setNotice("");

		try {
			const validationErrors = validateProductForm(productForm);
			setProductErrors(validationErrors);
			if (hasErrors(validationErrors)) {
				return;
			}

			const uploadedImages = productForm.imageFiles?.length
				? await uploadProductImages(productForm.imageFiles)
				: productForm.images;
			const imageNames = Array.isArray(uploadedImages) ? uploadedImages : [];
			const payload = {
				categoryId:
					productForm.categoryId === "" ? null : Number(productForm.categoryId),
				name: productForm.name.trim(),
				price: productForm.price === "" ? null : Number(productForm.price),
				stock: Number(productForm.stock),
				status: productForm.status,
				sku: productForm.sku.trim(),
				description: productForm.description.trim(),
				variants: productForm.variants,
				images: imageNames.length ? JSON.stringify(imageNames) : null,
			};

			if (productForm.id) {
				await updateProduct(productForm.id, payload);
				setNotice("Đã cập nhật sản phẩm.");
			} else {
				await createProduct(payload);
				setNotice("Đã tạo sản phẩm.");
			}

			resetProductForm();
			closeProductModal();
			await loadProducts();
			await loadCategories();
		} catch (error) {
			if (handleAuthError(error)) {
				return;
			}
			setNotice(`Lưu sản phẩm thất bại: ${error.message}`);
		}
	}

	async function removeCategory(category) {
		setNotice("");

		try {
			await deleteCategory(category.id);
			if (String(categoryForm.id) === String(category.id)) {
				resetCategoryForm();
				closeCategoryModal();
			}
			setNotice("Đã xóa danh mục.");
			await loadCategories();
			await loadProducts();
		} catch (error) {
			if (handleAuthError(error)) {
				return;
			}
			setNotice(`Xóa danh mục thất bại: ${error.message}`);
		}
	}

	async function deactivateSelectedProduct(product) {
		setNotice("");

		try {
			await deactivateProduct(product.id);
			if (String(productForm.id) === String(product.id)) {
				resetProductForm();
				closeProductModal();
			}
			setNotice("Đã ẩn sản phẩm.");
			await loadProducts();
		} catch (error) {
			if (handleAuthError(error)) {
				return;
			}
			setNotice(`Ẩn sản phẩm thất bại: ${error.message}`);
		}
	}

	async function applyFilters(event) {
		event.preventDefault();
		await loadProducts(filters);
	}

	function clearFilters() {
		const nextFilters = emptyFilters;
		setFilters(nextFilters);
		void loadProducts(nextFilters);
	}

	return (
		<main className="bg-[var(--social-bg)]/70">
			<Container className="py-10">
				<div className="mb-6 flex flex-wrap items-start justify-between gap-4">
					<div className="space-y-2">
						<Badge status="active" className="bg-emerald-100 text-emerald-700">
							Khu vực quản lý
						</Badge>
						<h1 className="text-3xl font-semibold text-[var(--text-h)]">
							Quản lý danh mục và sản phẩm
						</h1>
						<p className="max-w-3xl text-sm text-[var(--text)]"></p>
					</div>

					<div className="flex flex-wrap items-center gap-3">
						<Button variant="secondary" onClick={() => void loadCategories()}>
							Tải lại danh mục
						</Button>
						<Button variant="secondary" onClick={() => void loadProducts()}>
							Tải lại sản phẩm
						</Button>
					</div>
				</div>

				{notice ? (
					<div className="mb-6 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900">
						{notice}
					</div>
				) : null}

				<div className="mb-6 flex gap-2">
					<Button
						variant={activeTab === "categories" ? "primary" : "secondary"}
						onClick={() => setActiveTab("categories")}
					>
						Danh mục
					</Button>
					<Button
						variant={activeTab === "products" ? "primary" : "secondary"}
						onClick={() => setActiveTab("products")}
					>
						Sản phẩm
					</Button>
				</div>

				<section className={activeTab === "categories" ? "block" : "hidden"}>
					<div className="space-y-6">
						<Card className="space-y-5">
							<div className="flex flex-wrap items-center justify-between gap-4">
								<div className="space-y-1">
									<h2 className="text-xl font-semibold text-[var(--text-h)]">
										Bảng danh mục
									</h2>
								</div>
								<div className="flex flex-wrap items-center gap-2">
									<Button onClick={openCreateCategoryModal}>
										Thêm danh mục
									</Button>
									<span className="text-sm text-[var(--text)]">
										{categories.length} hàng
									</span>
								</div>
							</div>
							<CategoryTable
								categories={categories}
								onEdit={editCategory}
								onDelete={removeCategory}
							/>
						</Card>
					</div>
				</section>

				<section className={activeTab === "products" ? "block" : "hidden"}>
					<div className="grid gap-6 lg:grid-cols-[420px_minmax(0,1fr)] lg:items-start">
						<Card className="space-y-5 self-start lg:sticky lg:top-6">
							<div className="flex flex-wrap items-center justify-between gap-4">
								<div className="space-y-1">
									<h2 className="text-xl font-semibold text-[var(--text-h)]">
										Bộ lọc sản phẩm
									</h2>
								</div>
								<span className="text-sm text-[var(--text)]">
									{filteredProductsWithCategoryName.length} / {products.length}{" "}
									hàng
								</span>
							</div>

							<div className="flex flex-wrap gap-2">
								<Button onClick={openCreateProductModal}>Thêm sản phẩm</Button>
								<Button variant="secondary" onClick={() => void loadProducts()}>
									Tải lại sản phẩm
								</Button>
							</div>

							<form
								onSubmit={applyFilters}
								className="space-y-3 rounded-xl border border-[var(--border)] bg-[var(--social-bg)] p-4"
							>
								<input
									value={filters.keyword}
									onChange={(event) =>
										setFilters((current) => ({
											...current,
											keyword: event.target.value,
										}))
									}
									placeholder="Tìm theo từ khóa"
									className="h-10 w-full rounded-md border border-[var(--border)] bg-white px-3 text-sm text-[var(--text-h)] outline-none"
								/>
								<select
									value={filters.categoryId}
									onChange={(event) =>
										setFilters((current) => ({
											...current,
											categoryId: event.target.value,
										}))
									}
									className="h-10 w-full rounded-md border border-[var(--border)] bg-white px-3 text-sm text-[var(--text-h)] outline-none"
								>
									<option value="">Tất cả danh mục</option>
									{categories.map((category) => (
										<option key={category.id} value={category.id}>
											{category.name}
										</option>
									))}
								</select>
								<select
									value={filters.status}
									onChange={(event) =>
										setFilters((current) => ({
											...current,
											status: event.target.value,
										}))
									}
									className="h-10 w-full rounded-md border border-[var(--border)] bg-white px-3 text-sm text-[var(--text-h)] outline-none"
								>
									<option value="">Tất cả trạng thái</option>
									<option value="true">Đang hoạt động</option>
									<option value="false">Đã ẩn</option>
								</select>
								<select
									value={filters.stockState}
									onChange={(event) =>
										setFilters((current) => ({
											...current,
											stockState: event.target.value,
										}))
									}
									className="h-10 w-full rounded-md border border-[var(--border)] bg-white px-3 text-sm text-[var(--text-h)] outline-none"
								>
									<option value="">Tất cả tồn kho</option>
									<option value="out-of-stock">Hết hàng / đã ẩn</option>
								</select>
								<div className="flex gap-2">
									<Button type="submit">Áp dụng</Button>
									<Button
										type="button"
										variant="secondary"
										onClick={clearFilters}
									>
										Xóa lọc
									</Button>
								</div>
							</form>
						</Card>

						<Card className="space-y-5 min-w-0">
							<div className="flex items-center justify-between gap-4">
								<div className="space-y-1">
									<h2 className="text-xl font-semibold text-[var(--text-h)]">
										Bảng sản phẩm
									</h2>
								</div>
								<span className="text-sm text-[var(--text)]">
									{products.length} hàng
								</span>
							</div>

							<ProductTable
								products={filteredProductsWithCategoryName}
								onEdit={openEditProductModal}
								onDeactivate={deactivateSelectedProduct}
							/>
						</Card>
					</div>
				</section>
			</Container>

			<Modal
				open={isCategoryModalOpen}
				onClose={() => {
					closeCategoryModal();
				}}
			>
				<div className="space-y-5 p-6">
					<div className="flex items-start justify-between gap-4">
						<div className="space-y-1">
							<h2 className="text-2xl font-semibold text-[var(--text-h)]">
								{categoryForm.id ? "Sửa danh mục" : "Tạo danh mục"}
							</h2>
							<p className="text-sm text-[var(--text)]">
								Cập nhật tên và mô tả danh mục trong một cửa sổ riêng gọn gàng.
							</p>
						</div>
						{categoryForm.id ? (
							<Badge
								status="active"
								className="bg-emerald-100 text-emerald-700"
							>
								ID {categoryForm.id}
							</Badge>
						) : null}
					</div>

					<CategoryForm
						values={categoryForm}
						errors={categoryErrors}
						onChange={updateCategoryFormField}
						onSubmit={saveCategory}
					/>

					<div className="flex flex-wrap gap-2">
						<Button variant="secondary" onClick={resetCategoryForm}>
							Xóa
						</Button>
						<Button
							variant="secondary"
							onClick={() => {
								resetCategoryForm();
								closeCategoryModal();
							}}
						>
							Đóng
						</Button>
					</div>
				</div>
			</Modal>

			<Modal
				open={isProductModalOpen}
				onClose={() => {
					closeProductModal();
				}}
			>
				<div className="space-y-5 p-6">
					<div className="flex items-start justify-between gap-4">
						<div className="space-y-1">
							<h2 className="text-2xl font-semibold text-[var(--text-h)]">
								{productForm.id ? "Sửa sản phẩm" : "Tạo sản phẩm"}
							</h2>
							<p className="text-sm text-[var(--text)]">
								Cập nhật sản phẩm và chi tiết của nó trong một cửa sổ riêng gọn
								gàng.
							</p>
						</div>
						{productForm.id ? (
							<Badge
								status="active"
								className="bg-emerald-100 text-emerald-700"
							>
								ID {productForm.id}
							</Badge>
						) : null}
					</div>

					<ProductForm
						values={productForm}
						errors={productErrors}
						categoryOptions={[
							{ value: "", label: "Chọn danh mục" },
							...categories.map((category) => ({
								value: String(category.id),
								label: category.name,
							})),
						]}
						onChange={updateProductFormField}
						onSubmit={saveProduct}
					/>

					<div className="flex flex-wrap gap-2">
						<Button variant="secondary" onClick={resetProductForm}>
							Xóa
						</Button>
						<Button
							variant="secondary"
							onClick={() => {
								resetProductForm();
								closeProductModal();
							}}
						>
							Đóng
						</Button>
					</div>
				</div>
			</Modal>
		</main>
	);
}
