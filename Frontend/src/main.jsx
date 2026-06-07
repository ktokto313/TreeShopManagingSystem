import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import "./assets/settings.css";
import "./index.css";
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext.jsx"
import { GoogleOAuthProvider } from '@react-oauth/google'

createRoot(document.getElementById("root")).render(
	<StrictMode>
		<BrowserRouter>
			<GoogleOAuthProvider clientId="77728042653-077afatlubpg65g1qrvat3sma7n6ak26.apps.googleusercontent.com">
				<AuthProvider>
					<App />
				</AuthProvider>
			</GoogleOAuthProvider>
		</BrowserRouter>
	</StrictMode>
);