import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// Guarantees the cPanel SPA rewrite (.htaccess) is always present in the
// build output and that the build CANNOT succeed without it. This is the
// safeguard that prevents a future deployment from silently shipping an
// artifact that 404s on React Router refreshes / deep links.
function ensureHtaccess() {
  const publicHtaccess = path.resolve(__dirname, 'public', '.htaccess')
  const distHtaccess = path.resolve(__dirname, 'dist', '.htaccess')

  const REQUIRED = [
    [/^\s*RewriteEngine\s+On\s*$/m, 'RewriteEngine On'],
    [/^\s*RewriteBase\s+\/\s*$/m, 'RewriteBase /'],
    [/^\s*RewriteRule\s+\^index\\\.html\$\s+-\s+\[L\]\s*$/m, 'RewriteRule ^index\\.html$ - [L]'],
    [/^\s*RewriteCond\s+%\{REQUEST_FILENAME\}\s+!-f\s*$/m, 'RewriteCond %{REQUEST_FILENAME} !-f'],
    [/^\s*RewriteCond\s+%\{REQUEST_FILENAME\}\s+!-d\s*$/m, 'RewriteCond %{REQUEST_FILENAME} !-d'],
    [/^\s*RewriteRule\s+.\s+\/index\.html\s+\[L\]\s*$/m, 'RewriteRule . /index.html [L]'],
    [/^\s*ErrorDocument\s+404\s+\/index\.html\s*$/m, 'ErrorDocument 404 /index.html'],
  ]

  return {
    name: 'ensure-htaccess',
    buildStart() {
      if (!fs.existsSync(publicHtaccess)) {
        this.error(
          '[ensure-htaccess] public/.htaccess is MISSING. The cPanel SPA rewrite ' +
            'rules are required for React Router deep links / refreshes to work. ' +
            'Restore public/.htaccess before building.',
        )
      }
    },
    closeBundle() {
      try {
        if (!fs.existsSync(publicHtaccess)) return
        fs.mkdirSync(path.dirname(distHtaccess), { recursive: true })
        fs.copyFileSync(publicHtaccess, distHtaccess)
        const content = fs.readFileSync(distHtaccess, 'utf8')
        const missing = REQUIRED.filter(([re]) => !re.test(content))
        if (missing.length) {
          this.warn(
            '[ensure-htaccess] dist/.htaccess is missing required SPA rewrite directives: ' +
              missing.map(([, label]) => label).join(', '),
          )
        }
      } catch (err) {
        this.error('[ensure-htaccess] failed to write dist/.htaccess: ' + err.message)
      }
    },
  }
}

export default defineConfig({
  plugins: [react(), ensureHtaccess()],
  base: '/',
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:4000',
        changeOrigin: true,
      },
    },
  },
})
