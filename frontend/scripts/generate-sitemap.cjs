const fs = require('fs')
const path = require('path')

const BASE_URL = process.env.SITE_URL || 'https://prativeda.codetapasya.com'

const routes = [
  { url: '/', priority: '1.0', changefreq: 'weekly' },
  { url: '/pricing', priority: '0.9', changefreq: 'monthly' },
  { url: '/portfolio-templates', priority: '0.9', changefreq: 'weekly' },
  { url: '/privacy-policy', priority: '0.5', changefreq: 'yearly' },
  { url: '/refund-policy', priority: '0.5', changefreq: 'yearly' },
  { url: '/shipping-policy', priority: '0.5', changefreq: 'yearly' },
  { url: '/terms', priority: '0.5', changefreq: 'yearly' },
  { url: '/about', priority: '0.8', changefreq: 'quarterly' },
]

const lastmod = new Date().toISOString().split('T')[0]

const urls = routes
  .map((r) => `  <url>
    <loc>${BASE_URL}${r.url}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>${r.changefreq}</changefreq>
    <priority>${r.priority}</priority>
  </url>`)
  .join('\n')

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>
`

const outPath = path.join(__dirname, '..', 'public', 'sitemap.xml')
fs.writeFileSync(outPath, xml)
console.log(`Generated sitemap.xml with ${routes.length} routes at ${outPath}`)
