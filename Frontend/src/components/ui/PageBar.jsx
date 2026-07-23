import { Button } from "./Button";
import { cn } from "../../utils/cn";

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

export const PageBar = ({
	currentPage = 1,
	totalPages = 1,
	onPageChange,
	maxVisible = 5,
	className = "",
	buttonSize = "sm",
}) => {
	const safeTotalPages = Math.max(1, totalPages || 1);
	const safeCurrentPage = Math.min(Math.max(1, currentPage || 1), safeTotalPages);
	const pageNumbers = getPageNumbers(safeCurrentPage, safeTotalPages, maxVisible);

	return (
		<div
			className={cn(
				"flex flex-wrap items-center justify-between gap-3 border-t border-gray-200 pt-4 mt-auto",
				className
			)}
		>
			<div className="text-sm flex-1 text-green-800 font-medium">
				Trang {safeCurrentPage} / {safeTotalPages}
			</div>
			<div className="flex flex-nowrap flex-1 items-center justify-center gap-2">
				<Button
					size={buttonSize}
					disabled={safeCurrentPage === 1}
					onClick={() => onPageChange && onPageChange(safeCurrentPage - 1)}
				>
					Trước
				</Button>
				{pageNumbers.map((pageNumber) => (
					<Button
						key={pageNumber}
						variant={pageNumber === safeCurrentPage ? "primary" : "secondary"}
						size={buttonSize}
						onClick={() => onPageChange && onPageChange(pageNumber)}
					>
						{pageNumber}
					</Button>
				))}
				<Button
					size={buttonSize}
					disabled={safeCurrentPage === safeTotalPages}
					onClick={() => onPageChange && onPageChange(safeCurrentPage + 1)}
				>
					Sau
				</Button>
			</div>
			<div className="flex-1"></div>
		</div>
	);
};

export default PageBar;
