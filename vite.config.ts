/* eslint-disable import/no-extraneous-dependencies */
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react-swc';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const envVars = loadEnv(mode, process.cwd(), '');
  if (!envVars.NB_API_QUERY_URL) {
    throw new Error('Environment variable NB_API_QUERY_URL is not defined.');
  }

  if (envVars.NB_ENABLE_AUTH && envVars.NB_ENABLE_AUTH.toLowerCase() === 'true') {
    if (!envVars.NB_QUERY_CLIENT_ID) {
      throw new Error('Environment variable NB_QUERY_CLIENT_ID is not defined.');
    }
  }

  return {
    preview: {
      port: 5173,
      strictPort: true,
      host: true,
    },
    plugins: [react()],
    envPrefix: 'NB_',

    optimizeDeps: {
      // Including MUI and emotion here for local
      // Cypress component testing to work
      include: ['@emotion/react', '@emotion/styled', '@mui/material/Tooltip'],
      // Excluding the Auth0 library from the bundle to avoid issues with
      // Cypress component tests. TODO: understand why this is necessary
      exclude: ['@auth0/auth0-react'],
    },
  };
});
