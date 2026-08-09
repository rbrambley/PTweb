import { defineConfig } from 'vite';
import fs from 'node:fs';
import path from 'node:path';

function copyRootStaticFiles(files) {
  return {
    name: 'copy-root-static-files',
    closeBundle() {
      const root = process.cwd();
      const outDir = 'dist';
      for (const file of files) {
        const src = path.join(root, file);
        const dest = path.join(root, outDir, file);
        if (fs.existsSync(src)) {
          fs.mkdirSync(path.dirname(dest), { recursive: true });
          fs.copyFileSync(src, dest);
        }
      }
    }
  };
}

export default defineConfig({
  base: './',
  build: {
    outDir: 'dist',
    emptyOutDir: true
  },
  server: {
    port: 3000,
    open: true
  },
  plugins: [
    copyRootStaticFiles([
      'app.js',
      'daily.js',
      'countdown.js',
      'exercises.js',
      'settings.js',
      'calendar.js',
      'config.js',
      'milestones.js',
      'progress.js',
      'reports.js',
      'storage.js',
      'utils.js',
      'sw.js',

    ])
  ]
});
