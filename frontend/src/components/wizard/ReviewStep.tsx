import { CheckCircle, User, FileText, Briefcase, GraduationCap, Code, Folder } from 'lucide-react'

interface ReviewStepProps {
  data: {
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
  const sections = [
    {
      icon: User,
      title: 'Contact Information',
      complete: data.contact.name && data.contact.email,
      items: [
        data.contact.name,
        data.contact.email,
        data.contact.phone,
        data.contact.location,
      ].filter(Boolean).length,
    },
    {
      icon: FileText,
      title: 'Professional Summary',
      complete: data.summary.length > 0,
      items: data.summary.length > 0 ? 1 : 0,
    },
    {
      icon: Briefcase,
      title: 'Work Experience',
      complete: data.experience.length > 0,
      items: data.experience.length,
    },
    {
      icon: GraduationCap,
      title: 'Education',
      complete: data.education.length > 0,
      items: data.education.length,
    },
    {
      icon: Code,
      title: 'Skills',
      complete: data.skills.technical.length > 0 || data.skills.soft.length > 0,
      items: data.skills.technical.length + data.skills.soft.length,
    },
    {
      icon: Folder,
      title: 'Projects',
      complete: data.projects.length > 0,
      items: data.projects.length,
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

      {/* Contact Info Preview */}
      {data.contact.name && (
        <div className="border-t border-secondary-200 pt-6">
          <h3 className="font-semibold text-secondary-900 mb-4">Resume Preview</h3>
          <div className="bg-white border border-secondary-200 rounded-lg p-6">
            <div className="text-center mb-6">
              <h2 className="text-3xl font-bold text-secondary-900 mb-2">{data.contact.name}</h2>
              <div className="flex items-center justify-center gap-4 text-sm text-secondary-600 flex-wrap">
                {data.contact.email && <span>{data.contact.email}</span>}
                {data.contact.phone && <span>•</span>}
                {data.contact.phone && <span>{data.contact.phone}</span>}
                {data.contact.location && <span>•</span>}
                {data.contact.location && <span>{data.contact.location}</span>}
              </div>
            </div>

            {data.summary && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-secondary-900 mb-2">
                  Professional Summary
                </h3>
                <p className="text-secondary-700">{data.summary}</p>
              </div>
            )}

            {data.skills.technical.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-secondary-900 mb-2">Skills</h3>
                <div className="flex flex-wrap gap-2">
                  {data.skills.technical.slice(0, 10).map((skill, index) => (
                    <span
                      key={index}
                      className="bg-primary-100 text-primary-700 px-3 py-1 rounded-full text-sm"
                    >
                      {skill}
                    </span>
                  ))}
                  {data.skills.technical.length > 10 && (
                    <span className="text-sm text-secondary-600 px-3 py-1">
                      +{data.skills.technical.length - 10} more
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Warning if missing required fields */}
      {(!data.contact.name || !data.contact.email) && (
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
