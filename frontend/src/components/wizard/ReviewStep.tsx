import { CheckCircle, User, FileText, Briefcase, GraduationCap, Code, Folder } from 'lucide-react'
import { TemplateRenderer } from '../TemplateRenderer'

interface ReviewStepProps {
  data: {
    template?: string
    contact: {
      name: string
      email: string
      phone: string
      location: string
      linkedin: string
      website: string
    }
    summary: string
    experience: any[]
    education: any[]
    skills: {
      technical: string[]
      soft: string[]
    }
    projects: any[]
  }
}

export default function ReviewStep({ data }: ReviewStepProps) {
  // Defensive data validation
  const contact = data?.contact || {}
  const summary = data?.summary || ''
  const experience = Array.isArray(data?.experience) ? data.experience : []
  const education = Array.isArray(data?.education) ? data.education : []
  const skills = {
    technical: Array.isArray(data?.skills?.technical) ? data.skills.technical : [],
    soft: Array.isArray(data?.skills?.soft) ? data.skills.soft : [],
  }
  const projects = Array.isArray(data?.projects) ? data.projects : []
  const template = data?.template || 'modern'

  // Create a resume object for TemplateRenderer
  const templateData = {
    template,
    contact_info: contact,
    summary,
    parsed_text: summary,
    experience,
    education,
    skills,
    projects,
  } as any

  const sections = [
    {
      icon: User,
      title: 'Contact Information',
      complete: contact.name && contact.email,
      items: [
        contact.name,
        contact.email,
        contact.phone,
        contact.location,
      ].filter(Boolean).length,
    },
    {
      icon: FileText,
      title: 'Professional Summary',
      complete: summary.length > 0,
      items: summary.length > 0 ? 1 : 0,
    },
    {
      icon: Briefcase,
      title: 'Work Experience',
      complete: experience.length > 0,
      items: experience.length,
    },
    {
      icon: GraduationCap,
      title: 'Education',
      complete: education.length > 0,
      items: education.length,
    },
    {
      icon: Code,
      title: 'Skills',
      complete: skills.technical.length > 0 || skills.soft.length > 0,
      items: skills.technical.length + skills.soft.length,
    },
    {
      icon: Folder,
      title: 'Projects',
      complete: projects.length > 0,
      items: projects.length,
    },
  ]

  const completedSections = sections.filter((s) => s.complete).length
  const totalSections = sections.length

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-secondary-900 mb-2">Review Your Resume</h2>
        <p className="text-secondary-600">
          Almost done! Review your information and click "Create Resume" to finalize.
        </p>
      </div>

      {/* Progress Summary */}
      <div className="bg-gradient-to-r from-primary-50 to-purple-50 border border-primary-200 rounded-xl p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-secondary-900 mb-1">Completion Status</h3>
            <p className="text-secondary-600">
              You've completed {completedSections} out of {totalSections} sections
            </p>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-primary-600">
              {Math.round((completedSections / totalSections) * 100)}%
            </div>
            <div className="text-sm text-secondary-600">Complete</div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-4 h-2 bg-secondary-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-primary-600 to-purple-600 transition-all duration-500"
            style={{ width: `${(completedSections / totalSections) * 100}%` }}
          />
        </div>
      </div>

      {/* Section Checklist */}
      <div className="space-y-3">
        {sections.map((section, index) => {
          const Icon = section.icon
          return (
            <div
              key={index}
              className={`
                flex items-center justify-between p-4 rounded-lg border transition-all
                ${
                  section.complete
                    ? 'bg-green-50 border-green-200'
                    : 'bg-secondary-50 border-secondary-200'
                }
              `}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`
                  h-10 w-10 rounded-lg flex items-center justify-center
                  ${section.complete ? 'bg-green-100' : 'bg-secondary-200'}
                `}
                >
                  <Icon
                    className={`h-5 w-5 ${
                      section.complete ? 'text-green-600' : 'text-secondary-500'
                    }`}
                  />
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-semibold text-secondary-900">{section.title}</h4>
                    {section.complete && <CheckCircle className="h-4 w-4 text-green-600" />}
                  </div>
                  <p className="text-sm text-secondary-600">
                    {section.items > 0
                      ? `${section.items} item${section.items > 1 ? 's' : ''} added`
                      : 'Not added yet'}
                  </p>
                </div>
              </div>

              {section.complete ? (
                <span className="text-sm font-medium text-green-600">Complete</span>
              ) : (
                <span className="text-sm text-secondary-500">Optional</span>
              )}
            </div>
          )
        })}
      </div>

      {/* Full Resume Preview with Selected Template */}
      {contact.name && (
        <div className="border-t border-secondary-200 pt-6">
          <h3 className="font-semibold text-secondary-900 mb-4">Resume Preview ({template} template)</h3>
          <div className="border border-secondary-200 rounded-lg overflow-hidden shadow-sm">
            <TemplateRenderer resume={templateData} />
          </div>
        </div>
      )}

      {/* Warning if missing required fields */}
      {(!contact.name || !contact.email) && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-sm text-yellow-800">
            <strong>Note:</strong> Make sure to fill in at least your name and email address before
            creating your resume.
          </p>
        </div>
      )}

      <div className="bg-primary-50 border border-primary-200 rounded-lg p-4">
        <p className="text-sm text-primary-800">
          <strong>Ready to create?</strong> Click "Create Resume" below to generate your
          professional resume. You can always edit it later!
        </p>
      </div>
    </div>
  )
}
