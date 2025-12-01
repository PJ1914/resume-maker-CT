import { Plus, X, Star } from 'lucide-react'
import { useState } from 'react'

interface Achievement {
  title: string
  description: string
  date: string
}

interface AchievementsStepFormProps {
  data: Achievement[]
  onChange: (data: Achievement[]) => void
}

export default function AchievementsStepForm({ data, onChange }: AchievementsStepFormProps) {
  // Ensure data is an array
  const safeData = Array.isArray(data) ? data : []

  const [form, setForm] = useState({
    title: '',
    description: '',
    date: '',
  })

  const addAchievement = () => {
    if (form.title.trim()) {
      onChange([...safeData, { ...form }])
      setForm({ title: '', description: '', date: '' })
    }
  }

  const removeAchievement = (index: number) => {
    onChange(safeData.filter((_, i) => i !== index))
  }

  const handleInputChange = (field: keyof typeof form, value: string) => {
    setForm({ ...form, [field]: value })
  }

  return (
    <div className="space-y-8">
      <div>
        <div className="flex items-center gap-2 mb-2">
          <Star className="h-6 w-6 text-primary-900 dark:text-primary-400" />
          <h2 className="text-2xl font-bold text-secondary-900 dark:text-white">Achievements</h2>
        </div>
        <p className="text-secondary-600 dark:text-secondary-400">
          Highlight notable achievements, awards, or recognition you've received.
        </p>
      </div>

      {/* Add Achievement Form */}
      <div className="border border-secondary-300 dark:border-secondary-700 rounded-lg p-6 bg-white dark:bg-secondary-900 shadow-sm">
        <h3 className="text-lg font-semibold text-secondary-900 dark:text-white mb-4">Add Achievement</h3>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-1">
              Achievement Title *
            </label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              placeholder="e.g., Top Performer Award, Employee of the Month"
              className="w-full px-4 py-2.5 border border-secondary-300 dark:border-secondary-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white dark:bg-secondary-950 text-secondary-900 dark:text-white placeholder-secondary-400 dark:placeholder-secondary-600"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-1">
              Description
            </label>
            <textarea
              value={form.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Brief description of the achievement and why it's notable"
              rows={3}
              className="w-full px-4 py-2.5 border border-secondary-300 dark:border-secondary-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none bg-white dark:bg-secondary-950 text-secondary-900 dark:text-white placeholder-secondary-400 dark:placeholder-secondary-600"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-1">
              Date
            </label>
            <input
              type="text"
              value={form.date}
              onChange={(e) => handleInputChange('date', e.target.value)}
              placeholder="e.g., Jan 2024 or 2024"
              className="w-full px-4 py-2.5 border border-secondary-300 dark:border-secondary-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white dark:bg-secondary-950 text-secondary-900 dark:text-white placeholder-secondary-400 dark:placeholder-secondary-600"
            />
          </div>

          <button
            onClick={addAchievement}
            className="btn-primary w-full flex items-center justify-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Add Achievement
          </button>
        </div>
      </div>

      {/* Achievements List */}
      {safeData.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-secondary-900 dark:text-white">Your Achievements</h3>
          {safeData.map((achievement, index) => (
            <div
              key={index}
              className="border border-secondary-200 dark:border-secondary-800 rounded-lg p-4 bg-white dark:bg-secondary-900 hover:bg-secondary-50 dark:hover:bg-secondary-800 transition-colors"
            >
              <div className="flex justify-between items-start gap-4">
                <div className="flex-1">
                  <h4 className="font-semibold text-secondary-900 dark:text-white">{achievement.title}</h4>
                  {achievement.description && (
                    <p className="text-sm text-secondary-600 dark:text-secondary-400 mt-1">{achievement.description}</p>
                  )}
                  {achievement.date && (
                    <p className="text-xs text-secondary-500 dark:text-secondary-500 mt-1">{achievement.date}</p>
                  )}
                </div>
                <button
                  onClick={() => removeAchievement(index)}
                  className="text-secondary-500 dark:text-secondary-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {safeData.length === 0 && (
        <div className="bg-secondary-50 dark:bg-secondary-900 border border-secondary-200 dark:border-secondary-800 rounded-lg p-6 text-center">
          <Star className="h-8 w-8 text-secondary-400 dark:text-secondary-500 mx-auto mb-2" />
          <p className="text-secondary-600 dark:text-secondary-400">No achievements added yet</p>
        </div>
      )}
    </div>
  )
}
