import { CheckCircle2, User, FileText, Briefcase, GraduationCap, Code, Folder, Award, Globe, Trophy, AlertCircle, Edit2 } from 'lucide-react'
import ThemeCustomizer from './ThemeCustomizer'

interface ReviewStepProps {
  data: {
    template?: string
    theme?: {
      primary_color: string
      secondary_color: string
    }
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
    certifications?: any[]
    languages?: any[]
    achievements?: any[]
  }
  onThemeChange?: (theme: { primary_color: string; secondary_color: string }) => void
  onUpdate?: (section: string, data: any) => void
  onJumpToStep?: (stepId: number) => void
}

export default function ReviewStep({ data, onThemeChange, onJumpToStep }: ReviewStepProps) {
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
  const certifications = Array.isArray(data?.certifications) ? data.certifications : []
  const languages = Array.isArray(data?.languages) ? data.languages : []
  const achievements = Array.isArray(data?.achievements) ? data.achievements : []
  const template = data?.template || 'resume_1'
  const theme = data?.theme || { primary_color: '00008B', secondary_color: '4B4B4B' }

  const sections = [
    {
      id: 1,
      icon: User,
      title: 'Contact Information',
      complete: !!(contact.name && contact.email),
      items: [contact.name, contact.email, contact.phone, contact.location].filter(Boolean).length,
      color: 'blue',
      required: true,
    },
    {
      id: 2,
      icon: FileText,
      title: 'Professional Summary',
      complete: summary.length > 50,
      items: summary.length > 0 ? 1 : 0,
      color: 'purple',
      required: false,
    },
    {
      id: 3,
      icon: Briefcase,
      title: 'Work Experience',
      complete: experience.length > 0,
      items: experience.length,
      color: 'green',
      required: true,
    },
    {
      id: 4,
      icon: GraduationCap,
      title: 'Education',
      complete: education.length > 0,
      items: education.length,
      color: 'indigo',
      required: true,
    },
    {
      id: 5,
      icon: Code,
      title: 'Skills',
      complete: skills.technical.length > 0 || skills.soft.length > 0,
      items: skills.technical.length + skills.soft.length,
      color: 'cyan',
      required: true,
    },
    {
      id: 6,
      icon: Folder,
      title: 'Projects',
      complete: projects.length > 0,
      items: projects.length,
      color: 'orange',
      required: false,
    },
    {
      id: 7,
      icon: Award,
      title: 'Certifications',
      complete: certifications.length > 0,
      items: certifications.length,
      color: 'amber',
      required: false,
    },
    {
      id: 8,
      icon: Globe,
      title: 'Languages',
      complete: languages.length > 0,
      items: languages.length,
      color: 'teal',
      required: false,
    },
    {
      id: 9,
      icon: Trophy,
      title: 'Achievements',
      complete: achievements.length > 0,
      items: achievements.length,
      color: 'yellow',
      required: false,
    },
  ]

  const completedSections = sections.filter((s) => s.complete).length
  const requiredSections = sections.filter((s) => s.required)
  const completedRequired = requiredSections.filter((s) => s.complete).length
  const totalSections = sections.length

  const colorClasses: Record<string, { bg: string; icon: string; badge: string }> = {
    blue: { bg: 'bg-blue-50', icon: 'text-blue-600', badge: 'bg-blue-100 text-blue-700' },
    purple: { bg: 'bg-purple-50', icon: 'text-purple-600', badge: 'bg-purple-100 text-purple-700' },
    green: { bg: 'bg-green-50', icon: 'text-green-600', badge: 'bg-green-100 text-green-700' },
    indigo: { bg: 'bg-indigo-50', icon: 'text-indigo-600', badge: 'bg-indigo-100 text-indigo-700' },
    cyan: { bg: 'bg-cyan-50', icon: 'text-cyan-600', badge: 'bg-cyan-100 text-cyan-700' },
    orange: { bg: 'bg-orange-50', icon: 'text-orange-600', badge: 'bg-orange-100 text-orange-700' },
    amber: { bg: 'bg-amber-50', icon: 'text-amber-600', badge: 'bg-amber-100 text-amber-700' },
    teal: { bg: 'bg-teal-50', icon: 'text-teal-600', badge: 'bg-teal-100 text-teal-700' },
    yellow: { bg: 'bg-yellow-50', icon: 'text-yellow-600', badge: 'bg-yellow-100 text-yellow-700' },
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary-100 dark:bg-primary-900/30 mb-4">
          <CheckCircle2 className="w-8 h-8 text-primary-900 dark:text-primary-400" />
        </div>
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Review Your Resume</h2>
        <p className="text-lg text-gray-600 dark:text-secondary-400">
          Almost done! Review your information below before creating your resume.
        </p>
      </div>

      {/* Progress Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Overall Progress */}
        <div className="bg-gradient-to-br from-primary-50 to-primary-100 dark:from-primary-900/40 dark:to-primary-900/20 border border-primary-200 dark:border-primary-800 rounded-2xl p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">Overall Progress</h3>
              <p className="text-sm text-gray-600 dark:text-secondary-400">
                {completedSections} of {totalSections} sections completed
              </p>
            </div>
            <div className="text-right">
              <div className="text-4xl font-bold text-primary-900 dark:text-primary-300">
                {Math.round((completedSections / totalSections) * 100)}%
              </div>
            </div>
          </div>
          <div className="h-3 bg-white/50 dark:bg-secondary-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-primary-900 dark:bg-primary-500 transition-all duration-500 rounded-full"
              style={{ width: `${(completedSections / totalSections) * 100}%` }}
            />
          </div>
        </div>

        {/* Required Sections */}
        <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/40 dark:to-green-900/20 border border-green-200 dark:border-green-800 rounded-2xl p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">Required Sections</h3>
              <p className="text-sm text-gray-600 dark:text-secondary-400">
                {completedRequired} of {requiredSections.length} required sections
              </p>
            </div>
            <div className="text-right">
              {completedRequired === requiredSections.length ? (
                <CheckCircle2 className="w-10 h-10 text-green-600 dark:text-green-400" />
              ) : (
                <AlertCircle className="w-10 h-10 text-amber-600 dark:text-amber-400" />
              )}
            </div>
          </div>
          <div className="h-3 bg-white/50 dark:bg-secondary-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-green-600 dark:bg-green-500 transition-all duration-500 rounded-full"
              style={{ width: `${(completedRequired / requiredSections.length) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* Theme Customizer */}
      {onThemeChange && (
        <ThemeCustomizer theme={theme} onChange={onThemeChange} />
      )}

      {/* Section Grid */}
      <div>
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Section Details</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {sections.map((section, index) => {
            const Icon = section.icon
            const colors = colorClasses[section.color]
            return (
              <div
                key={index}
                className={`
                  relative rounded-xl p-5 border-2 transition-all group
                  ${section.complete
                    ? 'bg-white dark:bg-secondary-800 border-green-200 dark:border-green-800 shadow-sm'
                    : 'bg-gray-50 dark:bg-secondary-900 border-gray-200 dark:border-secondary-800'
                  }
                `}
              >
                {section.required && !section.complete && (
                  <div className="absolute -top-2 -right-2">
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-bold bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400">
                      Required
                    </span>
                  </div>
                )}

                <div className="flex items-start gap-3 mb-3">
                  <div className={`h-11 w-11 rounded-xl ${colors.bg} dark:bg-opacity-20 flex items-center justify-center flex-shrink-0`}>
                    <Icon className={`h-6 w-6 ${colors.icon} dark:text-opacity-90`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-gray-900 dark:text-white mb-1 flex items-center gap-2">
                      {section.title}
                      {section.complete && (
                        <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400 flex-shrink-0" />
                      )}
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-secondary-400">
                      {section.items > 0
                        ? `${section.items} item${section.items !== 1 ? 's' : ''}`
                        : 'No items'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold ${section.complete
                    ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                    : section.required
                      ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400'
                      : 'bg-gray-200 dark:bg-secondary-700 text-gray-600 dark:text-secondary-300'
                    }`}>
                    {section.complete ? 'Complete' : section.required ? 'Incomplete' : 'Optional'}
                  </span>

                  {onJumpToStep && (
                    <button
                      onClick={() => onJumpToStep(section.id)}
                      className="p-2 text-secondary-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors rounded-full hover:bg-secondary-100 dark:hover:bg-secondary-700"
                      title="Edit Section"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Warnings */}
      {completedRequired < requiredSections.length && (
        <div className="bg-amber-50 dark:bg-amber-900/20 border-l-4 border-amber-400 dark:border-amber-500 rounded-lg p-5">
          <div className="flex gap-3">
            <AlertCircle className="h-6 w-6 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-bold text-amber-900 dark:text-amber-300 mb-1">Required Sections Missing</h4>
              <p className="text-sm text-amber-800 dark:text-amber-400">
                Please complete all required sections (Contact, Experience, Education, Skills) before creating your resume.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Success Message */}
      {completedRequired === requiredSections.length && (
        <div className="bg-green-50 dark:bg-green-900/20 border-l-4 border-green-400 dark:border-green-500 rounded-lg p-5">
          <div className="flex gap-3">
            <CheckCircle2 className="h-6 w-6 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-bold text-green-900 dark:text-green-300 mb-1">Ready to Create!</h4>
              <p className="text-sm text-green-800 dark:text-green-400">
                All required sections are complete. Click <strong>"Create Resume"</strong> below to generate your professional resume using the <strong>{template}</strong> template.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
