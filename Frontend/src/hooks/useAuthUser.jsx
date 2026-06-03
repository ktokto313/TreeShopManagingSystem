import { useState } from "react";
import { loginApi, registerApi } from "../data/authApi";

const useAuthUser = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

	const executeAuth = async (authOption = "login") => {
        try{
            if(authOption === "login") loginApi();
            else if(authOption === "register") registerApi();
            setIsLoading(true);
        } catch(error){
            setError(error);
        }
	};

	return { isLoading, error, executeAuth };
};

export default useAuthUser;
