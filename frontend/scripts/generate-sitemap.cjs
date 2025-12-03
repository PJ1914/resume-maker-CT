const fs = require('fs')
const path = require('path')

const BASE_URL = process.env.SITE_URL || 'https://prativeda.codetapasya.com'

const routes = [
  '/',
  '/features',
  '/templates',
  '/pricing',
  '/blog',
  '/contact',
  '/about',
  '/privacy-policy',
  '/terms',
]

const urls = routes
  .map((r) => `  <url>\n    <loc>${BASE_URL}${r === '/' ? '/' : r}</loc>\n  </url>`) 
  .join('\n')

const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`

const outPath = path.join(__dirname, '..', 'public', 'sitemap.xml')
fs.writeFileSync(outPath, xml)
console.log(`Generated sitemap.xml with ${routes.length} routes at ${outPath}`)
