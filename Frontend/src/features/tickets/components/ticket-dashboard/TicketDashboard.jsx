import styles from "../../assets/styles/TicketDashboard.module.css";
import { TicketCard } from "../TicketCard";
import { LuTicketCheck } from "react-icons/lu";
import { Skeleton } from "../../../../components/ui/Skeleton";
import { TicketDashboardFilterBtn } from "./TicketDashboardFilter";
import { PageBar } from "../../../../components/ui/PageBar";
import { cn } from "./../../../../utils/cn";

const TicketDashboard = ({ dashboardState, className }) => {
	const {
		fetchAllTicketsError,
		isFetchAllTicketsLoading,
		fetchedTickets,
		totalPages,
		currentPage,
		setCurrentPage,
		navigate,
		ticketSearch,
		handleFilterChange,
	} = dashboardState;

	return (
		<div className={cn(className, styles.dashboard, "bg-white flex flex-col h-full")}>
			{/* Dashboard NavBar */}
			<div
				className={cn(
					"flex items-center justify-between rounded-xl mb-5 bg-green-600 px-5 py-3",
					styles.ticketNavbar,
				)}
			>
				<div
					className={cn(
						"flex gap-2 items-center text-white",
						styles.ticketSelectLeft,
					)}
				>
					<LuTicketCheck className="text-3xl" />
					<h1 className={cn("text-sm md:text-lg lg:text-xl font-semibold")}>
						Các Phiếu Hỗ Trợ
					</h1>
				</div>

				<div className="flex items-center gap-2">
					{/* The inside button filter */}
					<TicketDashboardFilterBtn
						modalButtonClasses="flex md:hidden py-3.5 px-4 md:py-4.5 md:px-5.5"
						reloadButtonContentClasses="py-1 md:py-2 md:px-1"
						dashboardState={dashboardState}
					/>
				</div>
			</div>

			<div className="px-5 mb-5">
				<input
					type="text"
					placeholder="Tìm kiếm phiếu hỗ trợ theo tên..."
					value={ticketSearch}
					onChange={(e) => handleFilterChange("search", e.target.value)}
					className="w-full px-4 py-2 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-green-500 transition-colors"
				/>
			</div>

			<div className="px-5 pb-5 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
				{isFetchAllTicketsLoading ? (
					/* If: Loading is true */
					Array.from({ length: 8 }).map((_, index) => (
						<Skeleton
							className="rounded-xl h-48 w-full"
							key={`skeleton-${index}`}
						>
							<TicketCard variant="skeleton" />
						</Skeleton>
					))
				) : fetchedTickets.length === 0 && !fetchAllTicketsError ? (
					/* Else if: Not loading, but the array is empty */
					<div className="col-span-full flex flex-col items-center justify-center py-5 text-gray-500">
						<h2 className="text-xl font-semibold mb-2">Chưa có phiếu hỗ trợ nào!</h2>
						<p>Thử thay đổi bộ lọc hoặc tạo phiếu hỗ trợ mới.</p>
					</div>
				) : fetchAllTicketsError ? (
					/* Else if: Not loading, but fetch error */
					<div className="col-span-full flex flex-col items-center justify-center py-5 text-gray-500">
						<h2 className="text-xl font-semibold mb-2">Lỗi Hệ Thống</h2>
						<p>{fetchAllTicketsError}</p>
					</div>
				) : (
					fetchedTickets.map((t, index) => (
						/* Else: Not loading, and the array has data*/
						<div
							key={`ticketCard-${t.id}-${index}`}
							onClick={() => navigate(`/tickets/${t.id}`)}
							className="cursor-pointer transition-transform hover:scale-[1.02]"
						>
							<TicketCard ticket={t} />
						</div>
					))
				)}
			</div>

			{fetchedTickets.length > 0 && (
				<PageBar
					currentPage={currentPage + 1}
					totalPages={totalPages}
					onPageChange={(newPage) => setCurrentPage(newPage - 1)}
					className="px-5 pb-5"
				/>
			)}
		</div>
	);
};

export default TicketDashboard;
