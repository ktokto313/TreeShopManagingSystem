import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import process from 'node:process'

export default defineConfig(() => {
	const apiTarget = process.env.SERVER_PORT ? ("http://app:" + process.env.SERVER_PORT) : 'http://localhost:8080'

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
