import { defineConfig } from 'vite';
import cssInjectedByJsPlugin from 'vite-plugin-css-injected-by-js';
import path from 'path';

export default defineConfig({
  plugins: [
    cssInjectedByJsPlugin()
  ],
  build: {
    lib: {
      entry: path.resolve(__dirname, 'src/editorjs-columns.js'),
      name: 'EditorJsColumns',
      formats: ['es', 'umd'],
      fileName: (format) => format === 'es' ? 'editorjs-columns.mjs' : 'editorjs-columns.umd.js'
    },
    rollupOptions: {
      external: [],
      output: {
        globals: {}
      }
    },
    minify: false, // Disable minification for debugging
    sourcemap: true
  },
  css: {
    preprocessorOptions: {
      scss: {}
    }
  }
});