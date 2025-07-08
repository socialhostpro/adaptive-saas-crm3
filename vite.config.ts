import path from 'path';
import { defineConfig, loadEnv } from 'vite';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
      define: {
        'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.NODE_ENV': JSON.stringify(mode),
        global: 'globalThis',
        'process.browser': true,
        // Fix require is not defined
        require: 'undefined',
        module: '{}'
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
          'cookie': path.resolve(__dirname, 'node_modules/cookie/dist/index.js'),
          'set-cookie-parser': path.resolve(__dirname, 'node_modules/set-cookie-parser/lib/set-cookie.js'),
          // Add additional aliases for better compatibility
          'buffer': 'buffer',
          'process': 'process/browser',
          'util': 'util'
        }
      },
      optimizeDeps: {
        include: [
          'cookie',
          'buffer',
          'process/browser',
          'util',
          '@supabase/supabase-js',
          '@supabase/postgrest-js', 
          '@supabase/realtime-js',
          '@supabase/storage-js',
          'react-grid-layout',
          'react-resizable',
          'lodash'
        ],
        exclude: [
          'zustand',
          'zustand/middleware',
          '@google/genai'
        ],
        esbuildOptions: {
          define: {
            global: 'globalThis',
            'process.env.NODE_ENV': JSON.stringify(mode)
          }
        }
      },
      server: {
        // Fix WebSocket issues
        hmr: {
          overlay: false
        },
        host: true,
        port: 5173
      },
      build: {
        commonjsOptions: {
          include: [/node_modules/],
          transformMixedEsModules: true,
          esmExternals: true
        },
        rollupOptions: {
          output: {
            manualChunks: {
              'react-grid-layout': ['react-grid-layout'],
              'supabase': ['@supabase/supabase-js']
            }
          }
        }
      }
    };
});
