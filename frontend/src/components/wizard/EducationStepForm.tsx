import { Plus, Trash2, GraduationCap } from 'lucide-react'

interface EducationEntry {
  id: string
  school: string
  degree: string
  field: string
  location: string
  startDate: string
  endDate: string
  gpa: string
  description: string
}

interface EducationStepFormProps {
  data: EducationEntry[]
  onChange: (data: EducationEntry[]) => void
}

export default function EducationStepForm({ data, onChange }: EducationStepFormProps) {
  const addEducation = () => {
    const newEntry: EducationEntry = {
      id: Date.now().toString(),
      school: '',
      degree: '',
      field: '',
      location: '',
      startDate: '',
      endDate: '',
      gpa: '',
      description: '',
    }
    onChange([...data, newEntry])
  }

  const updateEducation = (id: string, field: keyof EducationEntry, value: string) => {
    onChange(data.map((edu) => (edu.id === id ? { ...edu, [field]: value } : edu)))
  }

  const removeEducation = (id: string) => {
    onChange(data.filter((edu) => edu.id !== id))
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-secondary-900 dark:text-white mb-2">Education</h2>
        <p className="text-secondary-600 dark:text-secondary-400">
          Add your educational background, starting with your most recent degree or certification.
        </p>
      </div>

      {data.length === 0 ? (
        <div className="bg-secondary-50 dark:bg-secondary-900 border-2 border-dashed border-secondary-300 dark:border-secondary-700 rounded-lg p-12 text-center">
          <GraduationCap className="h-12 w-12 text-secondary-400 dark:text-secondary-500 mx-auto mb-4" />
          <p className="text-secondary-600 dark:text-secondary-400 mb-4">No education added yet</p>
          <button onClick={addEducation} className="btn-primary flex items-center gap-2 mx-auto">
            <Plus className="h-4 w-4" />
            Add Education
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {data.map((education, index) => (
            <div
              key={education.id || `edu-${index}`}
              className="bg-secondary-50 dark:bg-secondary-900 border border-secondary-200 dark:border-secondary-800 rounded-lg p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-secondary-900 dark:text-white">Education #{index + 1}</h3>
                <button
                  onClick={() => removeEducation(education.id)}
                  className="text-danger-600 dark:text-danger-400 hover:text-danger-700 dark:hover:text-danger-300 p-2"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* School */}
                <div>
                  <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-2">
                    School / University <span className="text-danger-600 dark:text-danger-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={education.school}
                    onChange={(e) => updateEducation(education.id, 'school', e.target.value)}
                    placeholder="Stanford University"
                    className="w-full px-4 py-2.5 bg-white dark:bg-secondary-800 border border-secondary-300 dark:border-secondary-700 rounded-lg text-secondary-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                    required
                  />
                </div>

                {/* Degree */}
                <div>
                  <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-2">
                    Degree <span className="text-danger-600 dark:text-danger-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={education.degree}
                    onChange={(e) => updateEducation(education.id, 'degree', e.target.value)}
                    placeholder="Bachelor of Science"
                    className="w-full px-4 py-2.5 bg-white dark:bg-secondary-800 border border-secondary-300 dark:border-secondary-700 rounded-lg text-secondary-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                    required
                  />
                </div>

                {/* Field of Study */}
                <div>
                  <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-2">
                    Field of Study
                  </label>
                  <input
                    type="text"
                    value={education.field}
                    onChange={(e) => updateEducation(education.id, 'field', e.target.value)}
                    placeholder="Computer Science"
                    className="w-full px-4 py-2.5 bg-white dark:bg-secondary-800 border border-secondary-300 dark:border-secondary-700 rounded-lg text-secondary-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>

                {/* Location */}
                <div>
                  <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-2">
                    Location
                  </label>
                  <input
                    type="text"
                    value={education.location}
                    onChange={(e) => updateEducation(education.id, 'location', e.target.value)}
                    placeholder="Palo Alto, CA"
                    className="w-full px-4 py-2.5 bg-white dark:bg-secondary-800 border border-secondary-300 dark:border-secondary-700 rounded-lg text-secondary-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>

                {/* Start Date */}
                <div>
                  <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-2">
                    Start Date
                  </label>
                  <input
                    type="month"
                    value={education.startDate}
                    onChange={(e) => updateEducation(education.id, 'startDate', e.target.value)}
                    className="w-full px-4 py-2.5 bg-white dark:bg-secondary-800 border border-secondary-300 dark:border-secondary-700 rounded-lg text-secondary-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>

                {/* End Date */}
                <div>
                  <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-2">
                    End Date (or Expected)
                  </label>
                  <input
                    type="month"
                    value={education.endDate}
                    onChange={(e) => updateEducation(education.id, 'endDate', e.target.value)}
                    className="w-full px-4 py-2.5 bg-white dark:bg-secondary-800 border border-secondary-300 dark:border-secondary-700 rounded-lg text-secondary-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>

                {/* GPA */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-2">
                    GPA (optional)
                  </label>
                  <input
                    type="text"
                    value={education.gpa}
                    onChange={(e) => updateEducation(education.id, 'gpa', e.target.value)}
                    placeholder="3.8 / 4.0"
                    className="w-full px-4 py-2.5 bg-white dark:bg-secondary-800 border border-secondary-300 dark:border-secondary-700 rounded-lg text-secondary-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                  <p className="text-xs text-secondary-500 dark:text-secondary-400 mt-1">
                    Only include if 3.5 or higher
                  </p>
                </div>

                {/* Description */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-2">
                    Achievements & Activities
                  </label>
                  <textarea
                    value={education.description}
                    onChange={(e) => updateEducation(education.id, 'description', e.target.value)}
                    placeholder="• Dean's List all semesters&#10;• President of Computer Science Club&#10;• Relevant coursework: Algorithms, Machine Learning, Databases"
                    rows={4}
                    className="w-full px-4 py-2.5 bg-white dark:bg-secondary-800 border border-secondary-300 dark:border-secondary-700 rounded-lg text-secondary-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none font-mono text-sm"
                  />
                </div>
              </div>
            </div>
          ))}

          <button
            onClick={addEducation}
            className="w-full border-2 border-dashed border-secondary-300 dark:border-secondary-700 rounded-lg p-4 text-secondary-600 dark:text-secondary-400 hover:text-secondary-900 dark:hover:text-white hover:border-secondary-400 dark:hover:border-secondary-500 transition-colors flex items-center justify-center gap-2"
          >
            <Plus className="h-5 w-5" />
            Add Another Education
          </button>
        </div>
      )}
    </div>
  )
}
