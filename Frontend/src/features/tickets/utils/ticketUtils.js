	export const getTicketStatusStyles = (ticketState) => {
		if (!ticketState) return;
		switch (ticketState.toLowerCase()) {
			case "created":
				return "bg-blue-500 text-white";
			case "processing":
				return "bg-bg-warning text-text-warning";
			case "resolved":
				return "bg-bg-success text-text-error";
			case "done":
				return "bg-gray-500 border border-border text-white";
			default:
				return "bg-gray-500 border border-border text-white";
		}
	};

	export const translateTicketStatus = (status) => {
		if (!status) return;
		const _status = status.toLowerCase();
		switch (_status) {
			case "created":
				return "Đã Khởi Tạo";
			case "processing":
				return "Đang Xử Lí";
			case "resolved":
				return "Đã Xử Lí";
			case "done":
				return "Đã Xong";
			default:
				return "Chưa Xác Định";
		}
	};

    	export const translateTicketPriority = (priority) => {
		if (!priority) return;
		const _priority = priority.toLowerCase();
		switch (_priority) {
			case "low":
				return "Thấp";
			case "medium":
				return "Trung Bình";
			case "high":
				return "Cao";
			case "critical":
				return "Rất Quan Trọng";
			default:
				return "Chưa Xác Định";
		}
	};

	export const getTicketPriorityStyles = (priority) => {
		if (!priority) return;
		return "border-red-500 border text-red-500";
	};