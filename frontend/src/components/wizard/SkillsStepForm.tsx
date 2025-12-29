import { Plus, X, Code, Trash2 } from 'lucide-react'
import { useState } from 'react'

interface SkillCategory {
  category: string
  items: string[]
}

interface SkillsStepFormProps {
  data: SkillCategory[] | { technical: string[]; soft: string[] }
  onChange: (data: SkillCategory[]) => void
}

// Suggested categories for quick add
const SUGGESTED_CATEGORIES = [
  'Languages',
  'Frameworks',
  'Databases',
  'Tools',
  'Cloud & DevOps',
  'Soft Skills',
]

export default function SkillsStepForm({ data, onChange }: SkillsStepFormProps) {
  // Normalize data - convert old format to new format if needed
  const normalizeData = (): SkillCategory[] => {
    if (Array.isArray(data)) {
      return data.filter(cat => cat.category && cat.items.length > 0)
    }
    // Old format: { technical: [], soft: [] }
    const normalized: SkillCategory[] = []
    if (data?.technical?.length > 0) {
      normalized.push({ category: 'Technical', items: data.technical })
    }
    if (data?.soft?.length > 0) {
      normalized.push({ category: 'Soft Skills', items: data.soft })
    }
    return normalized
  }

  const [categories, setCategories] = useState<SkillCategory[]>(normalizeData)
  const [newCategoryName, setNewCategoryName] = useState('')
  const [activeCategory, setActiveCategory] = useState<number | null>(categories.length > 0 ? 0 : null)
  const [skillInput, setSkillInput] = useState('')

  // Add new category
  const addCategory = (categoryName: string) => {
    if (!categoryName.trim()) return
    // Check if category already exists
    if (categories.some(c => c.category.toLowerCase() === categoryName.toLowerCase())) {
      return
    }
    const newCategories = [...categories, { category: categoryName.trim(), items: [] }]
    setCategories(newCategories)
    onChange(newCategories)
    setActiveCategory(newCategories.length - 1)
    setNewCategoryName('')
  }

  // Remove category
  const removeCategory = (index: number) => {
    const newCategories = categories.filter((_, i) => i !== index)
    setCategories(newCategories)
    onChange(newCategories)
    if (activeCategory === index) {
      setActiveCategory(newCategories.length > 0 ? 0 : null)
    } else if (activeCategory !== null && activeCategory > index) {
      setActiveCategory(activeCategory - 1)
    }
  }

  // Add skill to active category
  const addSkill = () => {
    if (!skillInput.trim() || activeCategory === null) return
    const newCategories = [...categories]
    if (!newCategories[activeCategory].items.includes(skillInput.trim())) {
      newCategories[activeCategory].items.push(skillInput.trim())
      setCategories(newCategories)
      onChange(newCategories)
    }
    setSkillInput('')
  }

  // Remove skill from category
  const removeSkill = (categoryIndex: number, skillIndex: number) => {
    const newCategories = [...categories]
    newCategories[categoryIndex].items.splice(skillIndex, 1)
    setCategories(newCategories)
    onChange(newCategories)
  }

  // Get suggested skills based on category
  const getSuggestedSkills = (categoryName: string): string[] => {
    const lowerName = categoryName.toLowerCase()
    if (lowerName.includes('language')) {
      return ['Python', 'JavaScript', 'Java', 'C++', 'TypeScript', 'Go', 'Rust', 'PHP', 'C#', 'Swift']
    }
    if (lowerName.includes('framework')) {
      return ['React', 'Angular', 'Vue.js', 'Node.js', 'Django', 'Flask', 'FastAPI', 'Spring Boot', 'Express.js', 'Next.js']
    }
    if (lowerName.includes('database')) {
      return ['MySQL', 'PostgreSQL', 'MongoDB', 'Redis', 'Firebase', 'DynamoDB', 'SQLite', 'Oracle']
    }
    if (lowerName.includes('tool') || lowerName.includes('devops') || lowerName.includes('cloud')) {
      return ['Git', 'Docker', 'Kubernetes', 'AWS', 'Azure', 'GCP', 'Jenkins', 'Terraform', 'Linux', 'CI/CD']
    }
    if (lowerName.includes('soft')) {
      return ['Leadership', 'Communication', 'Teamwork', 'Problem Solving', 'Time Management', 'Critical Thinking']
    }
    return ['Python', 'JavaScript', 'React', 'Node.js', 'SQL', 'Git']
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl sm:text-2xl font-bold text-secondary-900 dark:text-white mb-2">Skills</h2>
        <p className="text-sm sm:text-base text-secondary-600 dark:text-secondary-400">
          Organize your skills into categories for better ATS optimization. Add categories like Languages, Frameworks, Databases, Tools, etc.
        </p>
      </div>

      {/* Add Category Section */}
      <div className="bg-secondary-50 dark:bg-secondary-800/50 rounded-lg p-4 border border-secondary-200 dark:border-secondary-700">
        <h3 className="text-sm font-semibold text-secondary-900 dark:text-white mb-3">Add Skill Category</h3>

        {/* Quick Add Buttons */}
        <div className="flex flex-wrap gap-2 mb-3">
          {SUGGESTED_CATEGORIES.filter(cat =>
            !categories.some(c => c.category.toLowerCase() === cat.toLowerCase())
          ).map((cat) => (
            <button
              key={cat}
              onClick={() => addCategory(cat)}
              className="px-3 py-1.5 text-xs bg-white dark:bg-secondary-700 text-secondary-700 dark:text-secondary-300 rounded-full border border-secondary-300 dark:border-secondary-600 hover:bg-primary-50 dark:hover:bg-primary-900/30 hover:border-primary-300 dark:hover:border-primary-700 transition-colors"
            >
              + {cat}
            </button>
          ))}
        </div>

        {/* Custom Category Input */}
        <div className="flex gap-2">
          <input
            type="text"
            value={newCategoryName}
            onChange={(e) => setNewCategoryName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault()
                addCategory(newCategoryName)
              }
            }}
            placeholder="Or type custom category name..."
            className="flex-1 px-3 py-2 bg-white dark:bg-secondary-800 border border-secondary-300 dark:border-secondary-700 rounded-lg text-sm text-secondary-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
          <button
            onClick={() => addCategory(newCategoryName)}
            disabled={!newCategoryName.trim()}
            className="px-4 py-2 bg-primary-900 dark:bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-800 dark:hover:bg-primary-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
          >
            <Plus className="h-4 w-4" />
            Add
          </button>
        </div>
      </div>

      {/* Categories List */}
      {categories.length > 0 ? (
        <div className="space-y-4">
          {/* Category Tabs */}
          <div className="flex flex-wrap gap-2 border-b border-secondary-200 dark:border-secondary-700 pb-3">
            {categories.map((cat, index) => (
              <button
                key={index}
                onClick={() => setActiveCategory(index)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${activeCategory === index
                    ? 'bg-primary-900 dark:bg-primary-600 text-white'
                    : 'bg-secondary-100 dark:bg-secondary-800 text-secondary-700 dark:text-secondary-300 hover:bg-secondary-200 dark:hover:bg-secondary-700'
                  }`}
              >
                <Code className="h-4 w-4" />
                {cat.category}
                <span className="bg-white/20 dark:bg-black/20 px-1.5 py-0.5 rounded text-xs">
                  {cat.items.length}
                </span>
              </button>
            ))}
          </div>

          {/* Active Category Content */}
          {activeCategory !== null && categories[activeCategory] && (
            <div className="bg-white dark:bg-secondary-900 rounded-xl border border-secondary-200 dark:border-secondary-800 p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-secondary-900 dark:text-white">
                  {categories[activeCategory].category}
                </h3>
                <button
                  onClick={() => removeCategory(activeCategory)}
                  className="text-red-500 hover:text-red-600 dark:text-red-400 dark:hover:text-red-300 p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                  title="Remove category"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>

              {/* Add Skill Input */}
              <div className="flex gap-2 mb-4">
                <input
                  type="text"
                  value={skillInput}
                  onChange={(e) => setSkillInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      addSkill()
                    }
                  }}
                  placeholder="Type a skill and press Enter"
                  className="flex-1 px-4 py-2.5 bg-white dark:bg-secondary-800 border border-secondary-300 dark:border-secondary-700 rounded-lg text-secondary-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
                />
                <button
                  onClick={addSkill}
                  className="btn-primary flex items-center gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Add
                </button>
              </div>

              {/* Skills in Category */}
              {categories[activeCategory].items.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {categories[activeCategory].items.map((skill, skillIndex) => (
                    <div
                      key={skillIndex}
                      className="bg-primary-100 dark:bg-primary-900/40 text-primary-700 dark:text-primary-300 px-3 py-1.5 rounded-full flex items-center gap-2 text-sm font-medium"
                    >
                      {skill}
                      <button
                        onClick={() => removeSkill(activeCategory, skillIndex)}
                        className="hover:bg-primary-200 dark:hover:bg-primary-800 rounded-full p-0.5"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Suggested Skills */}
              <div>
                <p className="text-xs text-secondary-600 dark:text-secondary-400 mb-2">Suggested skills:</p>
                <div className="flex flex-wrap gap-2">
                  {getSuggestedSkills(categories[activeCategory].category)
                    .filter((skill) => !categories[activeCategory].items.includes(skill))
                    .slice(0, 8)
                    .map((skill) => (
                      <button
                        key={skill}
                        onClick={() => {
                          const newCategories = [...categories]
                          if (!newCategories[activeCategory].items.includes(skill)) {
                            newCategories[activeCategory].items.push(skill)
                            setCategories(newCategories)
                            onChange(newCategories)
                          }
                        }}
                        className="bg-secondary-100 dark:bg-secondary-800 text-secondary-700 dark:text-secondary-300 px-3 py-1 rounded-full text-xs hover:bg-secondary-200 dark:hover:bg-secondary-700 transition-colors"
                      >
                        + {skill}
                      </button>
                    ))}
                </div>
              </div>
            </div>
          )}

          {/* Preview of all categories */}
          <div className="bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-800 rounded-lg p-4">
            <h4 className="text-sm font-semibold text-primary-900 dark:text-primary-200 mb-2">📄 Preview (How it will appear on your resume)</h4>
            <div className="space-y-1 text-sm">
              {categories.map((cat, index) => (
                cat.items.length > 0 && (
                  <p key={index} className="text-secondary-800 dark:text-secondary-200">
                    <span className="font-semibold">{cat.category}:</span>{' '}
                    {cat.items.join(', ')}
                  </p>
                )
              ))}
              {categories.every(c => c.items.length === 0) && (
                <p className="text-secondary-500 dark:text-secondary-400 italic">Add skills to see preview...</p>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white dark:bg-secondary-900 rounded-xl border border-secondary-200 dark:border-secondary-800 p-8 text-center">
          <Code className="h-12 w-12 mx-auto text-secondary-400 dark:text-secondary-600 mb-4" />
          <h3 className="text-lg font-semibold text-secondary-900 dark:text-white mb-2">No skill categories yet</h3>
          <p className="text-sm text-secondary-600 dark:text-secondary-400 mb-4">
            Add categories like "Languages", "Frameworks", "Tools" to organize your skills professionally.
          </p>
        </div>
      )}

      <div className="bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-800 rounded-lg p-4">
        <p className="text-sm text-primary-800 dark:text-primary-300">
          <strong>Pro Tip:</strong> Organize skills into specific categories (Languages, Frameworks, Databases, Tools)
          instead of just "Technical Skills" - this improves ATS scanning and makes your resume more readable!
        </p>
      </div>
    </div>
  )
}
