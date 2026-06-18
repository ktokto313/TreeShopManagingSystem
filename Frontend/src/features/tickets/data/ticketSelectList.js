const statusOptions = [
	{ value: "", label: "Tat ca trang thai" },
	{ value: "CREATED", label: "Da khoi tao" },
	{ value: "PROCESSING", label: "Dang xu ly" },
	{ value: "RESOLVED", label: "Da xu ly" },
	{ value: "DONE", label: "Da xong" },
];

const priorityOptions = [
	{ value: "", label: "Tat ca muc uu tien" },
	{ value: "LOW", label: "Thap" },
	{ value: "MEDIUM", label: "Trung binh" },
	{ value: "HIGH", label: "Cao" },
	{ value: "CRITICAL", label: "Rat quan trong" },
];

const sortOptions = [
	{ value: "", label: "Moi nhat" },
	{ value: "oldest", label: "Cu nhat" },
	{ value: "priority", label: "Theo uu tien" },
];

const optionsByType = {
	status: statusOptions,
	state: statusOptions,
	priority: priorityOptions,
	sort: sortOptions,
};

export const ticketSelectList = [
	{ label: "Trang thai", ticketParam: "status", options: statusOptions },
	{ label: "Uu tien", ticketParam: "priority", options: priorityOptions },
	{ label: "Sap xep", ticketParam: "sort", options: sortOptions },
];

export function getSelectOption(type) {
	return optionsByType[type] ?? [];
}
