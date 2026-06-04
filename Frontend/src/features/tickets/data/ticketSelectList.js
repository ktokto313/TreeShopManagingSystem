export const ticketSelectList = [
	{
		label: "Trạng Thái",
		options: [
            { label: "Không", value: "" },
			{ label: "Đã Khởi Tạo", value: "CREATED" },
			{ label: "Đang Xử Lí", value: "PROCESSING" },
			{ label: "Đã Xử Lí", value: "RESOLVED" },
			{ label: "Đã Xong", value: "DONE" },
		],
        ticketParam: "status"
	},
	{
		label: "Ưu Tiên",
		options: [
            { label: "Không", value: "" },
			{ label: "Thấp", value: "LOW" },
			{ label: "Trung Bình", value: "MEDIUM" },
			{ label: "Cao", value: "HIGH" },
			{ label: "Rất Quan Trọng", value: "CRITICAL" },
		],
        ticketParam: "priority"
	},
{
        label: "Lọc",
        options: [
            { label: "Không", value: "" },
            { label: "Mới Nhất", value: "timeCreated,desc" },
            { label: "Cũ Nhất", value: "timeCreated,asc" },
        ],
        ticketParam: "sort"
    }
];
