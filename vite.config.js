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

function swCacheBust() {
  return {
    name: 'sw-cache-bust',
    closeBundle() {
      const root = process.cwd();
      const outDir = 'dist';
      const swPath = path.join(root, outDir, 'sw.js');
      const htmlPath = path.join(root, outDir, 'index.html');
      if (!fs.existsSync(swPath) || !fs.existsSync(htmlPath)) return;

      const swContent = fs.readFileSync(swPath, 'utf-8');
      const match = swContent.match(/const CACHE_NAME = '([^']+)';/);
      if (!match) return;

      const cacheName = match[1];
      let htmlContent = fs.readFileSync(htmlPath, 'utf-8');
      htmlContent = htmlContent.replace(
        /navigator\.serviceWorker\.register\('sw\.js[^']*',/,
        `navigator.serviceWorker.register('sw.js?${cacheName}',`
      );
      fs.writeFileSync(htmlPath, htmlContent);
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
      'state.js',
      'utils.js',
      'sw.js',

    ]),
    swCacheBust()
  ]
});
