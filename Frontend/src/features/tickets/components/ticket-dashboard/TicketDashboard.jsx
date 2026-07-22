import styles from "../../assets/styles/TicketDashboard.module.css";
import { TicketCard } from "../TicketCard";
import { LuTicketCheck } from "react-icons/lu";
import { Skeleton } from "../../../../components/ui/Skeleton";
import { TicketDashboardFilterBtn } from "./TicketDashboardFilter";
import { Button } from "../../../../components/ui/Button";
import { cn } from "./../../../../utils/cn";
import { useState } from "react";

function getPageNumbers(currentPage, totalPages, maxVisible = 5) {
	if (totalPages <= maxVisible) {
		return Array.from({ length: totalPages }, (_, index) => index + 1);
	}

	let startPage = currentPage - Math.floor(maxVisible / 2);
	let endPage = currentPage + Math.floor(maxVisible / 2);

	if (startPage < 1) {
		startPage = 1;
		endPage = maxVisible;
	} else if (endPage > totalPages) {
		endPage = totalPages;
		startPage = totalPages - maxVisible + 1;
	}

	return Array.from(
		{ length: endPage - startPage + 1 },
		(_, index) => startPage + index
	);
}

const TicketDashboard = ({ dashboardState, className }) => {
	const {
		fetchAllTicketsError,
		isFetchAllTicketsLoading,
		fetchedTickets,
		totalPages,
		currentPage,
		setCurrentPage,
		navigate,
	} = dashboardState;

	const effectiveCurrentPage = currentPage + 1;
	const safeTotalPages = Math.max(1, totalPages || 1);
	const pageNumbers = getPageNumbers(effectiveCurrentPage, safeTotalPages);

	const [searchQuery, setSearchQuery] = useState("");

	const filteredTickets = fetchedTickets.filter((t) =>
		t.title.toLowerCase().includes(searchQuery.toLowerCase())
	);

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
						Các Ticket Khiếu Nại
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
					placeholder="Tìm kiếm ticket theo tên..."
					value={searchQuery}
					onChange={(e) => setSearchQuery(e.target.value)}
					className="w-full px-4 py-2 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-green-500 transition-colors"
				/>
			</div>

			<div className="px-5 pb-5 grid grid-cols-1 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-4">
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
				) : filteredTickets.length === 0 && !fetchAllTicketsError ? (
					/* Else if: Not loading, but the array is empty */
					<div className="col-span-full flex flex-col items-center justify-center py-5 text-gray-500">
						<h2 className="text-xl font-semibold mb-2">Chưa có ticket nào!</h2>
						<p>Thử thay đổi bộ lọc hoặc tạo ticket mới.</p>
					</div>
				) : fetchAllTicketsError ? (
					/* Else if: Not loading, but fetch error */
					<div className="col-span-full flex flex-col items-center justify-center py-5 text-gray-500">
						<h2 className="text-xl font-semibold mb-2">Lỗi Hệ Thống</h2>
						<p>{fetchAllTicketsError}</p>
					</div>
				) : (
					filteredTickets.map((t, index) => (
						/* Else: Not loading, and the array has data*/
						<div
							key={`ticketCard-${t.id}-${index}`}
							onClick={() => navigate(`/tickets/${t.id}`)}
							className="cursor-pointer transition-transform hover:scale-[1.02]"
						>
							<TicketCard ticket={t}/>
						</div>
					))
				)}
			</div>

			{safeTotalPages > 1 && (
				<div className="flex flex-wrap items-center justify-between gap-3 border-t border-gray-200 pt-4 px-5 pb-5 mt-auto">
					<div className="text-sm flex-1 text-green-800">
						Trang {effectiveCurrentPage} / {safeTotalPages}
					</div>
					<div className="flex flex-nowrap flex-1 items-center justify-center gap-2">
						<Button
							size="sm"
							disabled={effectiveCurrentPage === 1}
							onClick={() => setCurrentPage((value) => Math.max(0, value - 1))}
						>
							Trước
						</Button>
						{pageNumbers.map((pageNumber) => (
							<Button
								key={pageNumber}
								variant={pageNumber === effectiveCurrentPage ? 'primary' : 'secondary'}
								size="sm"
								onClick={() => setCurrentPage(pageNumber - 1)}
							>
								{pageNumber}
							</Button>
						))}
						<Button
							size="sm"
							disabled={effectiveCurrentPage === safeTotalPages}
							onClick={() => setCurrentPage((value) => Math.min(safeTotalPages - 1, value + 1))}
						>
							Sau
						</Button>
					</div>
					<div className='flex-1'></div>
				</div>
			)}
		</div>
	);
};

export default TicketDashboard;
