import { FileText, Sparkles } from 'lucide-react'
import { useState } from 'react'

interface SummaryStepFormProps {
  data: string
  onChange: (data: string) => void
}

export default function SummaryStepForm({ data, onChange }: SummaryStepFormProps) {
  const [generatingAI, setGeneratingAI] = useState(false)

  const handleGenerateAI = async () => {
    setGeneratingAI(true)
    // TODO: Implement AI generation
    setTimeout(() => {
      onChange(
        'Results-driven software engineer with 5+ years of experience building scalable web applications. Proven track record of delivering high-quality solutions using modern technologies and best practices.'
      )
      setGeneratingAI(false)
    }, 2000)
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-secondary-900 mb-2">Professional Summary</h2>
        <p className="text-secondary-600">
          Write a compelling 2-3 sentence summary highlighting your experience, skills, and career
          goals.
        </p>
      </div>

      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="block text-sm font-medium text-secondary-700">
            Your Summary <span className="text-danger-600">*</span>
          </label>
          <button
            onClick={handleGenerateAI}
            disabled={generatingAI}
            className="text-sm text-primary-900 hover:text-primary-800 flex items-center gap-1 disabled:opacity-50 font-medium"
          >
            <Sparkles className="h-4 w-4" />
            {generatingAI ? 'Generating...' : 'Generate with AI'}
          </button>
        </div>
        <div className="relative">
          <FileText className="absolute left-3 top-3 h-5 w-5 text-secondary-400" />
          <textarea
            value={data}
            onChange={(e) => onChange(e.target.value)}
            placeholder="Example: Results-driven software engineer with 5+ years of experience building scalable web applications..."
            rows={6}
            className="w-full pl-10 pr-4 py-2.5 border border-secondary-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
            required
          />
        </div>
        <div className="flex items-center justify-between mt-2">
          <p className="text-sm text-secondary-500">
            {data.length} / 500 characters
          </p>
          <p className="text-sm text-secondary-500">
            {data.split(' ').filter(w => w.length > 0).length} words
          </p>
        </div>
      </div>

      <div className="bg-primary-50 border border-primary-200 rounded-lg p-4">
        <p className="text-sm text-primary-800">
          <strong>Writing Tips:</strong>
        </p>
        <ul className="list-disc list-inside text-sm text-primary-800 mt-2 space-y-1">
          <li>Start with your job title and years of experience</li>
          <li>Highlight 2-3 key skills or achievements</li>
          <li>Mention what you're looking for (if applicable)</li>
          <li>Keep it concise - 2-3 sentences max</li>
        </ul>
      </div>

      <div className="border-t border-secondary-200 pt-4">
        <h3 className="font-semibold text-secondary-900 mb-3">Examples:</h3>
        <div className="space-y-3">
          <div className="bg-secondary-50 rounded-lg p-3 text-sm text-secondary-700">
            "Innovative full-stack developer with 7+ years creating responsive web applications.
            Expertise in React, Node.js, and cloud technologies. Passionate about clean code and
            user-centered design."
          </div>
          <div className="bg-secondary-50 rounded-lg p-3 text-sm text-secondary-700">
            "Data scientist specializing in machine learning and predictive analytics. 4 years of
            experience transforming complex datasets into actionable business insights. Proficient
            in Python, TensorFlow, and SQL."
          </div>
        </div>
      </div>
    </div>
  )
}
