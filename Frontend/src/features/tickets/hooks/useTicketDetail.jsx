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

	const isCreator = user?.email === ticket.ticketCreator?.email;
	const isResolved = ticket.ticketState?.toLowerCase() === "resolved";

	const isAgent = user?.roleName?.toLowerCase() === "support_agent";

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
		try {
			const agentEmail = isAgent ? user.email : null;
			const updatedTicket = await updateTicketStatus(
				ticketId,
				newState,
				agentEmail,
			);
			dispatch({ type: "STATUS_UPDATE_SUCCESS", payload: updatedTicket });
		} catch {
			dispatch({
				type: "STATUS_UPDATE_ERROR",
				payload: "Không thể cập nhật trạng thái",
			});
		}
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
		isCreator,
		isResolved,
		isAgent,
		handleStatusChange,
		handleCommentSubmit,
		setNewCommentDetail,
	};
};
