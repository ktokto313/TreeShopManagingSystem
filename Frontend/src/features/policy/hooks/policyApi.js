import { requestJson } from "../../cart/cartApi";

const POLICY_API_BASE = "/api/policy";

export const fetchAllPolicies = (search, status) => {
    const params = new URLSearchParams();

	if(search){
        params.append("title", search)
    }
    
    if (status) {
        params.append("status", status)
    }

    const queryString = params.toString();

	return requestJson(queryString ? `${POLICY_API_BASE}?${queryString}` : POLICY_API_BASE, { method: "GET" });
};

export const updatePolicy = (id, newPolicy) => {
    const params = { title: newPolicy.title, description: newPolicy.description, status: newPolicy.status };

    return requestJson(`${POLICY_API_BASE}/${id}`, { 
        method: "PUT",
        body: JSON.stringify(params)
    });
}

export const createPolicy = (newPolicy) => {
    const params = { title: newPolicy.title, description: newPolicy.description, status: newPolicy.status };

    return requestJson(`${POLICY_API_BASE}`, { 
        method: "POST",
        body: JSON.stringify(params)
    });
}
