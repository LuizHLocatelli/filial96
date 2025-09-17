import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import path from 'path';

// Configuração de proteção para produção
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    // Minificação agressiva
    minify: 'terser',
    terserOptions: {
      compress: {
        // Remove console.log em produção
        drop_console: true,
        drop_debugger: true,
        // Otimizações agressivas
        passes: 3,
        pure_funcs: ['console.log', 'console.warn', 'console.error'],
        pure_getters: true,
        unsafe: true,
        unsafe_comps: true,
        unsafe_math: true,
        unsafe_methods: true,
        unsafe_proto: true,
        unsafe_regexp: true
      },
      mangle: {
        // Ofusca propriedades privadas
        properties: {
          regex: /^_/
        },
        // Ofusca nomes de classes e funções
        toplevel: true
      },
      format: {
        // Remove comentários
        comments: false
      }
    },
    // Configurações de output
    rollupOptions: {
      output: {
        // Nomes de chunks ofuscados
        entryFileNames: '[hash].js',
        chunkFileNames: '[hash].js',
        assetFileNames: '[hash].[ext]',
        // Ofusca nomes de funções
        manualChunks: undefined,
      },
    },
    // Source maps desabilitados em produção
    sourcemap: false,
    // Report compressão
    reportCompressedSize: false,
    // Chunk size warnings
    chunkSizeWarningLimit: 1000,
  },
  define: {
    // Remove variáveis de desenvolvimento
    __DEV__: false,
    'process.env.NODE_ENV': '"production"',
  },
  esbuild: {
    // Remove console em produção
    drop: ['console', 'debugger'],
    // Minificação agressiva
    minify: true,
    // Mangle names
    mangleProps: /^_/,
  }
});
