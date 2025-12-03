import { SEO } from '../../components/SEO'

export default function AboutPage() {
  return (
    <main className="min-h-screen">
      <SEO title="About – Prativeda" url="https://prativeda.codetapasya.com/about" canonical="https://prativeda.codetapasya.com/about" />
      <section className="py-16">
        <h1 className="text-3xl font-bold">About CodeTapasya</h1>
        <p className="mt-2">Prativeda is a CodeTapasya microservice combining AI and LaTeX for ATS-ready resumes.</p>
      </section>
    </main>
  )
}
