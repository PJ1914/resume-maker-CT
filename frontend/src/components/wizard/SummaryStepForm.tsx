import { FileText } from 'lucide-react'
import { AIEnhancedTextarea } from '../ui/ai-enhanced-textarea'

interface SummaryStepFormProps {
  data: string
  onChange: (data: string) => void
}

export default function SummaryStepForm({ data, onChange }: SummaryStepFormProps) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl sm:text-2xl font-bold text-secondary-900 dark:text-white mb-2">Professional Summary</h2>
        <p className="text-sm sm:text-base text-secondary-600 dark:text-secondary-400">
          Write a compelling 2-3 sentence summary highlighting your experience, skills, and career
          goals.
        </p>
      </div>

      <div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-2 gap-2">
          <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300">
            Your Summary <span className="text-danger-600 dark:text-danger-400">*</span>
          </label>
        </div>
        <div className="relative">
          <AIEnhancedTextarea
            value={data}
            onChange={(e) => onChange(e.target.value)}
            context="summary"
            placeholder="Example: Results-driven software engineer with 5+ years of experience building scalable web applications..."
            rows={6}
            className="pl-10"
            required
          />
          <FileText className="absolute left-3 top-3 h-5 w-5 text-secondary-400 pointer-events-none" />
        </div>
        <div className="flex items-center justify-between mt-2">
          <p className="text-xs sm:text-sm text-secondary-500 dark:text-secondary-400">
            {data.length} / 500 characters
          </p>
          <p className="text-xs sm:text-sm text-secondary-500 dark:text-secondary-400">
            {data.split(' ').filter(w => w.length > 0).length} words
          </p>
        </div>
      </div>

      <div className="bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-800 rounded-lg p-4">
        <p className="text-sm text-primary-800 dark:text-primary-300">
          <strong>Writing Tips:</strong>
        </p>
        <ul className="list-disc list-inside text-xs sm:text-sm text-primary-800 dark:text-primary-300 mt-2 space-y-1">
          <li>Start with your job title and years of experience</li>
          <li>Highlight 2-3 key skills or achievements</li>
          <li>Mention what you're looking for (if applicable)</li>
          <li>Keep it concise - 2-3 sentences max</li>
        </ul>
      </div>

      <div className="border-t border-secondary-200 dark:border-secondary-800 pt-4">
        <h3 className="font-semibold text-secondary-900 dark:text-white mb-3 text-sm sm:text-base">Examples:</h3>
        <div className="space-y-3">
          <div className="bg-secondary-50 dark:bg-secondary-800 rounded-lg p-3 text-xs sm:text-sm text-secondary-700 dark:text-secondary-300">
            "Innovative full-stack developer with 7+ years creating responsive web applications.
            Expertise in React, Node.js, and cloud technologies. Passionate about clean code and
            user-centered design."
          </div>
          <div className="bg-secondary-50 dark:bg-secondary-800 rounded-lg p-3 text-xs sm:text-sm text-secondary-700 dark:text-secondary-300">
            "Data scientist specializing in machine learning and predictive analytics. 4 years of
            experience transforming complex datasets into actionable business insights. Proficient
            in Python, TensorFlow, and SQL."
          </div>
        </div>
      </div>
    </div>
  )
}
