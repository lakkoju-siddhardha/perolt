import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Vite config for the Perolt frontend.
// The backend is expected to run separately at http://localhost:5000
// (see src/services/api.js) — this dev server only serves the UI.
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173
  }
});
