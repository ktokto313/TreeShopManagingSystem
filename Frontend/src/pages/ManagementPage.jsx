import { useContext, useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Container } from "../components/global/Container";
import { Badge } from "../components/ui/Badge";
import { Button } from "../components/ui/Button";
import { IoReload } from "react-icons/io5";
import { FaPlus } from "react-icons/fa6";
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
import ReviewSection from "../features/review/components/ReviewSection";
import {
	createProduct,
	deactivateProduct,
	getProducts,
	updateProduct,
	uploadProductImages,
} from "../features/products/productApi";
import { sortCategories } from "../utils/categorySort";
import { AuthContext } from "../context/AuthContext";
import { cn } from "../utils/cn";
import { FaCheck } from "react-icons/fa";
import { IoMdRemoveCircleOutline } from "react-icons/io";

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
	content: "",
	careGuide: "",
	sunlightLevel: "",
	wateringFrequency: "",
	difficulty: "",
	fengShuiElement: "",
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
const MAX_DESCRIPTION_LENGTH = 1000;
const MAX_SHORT_TEXT_LENGTH = 255;
const MAX_PRODUCT_CONTENT_LENGTH = 10000;
function hasErrors(errors) {
	return Object.keys(errors).length > 0;
}

function isBlank(value) {
	return String(value ?? "").trim() === "";
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
	const content = String(values.content ?? "").trim();
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

	if (content.length > MAX_PRODUCT_CONTENT_LENGTH) {
		errors.content = `Nội dung markdown tối đa ${MAX_PRODUCT_CONTENT_LENGTH} ký tự.`;
	}

	const careGuide = String(values.careGuide ?? "").trim();
	const sunlightLevel = String(values.sunlightLevel ?? "").trim();
	const wateringFrequency = String(values.wateringFrequency ?? "").trim();
	const difficulty = String(values.difficulty ?? "").trim();
	const fengShuiElement = String(values.fengShuiElement ?? "").trim();

	if (careGuide.length > MAX_DESCRIPTION_LENGTH) {
		errors.careGuide = "Hướng dẫn chăm sóc tối đa 1000 ký tự.";
	}

	if (sunlightLevel.length > MAX_SHORT_TEXT_LENGTH) {
		errors.sunlightLevel = "Ánh sáng tối đa 255 ký tự.";
	}

	if (wateringFrequency.length > MAX_SHORT_TEXT_LENGTH) {
		errors.wateringFrequency = "Tần suất tưới tối đa 255 ký tự.";
	}

	if (difficulty.length > MAX_SHORT_TEXT_LENGTH) {
		errors.difficulty = "Độ khó chăm tối đa 255 ký tự.";
	}

	if (fengShuiElement.length > MAX_SHORT_TEXT_LENGTH) {
		errors.fengShuiElement = "Phong thủy tối đa 255 ký tự.";
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
			content: product.content ?? "",
			careGuide: product.careGuide ?? "",
			sunlightLevel: product.sunlightLevel ?? "",
			wateringFrequency: product.wateringFrequency ?? "",
			difficulty: product.difficulty ?? "",
			fengShuiElement: product.fengShuiElement ?? "",
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
				content: productForm.content.trim(),
				careGuide: productForm.careGuide.trim(),
				sunlightLevel: productForm.sunlightLevel.trim(),
				wateringFrequency: productForm.wateringFrequency.trim(),
				difficulty: productForm.difficulty.trim(),
				fengShuiElement: productForm.fengShuiElement.trim(),
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
		<main className="bg-white">
			<Container className="py-10">
				<div className="mb-6 flex flex-wrap items-start justify-between gap-4">
					<div className="space-y-2">
						<Badge status="active" className="bg-emerald-100 text-emerald-700">
							Khu vực quản lý
						</Badge>
						<h1 className="text-3xl font-semibold text-green-800">
							Quản lý danh mục và sản phẩm
						</h1>
						<p className="max-w-3xl text-sm text-green-800"></p>
					</div>

					<div className="flex flex-wrap items-center gap-3">
						<Button variant="secondary" className="hover:bg-gray-300 flex items-center gap-1" onClick={() => void loadCategories()}>
							<IoReload></IoReload>
							Tải lại danh mục
						</Button>
						<Button variant="secondary" className="hover:bg-gray-300 flex items-center gap-1" onClick={() => void loadProducts()}>
							<IoReload></IoReload>
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
						className={cn("hover:bg-blue-300", activeTab !== "categories" ? "bg-blue-200" : "text-white bg-blue-400")}
						onClick={() => setActiveTab("categories")}
					>
						Danh mục
					</Button>
					<Button
						className={cn("hover:bg-blue-300", activeTab !== "categories" ? "text-white bg-blue-400" : "bg-blue-200")}
						onClick={() => setActiveTab("products")}
					>
						Sản phẩm
					</Button>
				</div>

				<section className={activeTab === "categories" ? "block" : "hidden"}>
					<div className="space-y-6">
						<div className="">
							<div className="flex flex-wrap items-center justify-between gap-4 pb-4">
								<div className="space-y-1">
									<h2 className="font-semibold text-xl text-green-800">Bảng danh mục</h2>
								</div>
								<div className="flex flex-wrap items-center gap-3">
									<span className="text-base bg-emerald-200 text-emerald-600 px-3 border-emerald-300 py-1.5 border-2 rounded-2xl">{categories.length} hàng</span>
									<Button onClick={openCreateCategoryModal}>
										Thêm danh mục
									</Button>
								</div>
							</div>
							<CategoryTable
								categories={categories}
								onEdit={editCategory}
								onDelete={removeCategory}
							/>
						</div>
					</div>
				</section>

				<section className={activeTab === "products" ? "block" : "hidden"}>
					<div className="grid gap-6 lg:grid-cols-[420px_minmax(0,1fr)] lg:items-start">
						<div className="space-y-5 self-start lg:sticky lg:top-6">
							<div className="flex flex-wrap items-center justify-between gap-4">
								<div className="space-y-1">
									<h2 className="text-xl font-semibold text-green-800">
										Bộ lọc sản phẩm
									</h2>
								</div>
								<span className="text-base bg-emerald-200 text-emerald-600 px-3 border-emerald-300 py-1 border-2 rounded-2xl">
									{filteredProductsWithCategoryName.length} / {products.length}{" "}
									hàng
								</span>
							</div>

							<div className="flex flex-wrap gap-2">
								<Button className="flex gap-1" onClick={openCreateProductModal}>
									<FaPlus></FaPlus>
									Thêm sản phẩm
									</Button>
								<Button variant="secondary" className="hover:bg-gray-300 flex items-center gap-1" onClick={() => void loadProducts()}>
									<IoReload></IoReload>
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
									className="h-10 w-full rounded-md border border-green-500 bg-white px-3 text-sm text-green-800 outline-none"
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
									className="h-10 w-full rounded-md border border-green-500 bg-white px-3 text-sm text-green-800 outline-none"
								>
									<option value="">Tất cả tồn kho</option>
									<option value="out-of-stock">Hết hàng / đã ẩn</option>
								</select>
								<div className="flex gap-2">
									<Button className="flex gap-1 hover:bg-green-400" type="submit">
										<FaCheck className="text-sm"/>
										Áp dụng
										</Button>
									<Button
										type="button"
										variant="secondary"
										className="hover:bg-gray-300 flex gap-1 items-center"
										onClick={clearFilters}
									>
										<IoMdRemoveCircleOutline className="-mb-0.5"></IoMdRemoveCircleOutline>
										Xóa lọc
									</Button>
								</div>
							</form>
						</div>

						<div className="space-y-5 min-w-0">
							<div className="flex items-center justify-between gap-4">
								<div className="space-y-1">
									<h2 className="text-xl font-semibold text-green-800">
										Bảng sản phẩm
									</h2>
								</div>
								<span className="text-base bg-emerald-200 text-emerald-600 px-3 border-emerald-300 py-1 border-2 rounded-2xl">
									{products.length} hàng
								</span>
							</div>

							<ProductTable
								products={filteredProductsWithCategoryName}
								onEdit={openEditProductModal}
								onDeactivate={deactivateSelectedProduct}
							/>
						</div>
					</div>

				</section>
			</Container>

			<Modal
				isOpen={isCategoryModalOpen}
				onClose={() => {
					closeCategoryModal();
				}}
				title={categoryForm.id ? "Sửa danh mục" : "Tạo danh mục"}
			>
				<div className="p-6 pt-0">
					<div className="flex items-start justify-between gap-4 mb-4">
						<div className="space-y-1">
							<h2 className="text-2xl font-semibold text-green-700">
								{categoryForm.id ? "Sửa danh mục" : "Tạo danh mục"}
							</h2>
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

					<div className="flex flex-wrap">
						<Button variant="secondary" className={"grow bg-red-500 hover:bg-red-400 text-white"} onClick={resetProductForm}>
							Xóa
						</Button>
						<Button
							variant="secondary"
							className={"grow border-gray-400 text-black border hover:bg-gray-300/40"}
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
				isOpen={isProductModalOpen}
				className="max-w-6xl min-w-[min(1120px,94vw)]"
				onClose={() => {
					closeProductModal();
				}}
				title={productForm.id ? "Sửa sản phẩm" : "Tạo sản phẩm"}
			>
				<div className="px-6">
					<div className="flex items-center justify-between gap-4 mb-5">
						<div className="space-y-1">
							<h2 className="text-2xl font-semibold text-green-700">
								{productForm.id ? "Sửa sản phẩm" : "Tạo sản phẩm"}
							</h2>
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
					>
						<Button type="button" variant="secondary" className="w-full bg-red-500 hover:bg-red-400 text-white" onClick={resetProductForm}>
							Xóa
						</Button>
					</ProductForm>

					{productForm.id && (
						<ReviewSection productId={productForm.id} canManage={true} />
					)}
				</div>
			</Modal>
		</main>
	);
}
