import { Helmet } from 'react-helmet-async'

export function Analytics() {
  const gaId = import.meta.env.VITE_GA4_ID as string | undefined
  if (!gaId) return null
  const src = `https://www.googletagmanager.com/gtag/js?id=${gaId}`
  const inline = `window.dataLayer = window.dataLayer || []; function gtag(){dataLayer.push(arguments);} gtag('js', new Date()); gtag('config', '${gaId}');`

  return (
    <Helmet>
      <script async src={src}></script>
      <script>{inline}</script>
    </Helmet>
  )
}
