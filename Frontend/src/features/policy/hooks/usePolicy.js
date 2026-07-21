import { useCallback, useEffect, useState, useContext } from "react";
import { AuthContext } from "../../../context/AuthContext";
import { fetchAllPolicies, updatePolicy, createPolicy } from "./policyApi";

export const usePolicy = (id = null) => {
	const { canManage } = useContext(AuthContext);
	const [policies, setPolicies] = useState([]);
	const [policy, setPolicy] = useState(null);
	const [searchTitle, setSearchTitle] = useState("");
	const [filterStatus, setFilterStatus] = useState(canManage ? "" : "PUBLISHED");
	const [loading, setLoading] = useState(true);
	const [policyError, setPolicyError] = useState("");

	const [updateLoading, setUpdateLoading] = useState(false);

	const handleSearch = (e) => {
		e.preventDefault();
		const search = new FormData(e.target).get("search");
		setSearchTitle(search || "");
	};

	const getAllPolicies = useCallback(async (title, status) => {
		setLoading(true);
		try {
			const data = await fetchAllPolicies(title, status);
			setPolicies(data || []);
		} catch (error) {
			console.error("Failed to fetch policies:", error);
			setPolicies([]);
		} finally {
			setLoading(false);
		}
	}, []);

	const handleUpdatePolicy = useCallback(async (id, newPolicyInfo) => {
		setUpdateLoading(true);
		try {
			const updatedPolicy = await updatePolicy(id, newPolicyInfo);

			setPolicies((prevPolicies) =>
				prevPolicies.map((p) => (p.id == id ? updatedPolicy : p)),
			);
		} catch (error) {
			console.error("Failed to update policy", error);
            if (error.payload) {
                setPolicyError(error.payload);
            } else {
                setPolicyError("Đã xảy ra lỗi khi cập nhật chính sách.");
            }
		} finally {
			setUpdateLoading(false);
		}
	}, []);

	const handleCreatePolicy = useCallback(async (newPolicyInfo) => {
		setUpdateLoading(true);
		try {
			const newPolicy = await createPolicy(newPolicyInfo);
			setPolicies((prevPolicies) => [...prevPolicies, newPolicy]);
            return newPolicy;
		} catch (error) {
			console.error("Failed to create policy", error);
            if (error.payload) {
                setPolicyError(error.payload);
            } else {
                setPolicyError("Đã xảy ra lỗi khi tạo chính sách.");
            }
            throw error;
		} finally {
			setUpdateLoading(false);
		}
	}, []);

	useEffect(() => {
		getAllPolicies(searchTitle, filterStatus);
	}, [getAllPolicies, searchTitle, filterStatus]);

	useEffect(() => {
		if (id && policies.length > 0) {
			const found = policies.find((p) => p.id == id);
			if (found) {
				setPolicy(found);
			}
		}
	}, [id, policies]);

	return {
		policies,
		policy,
		searchTitle,
		setSearchTitle,
        filterStatus,
        setFilterStatus,
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
