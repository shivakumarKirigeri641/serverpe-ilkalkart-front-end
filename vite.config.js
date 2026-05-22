import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import fs from 'node:fs';
import path from 'node:path';

const SAREE_DIR = 'C:/Users/shiva/Work/Projects/ilkalKart/testing_sarees';
const VIRTUAL_ID = 'virtual:sarees-catalog';
const RESOLVED_ID = '\0' + VIRTUAL_ID;

function parseDetails(text) {
  const get = (key) => {
    const re = new RegExp(`^\\s*${key}\\s*[-:]\\s*(.+)$`, 'im');
    const m = text.match(re);
    return m ? m[1].trim() : '';
  };
  const priceMatch = text.match(/price\s*[:\-]\s*(\d+)/i);
  return {
    material: get('Material'),
    border:   get('Border'),
    name:     get('Saree Name'),
    pallu:    get('Pallu'),
    blouse:   get('Blouse'),
    handloom: get('Handloom'),
    length:   get('Saree length'),
    price:    priceMatch ? Number(priceMatch[1]) : 0
  };
}

function scanCatalog() {
  if (!fs.existsSync(SAREE_DIR)) return [];
  return fs.readdirSync(SAREE_DIR, { withFileTypes: true })
    .filter(d => d.isDirectory())
    .map(d => {
      const folder = path.join(SAREE_DIR, d.name);
      let details = {};
      try {
        details = parseDetails(fs.readFileSync(path.join(folder, 'details.txt'), 'utf8'));
      } catch {}
      const colors = fs.readdirSync(folder, { withFileTypes: true })
        .filter(e => e.isDirectory())
        .map(e => e.name);
      return { code: d.name, details, colors };
    });
}

function sareeCatalogPlugin() {
  return {
    name: 'sarees-catalog',
    resolveId(id) { if (id === VIRTUAL_ID) return RESOLVED_ID; },
    load(id) {
      if (id === RESOLVED_ID) {
        return `export default ${JSON.stringify(scanCatalog())};`;
      }
    },
    configureServer(server) {
      const watcher = fs.watch(SAREE_DIR, { recursive: true }, () => {
        const mod = server.moduleGraph.getModuleById(RESOLVED_ID);
        if (mod) server.moduleGraph.invalidateModule(mod);
        server.ws.send({ type: 'full-reload' });
      });
      server.httpServer?.once('close', () => watcher.close());

      server.middlewares.use('/sarees-img', (req, res, next) => {
        try {
          const rel = decodeURIComponent((req.url || '').split('?')[0]);
          const full = path.normalize(path.join(SAREE_DIR, rel));
          if (!full.startsWith(path.normalize(SAREE_DIR))) {
            res.statusCode = 403; return res.end();
          }
          if (!fs.existsSync(full) || !fs.statSync(full).isFile()) {
            res.statusCode = 404; return res.end();
          }
          const ext = path.extname(full).toLowerCase();
          const mime = {
            '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg',
            '.png': 'image/png',  '.webp': 'image/webp', '.gif': 'image/gif'
          }[ext] || 'application/octet-stream';
          res.setHeader('Content-Type', mime);
          res.setHeader('Cache-Control', 'public, max-age=3600');
          fs.createReadStream(full).pipe(res);
        } catch (e) { next(e); }
      });
    },
    closeBundle() {
      if (!fs.existsSync(SAREE_DIR)) return;
      const outDir = path.resolve('dist', 'sarees-img');
      const copyTree = (src, dst) => {
        const stat = fs.statSync(src);
        if (stat.isDirectory()) {
          fs.mkdirSync(dst, { recursive: true });
          for (const entry of fs.readdirSync(src)) {
            if (entry.toLowerCase() === 'details.txt') continue;
            copyTree(path.join(src, entry), path.join(dst, entry));
          }
        } else if (/\.(jpe?g|png|webp|gif)$/i.test(src)) {
          fs.copyFileSync(src, dst);
        }
      };
      copyTree(SAREE_DIR, outDir);
    }
  };
}

export default defineConfig({
  plugins: [react(), sareeCatalogPlugin()],
  server: { port: 5173, open: true }
});
