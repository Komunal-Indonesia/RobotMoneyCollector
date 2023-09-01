import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // add the configuration for exposing the port to docker
  server:{
    host: "0.0.0.0", 
  },
});
