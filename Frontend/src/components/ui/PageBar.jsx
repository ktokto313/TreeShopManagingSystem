import { useState } from "react";
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
	const [inputPage, setInputPage] = useState("");

	const handleSearch = () => {
		const page = parseInt(inputPage, 10);
		if (!isNaN(page)) {
			const clampedPage = Math.min(Math.max(1, page), safeTotalPages);
			if (onPageChange) {
				onPageChange(clampedPage);
			}
			setInputPage("");
		}
	};

	const handleKeyDown = (e) => {
		if (e.key === "Enter") {
			handleSearch();
		}
	};

	const handleInputChange = (e) => {
		const value = e.target.value.replace(/\D/g, "");
		if (value === "") {
			setInputPage("");
			return;
		}
		const numValue = parseInt(value, 10);
		if (!isNaN(numValue)) {
			const clamped = Math.min(Math.max(1, numValue), safeTotalPages);
			setInputPage(clamped.toString());
		}
	};

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
					onClick={() => onPageChange && onPageChange(1)}
				>
					Đầu
				</Button>
				<Button
					size={buttonSize}
					disabled={safeCurrentPage === 1}
					onClick={() => onPageChange && onPageChange(safeCurrentPage - 1)}
				>
					Trước
				</Button>

				{!pageNumbers.includes(1) && (
					<>
						<Button
							variant="secondary"
							size={buttonSize}
							onClick={() => onPageChange && onPageChange(1)}
						>
							1
						</Button>
						{pageNumbers[0] > 2 && <span className="text-gray-500">...</span>}
					</>
				)}

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

				{!pageNumbers.includes(safeTotalPages) && (
					<>
						{pageNumbers[pageNumbers.length - 1] < safeTotalPages - 1 && (
							<span className="text-gray-500">...</span>
						)}
						<Button
							variant="secondary"
							size={buttonSize}
							onClick={() => onPageChange && onPageChange(safeTotalPages)}
						>
							{safeTotalPages}
						</Button>
					</>
				)}

				<Button
					size={buttonSize}
					disabled={safeCurrentPage === safeTotalPages}
					onClick={() => onPageChange && onPageChange(safeCurrentPage + 1)}
				>
					Sau
				</Button>
				<Button
					size={buttonSize}
					disabled={safeCurrentPage === safeTotalPages}
					onClick={() => onPageChange && onPageChange(safeTotalPages)}
				>
					Cuối
				</Button>
			</div>
			<div className="flex flex-nowrap flex-1 items-center justify-end gap-2">
				<input
					type="text"
					value={inputPage}
					onChange={handleInputChange}
					onKeyDown={handleKeyDown}
					placeholder="Trang..."
					className="w-20 px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-green-500"
				/>
				<Button size={buttonSize} onClick={handleSearch} disabled={!inputPage}>
					Đi
				</Button>
			</div>
		</div>
	);
};

export default PageBar;
