import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import compression from 'vite-plugin-compression'

export default defineConfig({
  plugins: [
    react(),
    // Gzip compression for production
    compression({
      algorithm: 'gzip',
      ext: '.gz',
      threshold: 10240, // Only compress files > 10KB
    }),
    // Brotli compression for modern browsers
    compression({
      algorithm: 'brotliCompress',
      ext: '.br',
      threshold: 10240,
    })
  ],
  server: {
    proxy: {
       '/auth': 'http://localhost:3000',
      '/applications': 'http://localhost:3000'
    }
  },
  build: {
    // Code splitting and optimization
    rollupOptions: {
      output: {
        manualChunks: {
          // Keep React as a stable vendor chunk
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'ui-vendor': ['@heroicons/react', 'lucide-react', 'react-icons'],
          'charts-vendor': ['recharts'],
          'editor-vendor': ['react-quill', 'react-quill-new'],
          'pdf-vendor': ['jspdf', 'jspdf-autotable', 'html2canvas'],
          'utils-vendor': ['axios', 'date-fns', 'xlsx']
        },
        // Optimize chunk names and hashing
        entryFileNames: 'assets/[name].[hash].js',
        chunkFileNames: 'assets/[name].[hash].js',
        assetFileNames: 'assets/[name].[hash].[ext]'
      }
    },
    // Target modern browsers for smaller bundles (es2022 = less polyfills)
    target: 'es2022',
    // Minification
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true, // Remove console.logs in production
        drop_debugger: true,
        passes: 2, // Multiple passes for better compression
        pure_funcs: ['console.log', 'console.info', 'console.debug'],
      },
      mangle: {
        safari10: true, // Safari 10 bug workaround
      },
      format: {
        comments: false, // Remove all comments
      },
    },
    // Source maps for debugging (but smaller)
    sourcemap: false,
    // Chunk size warnings (more aggressive)
    chunkSizeWarningLimit: 500,
    // Optimize CSS
    cssCodeSplit: true,
    cssMinify: true
  },
  // Optimize dependencies
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      '@heroicons/react',
      'axios',
      'date-fns'
    ]
  }
})
