import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import {copyFileSync, mkdirSync} from 'fs';
import path from 'path';
import {defineConfig} from 'vite';

function copySibaperPages() {
  const pageNames = ['login', 'dashboard', 'user', 'profil', 'register'];

  return {
    name: 'copy-sibaper-pages',
    closeBundle() {
      const outputDirectory = path.resolve(__dirname, 'dist');
      mkdirSync(outputDirectory, {recursive: true});

      pageNames.forEach((pageName) => {
        copyFileSync(
          path.resolve(__dirname, 'pages', `${pageName}.html`),
          path.resolve(outputDirectory, `${pageName}.html`),
        );
      });
    },
  };
}

export default defineConfig(() => {
  return {
    base: '/',
    plugins: [react(), tailwindcss(), copySibaperPages()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modifyâfile watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
