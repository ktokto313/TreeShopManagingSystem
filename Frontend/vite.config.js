import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import process from 'node:process'

const apiTarget = process.env.VITE_API_TARGET ?? 'http://localhost:8080'

export default defineConfig({
	plugins: [react(), tailwindcss()],
	server: {
		proxy: {
		// Whenever React tries to fetch '/api/...', Vite will forward it to port 8080
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
});
