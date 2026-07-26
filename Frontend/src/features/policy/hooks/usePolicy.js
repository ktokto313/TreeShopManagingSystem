import { useCallback, useEffect, useState, useContext } from "react";
import { AuthContext } from "../../../context/AuthContext";
import { fetchAllPolicies, fetchPolicyById, updatePolicy, createPolicy } from "./policyApi";

export const usePolicy = (id = null) => {
	const { canManage } = useContext(AuthContext);
	const [policies, setPolicies] = useState([]);
	const [policy, setPolicy] = useState(null);
	const [searchTitle, setSearchTitle] = useState("");
	const [filterStatus, setFilterStatus] = useState(canManage ? "" : "PUBLISHED");
	const [currentPage, setCurrentPage] = useState(1);
	const [totalPages, setTotalPages] = useState(1);
	const [totalElements, setTotalElements] = useState(0);
	const [loading, setLoading] = useState(true);
	const [policyError, setPolicyError] = useState("");

	const [updateLoading, setUpdateLoading] = useState(false);

	const getAllPolicies = useCallback(async (title, status, page = 1) => {
		setLoading(true);
		try {
			const backendPage = Math.max(0, page - 1);
			const result = await fetchAllPolicies(title, status, backendPage, 6);
			if (result && Array.isArray(result.content)) {
				setPolicies(result.content);
				const pages = result.totalPages ?? result.page?.totalPages ?? 1;
				const elements = result.totalElements ?? result.page?.totalElements ?? 0;
				const pageNum = result.number ?? result.page?.number ?? backendPage;
				setTotalPages(Math.max(1, pages));
				setTotalElements(elements);
				setCurrentPage(pageNum + 1);
			} else if (Array.isArray(result)) {
				setPolicies(result);
				setTotalPages(1);
				setTotalElements(result.length);
				setCurrentPage(1);
			} else {
				setPolicies([]);
				setTotalPages(1);
				setTotalElements(0);
				setCurrentPage(1);
			}
		} catch (error) {
			console.error("Failed to fetch policies:", error);
			setPolicies([]);
			setTotalPages(1);
			setTotalElements(0);
			setCurrentPage(1);
		} finally {
			setLoading(false);
		}
	}, []);

	const handleSearch = (e) => {
		e.preventDefault();
		const search = new FormData(e.target).get("search");
		const newSearch = search || "";
		setSearchTitle(newSearch);
		setCurrentPage(1);
		getAllPolicies(newSearch, filterStatus, 1);
	};

	const handleFilterStatusChange = useCallback((newStatus) => {
		setFilterStatus(newStatus);
		setCurrentPage(1);
		getAllPolicies(searchTitle, newStatus, 1);
	}, [getAllPolicies, searchTitle]);

	const loadPage = useCallback((page) => {
		setCurrentPage(page);
		getAllPolicies(searchTitle, filterStatus, page);
	}, [getAllPolicies, searchTitle, filterStatus]);

	const handleUpdatePolicy = useCallback(async (targetId, newPolicyInfo) => {
		setUpdateLoading(true);
		setPolicyError("");
		try {
			const updatedPolicy = await updatePolicy(targetId, newPolicyInfo);

			setPolicies((prevPolicies) =>
				prevPolicies.map((p) => (p.id == targetId ? updatedPolicy : p)),
			);
			setPolicy(updatedPolicy);
		} catch (error) {
			console.error("Failed to update policy", error);
			if (error.payload) {
				setPolicyError(error.payload);
			} else {
				setPolicyError(error.message || "Đã xảy ra lỗi khi cập nhật chính sách.");
			}
		} finally {
			setUpdateLoading(false);
		}
	}, []);

	const handleCreatePolicy = useCallback(async (newPolicyInfo) => {
		setUpdateLoading(true);
		setPolicyError("");
		try {
			const newPolicy = await createPolicy(newPolicyInfo);
			setPolicies((prevPolicies) => [...prevPolicies, newPolicy]);
			return newPolicy;
		} catch (error) {
			console.error("Failed to create policy", error);
			if (error.payload) {
				setPolicyError(error.payload);
			} else {
				setPolicyError(error.message || "Đã xảy ra lỗi khi tạo chính sách.");
			}
			throw error;
		} finally {
			setUpdateLoading(false);
		}
	}, []);

	useEffect(() => {
		if (id) {
			const getSinglePolicy = async () => {
				setLoading(true);
				try {
					const data = await fetchPolicyById(id);
					setPolicy(data);
				} catch (error) {
					console.error("Failed to fetch policy by id:", error);
					setPolicy(null);
				} finally {
					setLoading(false);
				}
			};
			getSinglePolicy();
		} else {
			getAllPolicies(searchTitle, filterStatus, 1);
		}
	}, [id]);

	return {
		policies,
		policy,
		searchTitle,
		setSearchTitle,
		filterStatus,
		setFilterStatus: handleFilterStatusChange,
		currentPage,
		totalPages,
		totalElements,
		loadPage,
		loading,
		handleUpdatePolicy,
		handleCreatePolicy,
		updateLoading,
		setUpdateLoading,
		handleSearch,
		policyError,
		setPolicyError,
	};
};
