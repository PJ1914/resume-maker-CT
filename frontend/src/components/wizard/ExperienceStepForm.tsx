import { Plus, Trash2, Briefcase } from 'lucide-react'

interface ExperienceEntry {
  id: string
  company: string
  position: string
  location: string
  startDate: string
  endDate: string
  current: boolean
  description: string
}

interface ExperienceStepFormProps {
  data: ExperienceEntry[]
  onChange: (data: ExperienceEntry[]) => void
}

export default function ExperienceStepForm({ data, onChange }: ExperienceStepFormProps) {
  const addExperience = () => {
    const newEntry: ExperienceEntry = {
      id: Date.now().toString(),
      company: '',
      position: '',
      location: '',
      startDate: '',
      endDate: '',
      current: false,
      description: '',
    }
    onChange([...data, newEntry])
  }

  const updateExperience = (id: string, field: keyof ExperienceEntry, value: any) => {
    onChange(
      data.map((exp) => (exp.id === id ? { ...exp, [field]: value } : exp))
    )
  }

  const removeExperience = (id: string) => {
    onChange(data.filter((exp) => exp.id !== id))
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-secondary-900 mb-2">Work Experience</h2>
        <p className="text-secondary-600">
          Add your work history, starting with your most recent position. Include relevant
          achievements and responsibilities.
        </p>
      </div>

      {data.length === 0 ? (
        <div className="bg-secondary-50 border-2 border-dashed border-secondary-300 rounded-lg p-12 text-center">
          <Briefcase className="h-12 w-12 text-secondary-400 mx-auto mb-4" />
          <p className="text-secondary-600 mb-4">No work experience added yet</p>
          <button onClick={addExperience} className="btn-primary flex items-center gap-2 mx-auto">
            <Plus className="h-4 w-4" />
            Add First Experience
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {data.map((experience, index) => (
            <div
              key={experience.id}
              className="bg-secondary-50 border border-secondary-200 rounded-lg p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-secondary-900">
                  Experience #{index + 1}
                </h3>
                <button
                  onClick={() => removeExperience(experience.id)}
                  className="text-danger-600 hover:text-danger-700 p-2"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Company */}
                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-2">
                    Company <span className="text-danger-600">*</span>
                  </label>
                  <input
                    type="text"
                    value={experience.company}
                    onChange={(e) => updateExperience(experience.id, 'company', e.target.value)}
                    placeholder="Google"
                    className="w-full px-4 py-2.5 border border-secondary-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    required
                  />
                </div>

                {/* Position */}
                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-2">
                    Position <span className="text-danger-600">*</span>
                  </label>
                  <input
                    type="text"
                    value={experience.position}
                    onChange={(e) => updateExperience(experience.id, 'position', e.target.value)}
                    placeholder="Senior Software Engineer"
                    className="w-full px-4 py-2.5 border border-secondary-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    required
                  />
                </div>

                {/* Location */}
                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-2">
                    Location
                  </label>
                  <input
                    type="text"
                    value={experience.location}
                    onChange={(e) => updateExperience(experience.id, 'location', e.target.value)}
                    placeholder="San Francisco, CA"
                    className="w-full px-4 py-2.5 border border-secondary-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>

                {/* Start Date */}
                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-2">
                    Start Date <span className="text-danger-600">*</span>
                  </label>
                  <input
                    type="month"
                    value={experience.startDate}
                    onChange={(e) => updateExperience(experience.id, 'startDate', e.target.value)}
                    className="w-full px-4 py-2.5 border border-secondary-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    required
                  />
                </div>

                {/* End Date */}
                <div className="md:col-span-2">
                  <div className="flex items-center gap-4">
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={experience.current}
                        onChange={(e) =>
                          updateExperience(experience.id, 'current', e.target.checked)
                        }
                        className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-secondary-300 rounded"
                      />
                      <span className="text-sm font-medium text-secondary-700">
                        I currently work here
                      </span>
                    </label>

                    {!experience.current && (
                      <div className="flex-1">
                        <label className="block text-sm font-medium text-secondary-700 mb-2">
                          End Date
                        </label>
                        <input
                          type="month"
                          value={experience.endDate}
                          onChange={(e) =>
                            updateExperience(experience.id, 'endDate', e.target.value)
                          }
                          className="w-full px-4 py-2.5 border border-secondary-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                        />
                      </div>
                    )}
                  </div>
                </div>

                {/* Description */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-secondary-700 mb-2">
                    Description & Achievements
                  </label>
                  <textarea
                    value={experience.description}
                    onChange={(e) =>
                      updateExperience(experience.id, 'description', e.target.value)
                    }
                    placeholder="• Developed and maintained web applications using React and Node.js&#10;• Led a team of 5 engineers to deliver features on time&#10;• Improved application performance by 40%"
                    rows={6}
                    className="w-full px-4 py-2.5 border border-secondary-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none font-mono text-sm"
                  />
                  <p className="text-xs text-secondary-500 mt-1">
                    Use bullet points (•) for each achievement or responsibility
                  </p>
                </div>
              </div>
            </div>
          ))}

          <button
            onClick={addExperience}
            className="w-full border-2 border-dashed border-secondary-300 rounded-lg p-4 text-secondary-600 hover:text-secondary-900 hover:border-secondary-400 transition-colors flex items-center justify-center gap-2"
          >
            <Plus className="h-5 w-5" />
            Add Another Experience
          </button>
        </div>
      )}

      <div className="bg-primary-50 border border-primary-200 rounded-lg p-4">
        <p className="text-sm text-primary-800">
          <strong>Pro Tip:</strong> Use action verbs (developed, led, improved) and quantify your
          achievements with numbers whenever possible!
        </p>
      </div>
    </div>
  )
}
