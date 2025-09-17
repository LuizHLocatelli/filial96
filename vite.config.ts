import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import { visualizer } from "rollup-plugin-visualizer";
import JavaScriptObfuscator from 'javascript-obfuscator';


// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    mode === 'development' &&
    componentTagger(),
    visualizer({
      filename: "bundle-analysis.html",
      open: false,
    }),
    {
      name: 'obfuscate-sensitive-chunks',
      apply: 'build',
      enforce: 'post',
      generateBundle(_options, bundle) {
        const shouldObfuscate = (id) => {
          if (!id) return false;
          const normalized = String(id).replace(/\\/g, '/');
          return (
            normalized.includes('/src/pages/Auth.tsx') ||
            normalized.includes('/src/pages/CalculadoraIgreen.tsx') ||
            normalized.includes('/src/components/auth/')
          );
        };

        for (const [fileName, chunk] of Object.entries(bundle)) {
          if (chunk && chunk.type === 'chunk') {
            const hasSensitiveModule = Object.keys(chunk.modules).some(shouldObfuscate);
            if (hasSensitiveModule) {
              const result = JavaScriptObfuscator.obfuscate(String(chunk.code), {
                compact: true,
                controlFlowFlattening: true,
                controlFlowFlatteningThreshold: 0.75,
                deadCodeInjection: true,
                deadCodeInjectionThreshold: 0.4,
                disableConsoleOutput: true,
                identifierNamesGenerator: 'hexadecimal',
                renameGlobals: false,
                rotateStringArray: true,
                selfDefending: true,
                stringArray: true,
                stringArrayEncoding: ['rc4'],
                stringArrayThreshold: 0.75,
                transformObjectKeys: true,
                unicodeEscapeSequence: false,
                target: 'browser',
              });
              // @ts-ignore
              chunk.code = result.getObfuscatedCode();
            }
          }
        }
      }
    }

  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
    dedupe: ['react', 'react-dom'],
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          router: ['react-router-dom'],
          ui: ['@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu', '@radix-ui/react-tabs'],
          supabase: ['@supabase/supabase-js'],
          utils: ['date-fns', 'clsx', 'tailwind-merge'],
          moveis: ['src/pages/Moveis.tsx'],
          moda: ['src/pages/Moda.tsx'],
        },
        chunkFileNames: (chunkInfo) => {
          const facadeModuleId = chunkInfo.facadeModuleId
            ? chunkInfo.facadeModuleId.split('/').pop()?.replace('.tsx', '').replace('.ts', '')
            : 'chunk';
          return `js/${facadeModuleId}-[hash].js`;
        },
      },
    },
    chunkSizeWarningLimit: 1000,
    target: ['es2020', 'edge88', 'firefox78', 'chrome87', 'safari13.1'],
  },
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      '@supabase/supabase-js',
      '@tanstack/react-query',
    ],
    exclude: [
      'src/pages/Moveis', 
      'src/pages/Moda',
    ]
  },
}));
