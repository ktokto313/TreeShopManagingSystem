import { Input } from "../../../components/ui/Input";
import { Button } from "../../../components/ui/Button";
import { PageBar } from "../../../components/ui/PageBar";
import { IoSearchSharp } from "react-icons/io5";
import { IoShieldCheckmark } from "react-icons/io5";
import PolicyCard from "./PolicyCard";
import { Form } from "./../../../components/ui/Form";
import LoadingScreen from "../../../pages/LoadingScreen";
import { useContext } from "react";
import { AuthContext } from "../../../context/AuthContext";
import { FaPlus } from "react-icons/fa";
import { Link } from "react-router-dom";
import { cn } from "../../../utils/cn";

const policyStates = [
	{ label: "Xuất bản", value: "PUBLISHED" },
	{ label: "Bản nháp", value: "DRAFT" },
	{ label: "Lưu trữ", value: "ARCHIVED" },
];

const PolicyList = ({ state }) => {
	const {
		policies,
		handleSearch,
		loading,
		filterStatus,
		setFilterStatus,
		currentPage = 1,
		totalPages = 1,
		loadPage,
	} = state;
	const { canManage } = useContext(AuthContext);

	return (
		<>
			<div className="flex items-center justify-between text-green-700 border-green-500 border-b-3 pb-2">
				<div className="flex items-center gap-1 sm:gap-2 lg:gap-3">
					<IoShieldCheckmark className="hidden sm:block sm:text-2xl lg:text-3xl">
						{" "}
					</IoShieldCheckmark>
					<h1 className="text-xl lg:text-3xl font-semibold">
						Danh sách các chính sách của Greenshop
					</h1>
				</div>
				{canManage && (
					<Link to="/policy/create">
						<Button className="bg-green-500 text-nowrap hover:bg-green-600 flex items-center gap-1">
							<FaPlus className="text-xs sm:text-base"/>
							<span className="text-xs sm:text-sm lg:text-base">Thêm mới</span>
						</Button>
					</Link>
				)}
			</div>

			<Form
				onSubmit={(e) => handleSearch(e)}
				className="flex flex-col sm:flex-row gap-2 w-full mt-5"
			>
				<div className="flex gap-2 grow">
					<Input
						type="text"
						className="w-full"
						name="search"
						placeholder="Tìm kiếm..."
					></Input>
					<Button type="submit">
						<IoSearchSharp />
					</Button>
				</div>
				{canManage && (
					<select
						value={filterStatus}
						onChange={(e) => setFilterStatus(e.target.value)}
						className="border-2 border-green-500 rounded p-2 text-green-700 bg-white"
					>
						<option value="">Tất cả</option>
						{policyStates.map(s => <option key={s.value} value={s.value}>
							{s.label}
						</option>)}
					</select>
				)}
			</Form>

			{canManage ? (
				<div className="flex gap-4 mt-3 mb-4.5 ms-1">
					{policyStates.map((s) => (
						<div key={s.value} className="flex gap-1 items-center">
							<div
								className={cn("w-3.5 h-3.5 -mt-0.5 sm:w-5 sm:h-5 rounded-sm", {
									"bg-green-500": s.value === "PUBLISHED",
									"bg-gray-500": s.value === "DRAFT",
									"bg-red-500": s.value === "ARCHIVED",
								})}
							></div>
							<p className="text-sm sm:text-base">{s.label}</p>
						</div>
					))}
				</div>
			) : (
				<div className="h-5" />
			)}

			<div className="w-full gap-2.5 sm:gap-4 grid grid-cols-1 lg:grid-cols-2">
				{loading ? (
					<div className="col-span-full">
						<LoadingScreen className="h-100"></LoadingScreen>
					</div>
				) : (
					policies &&
					policies.map((p) => <PolicyCard key={p.id} policy={p}></PolicyCard>)
				)}

				{!loading && policies.length <= 0 && (
					<div className="col-span-full mt-35 mx-auto">
						<h1 className="text-xl">Không có chính sách nào.</h1>
					</div>
				)}
			</div>

			{policies && policies.length > 0 && (
				<PageBar
					currentPage={currentPage}
					totalPages={totalPages}
					onPageChange={(newPage) => loadPage(newPage)}
					className="mt-6"
				/>
			)}
		</>
	);
};
export default PolicyList;
