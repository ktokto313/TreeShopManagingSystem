import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
	plugins: [react(), tailwindcss()],
	server: {
		proxy: {
		// Whenever React tries to fetch '/api/...', Vite will forward it to port 8080
		'/api': {
			target: 'http://localhost:8081',
			changeOrigin: true,
		},
		'/product-images': {
			target: 'http://localhost:8081',
			changeOrigin: true,
		},
		}
	}
});
