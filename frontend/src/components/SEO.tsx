import { Helmet } from 'react-helmet-async'

type SEOProps = {
  title?: string
  description?: string
  url?: string
  image?: string
  keywords?: string
  canonical?: string
  structuredData?: Record<string, any>
}

const DEFAULTS = {
  title: 'Prativeda – AI Resume Builder | ATS-Optimized Resumes',
  description:
    'Create ATS-optimized resumes with AI analysis. Get higher ATS scores, pass screening, land more interviews. Free templates + intelligent parsing by Prativeda.',
  url: 'https://prativeda.codetapasya.com',
  image: 'https://prativeda.codetapasya.com/og-resume.jpg',
  keywords:
    'resume maker, ATS resume, AI resume, free resume builder, resume templates, resume optimization, job application, career tools',
  canonical: 'https://prativeda.codetapasya.com',
}

export function SEO(props: SEOProps) {
  const meta = { ...DEFAULTS, ...props }
  return (
    <Helmet>
      <title>{meta.title}</title>
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <meta name="description" content={meta.description} />
      <meta name="keywords" content={meta.keywords} />
      <meta charSet="UTF-8" />
      <meta name="language" content="English" />
      <meta name="revisit-after" content="30 days" />
      <meta name="author" content="Prativeda" />
      <link rel="canonical" href={meta.canonical} />

      {/* Open Graph */}
      <meta property="og:title" content={meta.title} />
      <meta property="og:description" content={meta.description} />
      <meta property="og:url" content={meta.url} />
      <meta property="og:image" content={meta.image} />
      <meta property="og:type" content="website" />
      <meta property="og:site_name" content="Prativeda" />

      {/* Twitter Cards */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={meta.title} />
      <meta name="twitter:description" content={meta.description} />
      <meta name="twitter:image" content={meta.image} />
      <meta name="twitter:creator" content="@prativeda" />

      {/* Structured Data (JSON-LD) */}
      {props.structuredData && (
        <script type="application/ld+json">
          {JSON.stringify(props.structuredData)}
        </script>
      )}

      {/* Favicon placeholders (ensure files exist in public/) */}
      <link rel="icon" href="/favicon.ico" />
      <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
      <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
      <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
    </Helmet>
  )
}

export function HomeSchema() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'Prativeda',
    url: 'https://prativeda.codetapasya.com',
    description:
      'AI-powered resume builder with ATS optimization. Create professional, ATS-friendly resumes that get results.',
    applicationCategory: 'BusinessApplication',
    operatingSystem: 'All',
    author: { '@type': 'Organization', name: 'CodeTapasya' },
    image: 'https://prativeda.codetapasya.com/og-resume.jpg',
    offers: { '@type': 'Offer', price: '0.00', priceCurrency: 'INR' },
  }
  return (
    <Helmet>
      <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
    </Helmet>
  )
}
