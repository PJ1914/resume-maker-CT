import { SEO } from '../../components/SEO'

export default function BlogIndexPage() {
  return (
    <main className="min-h-screen">
      <SEO title="Blog – Prativeda" url="https://prativeda.codetapasya.com/blog" canonical="https://prativeda.codetapasya.com/blog" />
      <section className="py-16">
        <h1 className="text-3xl font-bold">Blog</h1>
        <p className="mt-2">ATS tips, resume best practices, and job search insights.</p>
      </section>
    </main>
  )
}
