import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

type BuildWarning = {
  code?: string;
  id?: string;
  message?: string;
};

const ignoredInvalidAnnotationPackages = [
  '/node_modules/thirdweb/',
  '/node_modules/ox/',
  '/node_modules/@walletconnect/utils/',
];

function isKnownThirdPartyInvalidAnnotation(warning: BuildWarning) {
  const source = `${warning.id ?? ''} ${warning.message ?? ''}`.replace(/\\/g, '/');

  return (
    warning.code === 'INVALID_ANNOTATION' &&
    ignoredInvalidAnnotationPackages.some((packagePath) => source.includes(packagePath))
  );
}

function isKnownThirdPartyNodeFallbackWarning(warning: BuildWarning) {
  const source = `${warning.id ?? ''} ${warning.message ?? ''}`.replace(/\\/g, '/');

  return (
    source.includes('Module "crypto" has been externalized for browser compatibility') &&
    source.includes('/node_modules/thirdweb/dist/esm/x402/sign.js')
  );
}

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const enableProductionSourcemaps = process.env.VITE_ENABLE_PRODUCTION_SOURCEMAPS === 'true';

  return {
    plugins: [react()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    define: {
      'process.env': {},
      global: 'globalThis',
    },
    build: {
      target: 'es2020',
      rollupOptions: {
        onwarn(warning, defaultHandler) {
          if (
            isKnownThirdPartyInvalidAnnotation(warning) ||
            isKnownThirdPartyNodeFallbackWarning(warning)
          ) {
            return;
          }

          defaultHandler(warning);
        },
        output: {
          manualChunks(id) {
            const normalizedId = id.replace(/\\/g, '/');

            if (
              normalizedId.includes('/node_modules/react/') ||
              normalizedId.includes('/node_modules/react-dom/')
            ) {
              return 'react-vendor';
            }

            if (normalizedId.includes('/node_modules/framer-motion/')) {
              return 'framer-motion';
            }

            if (
              normalizedId.includes('/node_modules/d3/') ||
              normalizedId.includes('/node_modules/d3-selection/') ||
              normalizedId.includes('/node_modules/d3-zoom/')
            ) {
              return 'd3-vendor';
            }

            if (normalizedId.includes('/node_modules/@supabase/supabase-js/')) {
              return 'supabase-vendor';
            }
          }
        }
      },
      chunkSizeWarningLimit: 10000,
      sourcemap: mode === 'production' ? enableProductionSourcemaps : true
    },
    server: {
      port: 3000,
      open: true
    },
    envPrefix: 'VITE_'
  };
});

