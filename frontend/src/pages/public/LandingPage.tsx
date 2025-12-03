import { SEO } from '../../components/SEO'

export default function LandingPage() {
  return (
    <main className="min-h-screen">
      <SEO title="Prativeda – ATS Resume Maker by CodeTapasya" url="https://prativeda.codetapasya.com/" canonical="https://prativeda.codetapasya.com/" />
      <section className="py-20 text-center">
        <h1 className="text-4xl font-bold">India’s Smartest ATS Resume Builder</h1>
        <p className="mt-4 text-lg">Create modern, ATS-approved resumes instantly. Free forever.</p>
      </section>
    </main>
  )
}
