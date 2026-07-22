export const MAX_REVIEW_FORM_CHARS = 500;
export const MAX_REVIEWS_RATINGS = 5;
export const REVIEWS_PER_PAGE = 5;

export const getRatingsOptions = () => {
	const normalOptions = Array.from({ length: MAX_REVIEWS_RATINGS }).map((_, index) => {
		return { label: index + 1, value: index + 1 };
	});

    return [{label: "Tất cả", value: ""}, ...normalOptions]
};

export const getPageNumbers = (currentPage, totalPages, maxVisible = 5) => {
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
		(_, index) => startPage + index,
	);
};
