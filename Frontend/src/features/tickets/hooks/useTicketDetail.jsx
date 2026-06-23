import { useReducer, useEffect, useContext } from "react";
import { AuthContext } from "../../../context/AuthContext";
import {
	createComment,
	fetchComments,
	fetchTicketById,
	updateTicketStatus,
} from "../data/ticketApi";

const initialState = {
	ticket: null,
	comments: [],
	newCommentDetail: "",
	isFetchDetailLoading: true,
	isFetchDetailLoadingError: false,
	isStatusChangeLoading: false,
	isCommentSubmitLoading: false,
	commentTicketError: "",
	updateTicketError: "",
};

const detailReducer = (state, action) => {
	switch (action.type) {
		case "FETCH_START":
			return {
				...state,
				isFetchDetailLoadingError: false,
				isFetchDetailLoading: true,
			};
		case "FETCH_SUCCESS":
			return {
				...state,
				isFetchDetailLoading: false,
				ticket: action.payload.ticket,
				comments: action.payload.comments,
			};
		case "FETCH_ERROR":
			return {
				...state,
				isFetchDetailLoadingError: true,
				isFetchDetailLoading: false,
			};

		case "STATUS_UPDATE_START":
			return { ...state, isStatusChangeLoading: true, updateTicketError: "" };
		case "STATUS_UPDATE_SUCCESS":
			return { ...state, isStatusChangeLoading: false, ticket: action.payload };
		case "STATUS_UPDATE_ERROR":
			return {
				...state,
				isStatusChangeLoading: false,
				updateTicketError: action.payload,
			};

		case "COMMENT_SUBMIT_START":
			return { ...state, isCommentSubmitLoading: true, commentTicketError: "" };
		case "COMMENT_SUBMIT_SUCCESS":
			return {
				...state,
				isCommentSubmitLoading: false,
				comments: [...state.comments, action.payload],
				newCommentDetail: "",
			};
		case "COMMENT_SUBMIT_ERROR":
			return {
				...state,
				isCommentSubmitLoading: false,
				commentTicketError: action.payload,
			};

		case "SET_COMMENT_DETAIL":
			return { ...state, newCommentDetail: action.payload };

		default:
			return state;
	}
};

export const useTicketDetail = (ticketId) => {
	const { user } = useContext(AuthContext);
	const [state, dispatch] = useReducer(detailReducer, initialState);

	const isAgent = user?.roleName?.toLowerCase() === "support_agent";
	const isCreator = user?.email === state.ticket?.ticketCreator?.email;
	const isResolved = state.ticket?.ticketState?.toLowerCase() === "resolved";

	useEffect(() => {
		if (!ticketId) {
			dispatch({ type: "FETCH_ERROR" });
			return;
		}

		const loadData = async () => {
			dispatch({ type: "FETCH_START" });
			try {
				const [ticketData, commentsData] = await Promise.all([
					fetchTicketById(ticketId),
					fetchComments(ticketId),
				]);
				dispatch({
					type: "FETCH_SUCCESS",
					payload: { ticket: ticketData, comments: commentsData },
				});
			} catch (error) {
				console.error(error);
				dispatch({ type: "FETCH_ERROR" });
			}
		};

		loadData();
	}, [ticketId]);

	const handleStatusChange = async (newState) => {
		dispatch({ type: "STATUS_UPDATE_START" });

		// Get agent email in case its an agent, if not provided then its a customer
		const agentEmail = isAgent ? user.email : null;

		try {
			const valid = validateTicketState(newState);
			if (valid) {
				const updatedTicket = await updateTicketStatus(ticketId, newState, agentEmail);
				dispatch({ type: "STATUS_UPDATE_SUCCESS", payload: updatedTicket });
			}
		} catch {
			dispatch({
				type: "STATUS_UPDATE_ERROR",
				payload: "Không thể cập nhật trạng thái",
			});
		}
	};

	const validateTicketState = (newState) => {
		const currentTicketState = state.ticket?.ticketState?.toUpperCase();
		const targetState = newState?.toUpperCase();

		// Role Authorization Check
		if (!isAgent && !isCreator) {
			dispatch({
				type: "STATUS_UPDATE_ERROR",
				payload: "Bạn không phải là chủ Ticket hay Agent",
			});
			return false;
		}

		// Global State Validation
		if (targetState === "CREATED") {
			dispatch({
				type: "STATUS_UPDATE_ERROR",
				payload: "Ticket không thể trở lại trạng thái đã khởi tạo",
			});
			return false;
		}

		if (currentTicketState === "DONE") {
			dispatch({
				type: "STATUS_UPDATE_ERROR",
				payload: "Ticket đã hoàn thành, không thể chỉnh sửa",
			});
			return false;
		}

		// Independent validation matrix for Support Agents
		if (isAgent) {
			if (currentTicketState === "CREATED" && targetState !== "PROCESSING") {
				dispatch({
					type: "STATUS_UPDATE_ERROR",
					payload:
						"Agent chỉ có thể chuyển từ trạng thái khởi tạo sang đang xử lý",
				});
				return false;
			}
			if (
				currentTicketState === "PROCESSING" &&
				targetState !== "RESOLVED" &&
				targetState !== "DONE"
			) {
				dispatch({
					type: "STATUS_UPDATE_ERROR",
					payload:
						"Agent chỉ có thể chuyển đổi sang trạng thái Giải quyết hoặc Xong",
				});
				return false;
			}
			if (currentTicketState === "RESOLVED") {
				dispatch({
					type: "STATUS_UPDATE_ERROR",
					payload:
						"Agent không thể sửa đổi Ticket đang chờ khách hàng xác nhận",
				});
				return false;
			}
		}

		// Independent validation matrix for Ticket Creators (Customers)
		if (isCreator && !isAgent) {
			if (currentTicketState !== "RESOLVED") {
				dispatch({
					type: "STATUS_UPDATE_ERROR",
					payload:
						"Khách hàng chỉ có thể cập nhật trạng thái khi Ticket ở trạng thái đã xử lí",
				});
				return false;
			}
			if (targetState !== "DONE" && targetState !== "PROCESSING") {
				dispatch({
					type: "STATUS_UPDATE_ERROR",
					payload:
						"Khách hàng chỉ có quyền xác nhận Đồng ý hoặc Từ chối giải quyết",
				});
				return false;
			}
		}

		return true;
	};

	const handleCommentSubmit = async (e, closeModal) => {
		e.preventDefault();
		if (!state.newCommentDetail.trim()) return;

		dispatch({ type: "COMMENT_SUBMIT_START" });
		try {
			const addedComment = await createComment(
				ticketId,
				state.newCommentDetail,
			);
			dispatch({ type: "COMMENT_SUBMIT_SUCCESS", payload: addedComment });
			if (closeModal) closeModal();
		} catch (error) {
			console.log(error);
			dispatch({
				type: "COMMENT_SUBMIT_ERROR",
				payload: "Lỗi khi gửi bình luận",
			});
		}
	};

	const setNewCommentDetail = (text) => {
		dispatch({ type: "SET_COMMENT_DETAIL", payload: text });
	};

	return {
		...state,
		user,
		isAgent,
		isCreator,
		isResolved,
		handleStatusChange,
		handleCommentSubmit,
		setNewCommentDetail,
	};
};
