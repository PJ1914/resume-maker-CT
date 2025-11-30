import { Plus, X, Code, Users } from 'lucide-react'
import { useState } from 'react'

interface SkillsData {
  technical: string[]
  soft: string[]
}

interface SkillsStepFormProps {
  data: SkillsData
  onChange: (data: SkillsData) => void
}

export default function SkillsStepForm({ data, onChange }: SkillsStepFormProps) {
  // Ensure data has proper structure
  const safeData = {
    technical: Array.isArray(data?.technical) ? data.technical : [],
    soft: Array.isArray(data?.soft) ? data.soft : [],
  }

  const [technicalInput, setTechnicalInput] = useState('')
  const [softInput, setSoftInput] = useState('')

  const addTechnicalSkill = () => {
    if (technicalInput.trim()) {
      onChange({
        ...safeData,
        technical: [...safeData.technical, technicalInput.trim()],
      })
      setTechnicalInput('')
    }
  }

  const removeTechnicalSkill = (index: number) => {
    onChange({
      ...safeData,
      technical: safeData.technical.filter((_, i) => i !== index),
    })
  }

  const addSoftSkill = () => {
    if (softInput.trim()) {
      onChange({
        ...safeData,
        soft: [...safeData.soft, softInput.trim()],
      })
      setSoftInput('')
    }
  }

  const removeSoftSkill = (index: number) => {
    onChange({
      ...safeData,
      soft: safeData.soft.filter((_, i) => i !== index),
    })
  }

  const suggestedTechnical = [
    'JavaScript',
    'TypeScript',
    'Python',
    'React',
    'Node.js',
    'SQL',
    'AWS',
    'Docker',
    'Git',
    'MongoDB',
  ]

  const suggestedSoft = [
    'Leadership',
    'Communication',
    'Problem Solving',
    'Teamwork',
    'Time Management',
    'Critical Thinking',
  ]

  const addSuggested = (skill: string, type: 'technical' | 'soft') => {
    if (type === 'technical' && !safeData.technical.includes(skill)) {
      onChange({ ...safeData, technical: [...safeData.technical, skill] })
    } else if (type === 'soft' && !safeData.soft.includes(skill)) {
      onChange({ ...safeData, soft: [...safeData.soft, skill] })
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl sm:text-2xl font-bold text-secondary-900 dark:text-white mb-2">Skills</h2>
        <p className="text-sm sm:text-base text-secondary-600 dark:text-secondary-400">
          List your technical and soft skills. Add skills that are relevant to your target role.
        </p>
      </div>

      {/* Technical Skills */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Code className="h-5 w-5 text-primary-900 dark:text-primary-400" />
          <h3 className="text-lg font-semibold text-secondary-900 dark:text-white">Technical Skills</h3>
        </div>

        {/* Input */}
        <div className="flex flex-col sm:flex-row gap-2 mb-4">
          <input
            type="text"
            value={technicalInput}
            onChange={(e) => setTechnicalInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault()
                addTechnicalSkill()
              }
            }}
            placeholder="Type a skill and press Enter"
            className="flex-1 px-4 py-2.5 bg-white dark:bg-secondary-800 border border-secondary-300 dark:border-secondary-700 rounded-lg text-secondary-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm sm:text-base"
          />
          <button
            onClick={addTechnicalSkill}
            className="btn-primary flex items-center justify-center gap-2 w-full sm:w-auto"
          >
            <Plus className="h-4 w-4" />
            Add
          </button>
        </div>

        {/* Skills List */}
        {safeData.technical.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {safeData.technical.map((skill, index) => (
              <div
                key={index}
                className="bg-primary-100 dark:bg-primary-900/40 text-primary-700 dark:text-primary-300 px-3 py-1.5 rounded-full flex items-center gap-2 text-sm font-medium"
              >
                {skill}
                <button
                  onClick={() => removeTechnicalSkill(index)}
                  className="hover:bg-primary-200 dark:hover:bg-primary-800 rounded-full p-0.5"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Suggestions */}
        <div>
          <p className="text-xs text-secondary-600 dark:text-secondary-400 mb-2">Popular technical skills:</p>
          <div className="flex flex-wrap gap-2">
            {suggestedTechnical
              .filter((skill) => !safeData.technical.includes(skill))
              .map((skill) => (
                <button
                  key={skill}
                  onClick={() => addSuggested(skill, 'technical')}
                  className="bg-secondary-100 dark:bg-secondary-800 text-secondary-700 dark:text-secondary-300 px-3 py-1 rounded-full text-xs hover:bg-secondary-200 dark:hover:bg-secondary-700 transition-colors"
                >
                  + {skill}
                </button>
              ))}
          </div>
        </div>
      </div>

      {/* Soft Skills */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Users className="h-5 w-5 text-primary-900 dark:text-primary-400" />
          <h3 className="text-lg font-semibold text-secondary-900 dark:text-white">Soft Skills</h3>
        </div>

        {/* Input */}
        <div className="flex flex-col sm:flex-row gap-2 mb-4">
          <input
            type="text"
            value={softInput}
            onChange={(e) => setSoftInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault()
                addSoftSkill()
              }
            }}
            placeholder="Type a skill and press Enter"
            className="flex-1 px-4 py-2.5 bg-white dark:bg-secondary-800 border border-secondary-300 dark:border-secondary-700 rounded-lg text-secondary-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm sm:text-base"
          />
          <button
            onClick={addSoftSkill}
            className="btn-primary flex items-center justify-center gap-2 w-full sm:w-auto"
          >
            <Plus className="h-4 w-4" />
            Add
          </button>
        </div>

        {/* Skills List */}
        {safeData.soft.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {safeData.soft.map((skill, index) => (
              <div
                key={index}
                className="bg-secondary-200 dark:bg-secondary-700 text-secondary-800 dark:text-secondary-200 px-3 py-1.5 rounded-full flex items-center gap-2 text-sm font-medium"
              >
                {skill}
                <button
                  onClick={() => removeSoftSkill(index)}
                  className="hover:bg-secondary-300 dark:hover:bg-secondary-600 rounded-full p-0.5"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Suggestions */}
        <div>
          <p className="text-xs text-secondary-600 dark:text-secondary-400 mb-2">Common soft skills:</p>
          <div className="flex flex-wrap gap-2">
            {suggestedSoft
              .filter((skill) => !safeData.soft.includes(skill))
              .map((skill) => (
                <button
                  key={skill}
                  onClick={() => addSuggested(skill, 'soft')}
                  className="bg-secondary-100 dark:bg-secondary-800 text-secondary-700 dark:text-secondary-300 px-3 py-1 rounded-full text-xs hover:bg-secondary-200 dark:hover:bg-secondary-700 transition-colors"
                >
                  + {skill}
                </button>
              ))}
          </div>
        </div>
      </div>

      <div className="bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-800 rounded-lg p-4">
        <p className="text-sm text-primary-800 dark:text-primary-300">
          <strong>Pro Tip:</strong> Focus on skills mentioned in the job description. ATS systems
          often scan for specific keywords!
        </p>
      </div>
    </div>
  )
}
