import { useState } from "react";
import { loginApi, registerApi } from "../data/authApi";

const useAuthUser = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    const executeAuth = async (authOption = "login") => {
        setIsLoading(true);
        try {
            var temp;
            if (authOption === "login") temp = await loginApi();
            else if (authOption === "register") temp = await registerApi();
            await temp;
        } catch (error) {
            setError(error);
        } finally {
            setIsLoading(false);
        }
    };

    return { isLoading, error, executeAuth };
};

export default useAuthUser;
