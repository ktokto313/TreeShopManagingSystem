import { createContext, useState } from "react";
import { loginApi, logoutApi, registerApi } from "../data/authApi";

const AuthContext = createContext();

const AuthProvider = ({ children }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    
    const [user, setUser] = useState(() => {
        const savedUser = localStorage.getItem("currentUser");
        return savedUser ? JSON.parse(savedUser) : null;
    });

    const executeAuth = async (authOption = "login") => {
        setIsLoading(true);
        setError(null);
        try {
            let userData;

            if (authOption === "login") {
                console.log("1. Sending login request to backend...");
                userData = await loginApi();
                console.log("2. Backend responded with:", userData);
            } else if (authOption === "register") {
                userData = await registerApi();
            }

            // Update React State
            setUser(userData);
            
            // SAVE TO HARD DRIVE! (This is what keeps you logged in)
            console.log("3. Saving user to LocalStorage...");
            localStorage.setItem("currentUser", JSON.stringify(userData));
            console.log("4. Save complete!");

        } catch (err) {
            console.error("Login crashed:", err);
            setError(err);
        } finally {
            setIsLoading(false);
        }
    };

    const logout = async () => {
        console.log("1. Logging out...");
        const logoutResponse = await logoutApi();
        console.log("Backend responded with: " + logoutResponse);
    };

    return (
        <AuthContext.Provider value={{ user, isLoading, error, executeAuth, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export { AuthContext, AuthProvider };