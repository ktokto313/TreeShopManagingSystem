export const MAX_REVIEW_FORM_CHARS = 500;
export const MAX_REVIEWS_RATINGS = 5;
export const REVIEWS_PER_PAGE = 5;

export const getRatingsOptions = () => {
	const normalOptions = Array.from({ length: MAX_REVIEWS_RATINGS }).map((_, index) => {
		return { label: index + 1, value: index + 1 };
	});

    return [{label: "Tất cả", value: ""}, ...normalOptions]
};

export const getPageNumbers = (currentPage, totalPages) => {
	const startPage = Math.max(1, currentPage - 2);
	const endPage = Math.min(totalPages, currentPage + 2);

	return Array.from(
		{ length: Math.max(0, endPage - startPage + 1) },
		(_, index) => startPage + index,
	);
}
