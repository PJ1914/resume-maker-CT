import { Plus, X, Globe } from 'lucide-react'
import { useState } from 'react'

interface Language {
  name: string
  proficiency: string
}

interface LanguagesStepFormProps {
  data: Language[]
  onChange: (data: Language[]) => void
}

export default function LanguagesStepForm({ data, onChange }: LanguagesStepFormProps) {
  // Ensure data is an array
  const safeData = Array.isArray(data) ? data : []
  
  const [form, setForm] = useState({
    name: '',
    proficiency: 'Professional',
  })

  const proficiencyLevels = ['Native', 'Fluent', 'Professional', 'Intermediate', 'Basic']

  const addLanguage = () => {
    if (form.name.trim()) {
      onChange([...safeData, { ...form }])
      setForm({ name: '', proficiency: 'Professional' })
    }
  }

  const removeLanguage = (index: number) => {
    onChange(safeData.filter((_, i) => i !== index))
  }

  const handleInputChange = (field: keyof typeof form, value: string) => {
    setForm({ ...form, [field]: value })
  }

  return (
    <div className="space-y-8">
      <div>
        <div className="flex items-center gap-2 mb-2">
          <Globe className="h-6 w-6 text-primary-900" />
          <h2 className="text-2xl font-bold text-secondary-900">Languages</h2>
        </div>
        <p className="text-secondary-600">
          List languages you speak and your proficiency level in each.
        </p>
      </div>

      {/* Add Language Form */}
      <div className="border border-secondary-300 rounded-lg p-6 bg-secondary-50">
        <h3 className="text-lg font-semibold text-secondary-900 mb-4">Add Language</h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-secondary-700 mb-1">
              Language Name *
            </label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              placeholder="e.g., Spanish, French, Mandarin"
              className="w-full px-4 py-2.5 border border-secondary-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-secondary-700 mb-1">
              Proficiency Level
            </label>
            <select
              value={form.proficiency}
              onChange={(e) => handleInputChange('proficiency', e.target.value)}
              className="w-full px-4 py-2.5 border border-secondary-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white"
            >
              {proficiencyLevels.map((level) => (
                <option key={level} value={level}>
                  {level}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={addLanguage}
            className="btn-primary w-full flex items-center justify-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Add Language
          </button>
        </div>
      </div>

      {/* Languages List */}
      {safeData.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-secondary-900">Your Languages</h3>
          {safeData.map((lang, index) => (
            <div
              key={index}
              className="border border-secondary-200 rounded-lg p-4 bg-white hover:bg-secondary-50 transition-colors"
            >
              <div className="flex justify-between items-start gap-4">
                <div className="flex-1">
                  <h4 className="font-semibold text-secondary-900">{lang.name}</h4>
                  <p className="text-sm text-secondary-600">{lang.proficiency}</p>
                </div>
                <button
                  onClick={() => removeLanguage(index)}
                  className="text-secondary-500 hover:text-red-600 transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {safeData.length === 0 && (
        <div className="bg-secondary-50 border border-secondary-200 rounded-lg p-6 text-center">
          <Globe className="h-8 w-8 text-secondary-400 mx-auto mb-2" />
          <p className="text-secondary-600">No languages added yet</p>
        </div>
      )}
    </div>
  )
}
