import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import process from 'node:process'
import path from 'node:path'

export default defineConfig(({ mode }) => {
	// Load env file from the parent directory where the .env is located
	const env = loadEnv(mode, path.resolve(process.cwd(), '..'), '');
	
	const serverPort = env.SERVER_PORT || process.env.SERVER_PORT || '8080';
	const apiTarget = serverPort.startsWith('http') ? serverPort : `http://localhost:${serverPort}`;

	return {
		plugins: [react(), tailwindcss()],
		server: {
			proxy: {
			// Whenever React tries to fetch '/api/...', Vite will forward it to the backend port
			'/api': {
				target: apiTarget,
				changeOrigin: true,
			},
			'/product-images': {
				target: apiTarget,
				changeOrigin: true,
			},
			}
		}
	};
});
