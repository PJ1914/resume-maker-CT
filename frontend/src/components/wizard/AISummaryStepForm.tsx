import { useState, useEffect } from 'react'
import { Sparkles, Loader2, RefreshCw, Edit2, Check, BookOpen, Wand2 } from 'lucide-react'
import { AIEnhancedTextarea } from '../ui/ai-enhanced-textarea'
import { apiClient } from '@/services/api'
import toast from 'react-hot-toast'
import { motion, AnimatePresence } from 'framer-motion'
import InsufficientCreditsModal from '../InsufficientCreditsModal'

interface AISummaryStepFormProps {
  data: string
  onChange: (data: string) => void
  resumeData: any
}

export default function AISummaryStepForm({ data, onChange, resumeData }: AISummaryStepFormProps) {
  const [isGenerating, setIsGenerating] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [editedSummary, setEditedSummary] = useState(data)
  const [hasGenerated, setHasGenerated] = useState(!!data)
  const [showCreditsModal, setShowCreditsModal] = useState(false)
  const [creditsInfo, setCreditsInfo] = useState({ required: 1, current: 0 })

  useEffect(() => {
    setEditedSummary(data)
  }, [data])

  const generateSummary = async () => {
    try {
      setIsGenerating(true)

      // Call backend to generate AI summary
      const response: any = await apiClient.post('/api/ai/generate-summary', {
        contact: resumeData.contact,
        experience: resumeData.experience,
        education: resumeData.education,
        skills: resumeData.skills,
        projects: resumeData.projects,
        certifications: resumeData.certifications,
        achievements: resumeData.achievements,
      })

      if (response && response.summary) {
        onChange(response.summary)
        setEditedSummary(response.summary)
        setHasGenerated(true)
        toast.success('✨ Professional summary generated!')
      }
    } catch (error: any) {
      console.error('Generate summary error:', error)
      
      // Handle insufficient credits (402 Payment Required)
      if (error?.response?.status === 402) {
        const errorDetail = error.response.data
        setCreditsInfo({
          required: errorDetail.required || 1,
          current: errorDetail.current_balance || 0
        })
        setShowCreditsModal(true)
        return
      }
      
      const errorMsg = error.response?.data?.detail || 'Failed to generate summary'
      toast.error(errorMsg)
    } finally {
      setIsGenerating(false)
    }
  }

  const handleSaveEdit = () => {
    onChange(editedSummary)
    setIsEditing(false)
    toast.success('Summary updated!')
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-secondary-100 dark:bg-secondary-800 rounded-lg">
            <BookOpen className="h-6 w-6 text-secondary-900 dark:text-white" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-secondary-900 dark:text-white">Professional Summary</h2>
        </div>
        <p className="text-sm sm:text-base text-secondary-600 dark:text-secondary-400 ml-11">
          {!hasGenerated
            ? 'AI will craft a compelling professional summary tailored to your experience'
            : 'Your AI-generated professional summary. Edit or regenerate for alternatives.'}
        </p>
      </div>

      {/* Generate Button Section */}
      {!hasGenerated && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-2xl border-2 border-secondary-300 dark:border-secondary-700 bg-white dark:bg-secondary-900 shadow-lg hover:shadow-xl transition-shadow"
        >
          <div className="absolute top-0 right-0 -mt-8 -mr-8 w-32 h-32 bg-secondary-200/20 rounded-full blur-2xl" />
          <div className="absolute bottom-0 left-0 -mb-8 -ml-8 w-32 h-32 bg-secondary-200/20 rounded-full blur-2xl" />

          <div className="relative p-8 sm:p-10">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-3">
                  <Wand2 className="h-6 w-6 text-secondary-900 dark:text-white" />
                  <h3 className="text-2xl font-bold text-secondary-900 dark:text-white">
                    Generate Professional Summary
                  </h3>
                </div>
                <p className="text-secondary-700 dark:text-secondary-300 text-base leading-relaxed max-w-xl">
                  Let our AI analyze your experience and skills to craft a compelling, ATS-friendly professional summary in seconds.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                <button
                  onClick={() => setIsEditing(true)}
                  className="px-6 py-3 bg-white dark:bg-secondary-900 border-2 border-secondary-300 dark:border-secondary-700 text-secondary-900 dark:text-white rounded-xl font-semibold hover:bg-secondary-50 dark:hover:bg-secondary-800 transition-all shadow-md flex items-center justify-center gap-2 whitespace-nowrap"
                >
                  <Edit2 className="w-5 h-5" />
                  Write Manually
                </button>
                <button
                  onClick={generateSummary}
                  disabled={isGenerating}
                  className="px-8 py-3 bg-secondary-900 hover:bg-secondary-800 dark:bg-white dark:hover:bg-secondary-100 text-white dark:text-secondary-900 rounded-xl font-bold shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 group whitespace-nowrap"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Generating...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5 group-hover:scale-110 transition-transform" />
                      <span>Generate with AI</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Display Generated Summary */}
      {hasGenerated && !isEditing && (
        <AnimatePresence mode="wait">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
          >
            {/* Summary Display Box */}
            <div className="relative overflow-hidden rounded-2xl border-2 border-secondary-300 dark:border-secondary-700 bg-white dark:bg-secondary-900 p-8 shadow-lg group hover:shadow-xl transition-all">
              <div className="absolute top-0 right-0 -mt-12 -mr-12 w-40 h-40 bg-secondary-200/10 rounded-full blur-3xl" />

              <div className="relative">
                {/* Badge */}
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-secondary-100 dark:bg-secondary-800 rounded-full mb-6 border border-secondary-300 dark:border-secondary-700 shadow-sm">
                  <Sparkles className="w-4 h-4 text-secondary-900 dark:text-white" />
                  <span className="text-sm font-bold text-secondary-900 dark:text-white">AI Generated</span>
                </div>

                {/* Summary Text */}
                <p className="text-lg sm:text-xl leading-relaxed text-secondary-900 dark:text-white font-medium italic mb-6">
                  "{data}"
                </p>

                {/* Stats */}
                <div className="flex flex-wrap gap-6 text-sm">
                  <div>
                    <p className="text-secondary-500 dark:text-secondary-400">Characters</p>
                    <p className="text-lg font-bold text-secondary-900 dark:text-white">{data.length}</p>
                  </div>
                  <div>
                    <p className="text-secondary-500 dark:text-secondary-400">Words</p>
                    <p className="text-lg font-bold text-secondary-900 dark:text-white">
                      {data.split(' ').filter((w) => w.length > 0).length}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 justify-end">
              <button
                onClick={() => setIsEditing(true)}
                className="px-6 py-3 bg-white dark:bg-secondary-800 border-2 border-secondary-300 dark:border-secondary-700 text-secondary-900 dark:text-white rounded-xl font-semibold hover:bg-secondary-50 dark:hover:bg-secondary-700 transition-all shadow-md flex items-center justify-center gap-2"
              >
                <Edit2 className="w-4 h-4" />
                Edit
              </button>
              <button
                onClick={generateSummary}
                disabled={isGenerating}
                className="px-6 py-3 bg-secondary-900 hover:bg-secondary-800 dark:bg-white dark:hover:bg-secondary-100 text-white dark:text-secondary-900 rounded-xl font-bold shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Regenerating...
                  </>
                ) : (
                  <>
                    <RefreshCw className="w-4 h-4" />
                    Regenerate
                  </>
                )}
              </button>
            </div>
          </motion.div>
        </AnimatePresence>
      )}

      {/* Edit Mode */}
      {isEditing && (
        <AnimatePresence>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6 bg-white dark:bg-secondary-900 rounded-2xl border-2 border-secondary-300 dark:border-secondary-700 p-8 shadow-lg"
          >
            <div>
              <label className="block text-base font-bold text-secondary-900 dark:text-white mb-3">
                Edit Your Summary
              </label>

              <AIEnhancedTextarea
                value={editedSummary}
                onChange={(e) => setEditedSummary(e.target.value)}
                context="summary"
                rows={6}
                className="w-full rounded-xl border-2 border-secondary-300 dark:border-secondary-700 bg-white dark:bg-secondary-950 text-secondary-900 dark:text-white placeholder-secondary-400 dark:placeholder-secondary-600 shadow-md focus:border-secondary-600 focus:ring-2 focus:ring-secondary-600 focus:ring-opacity-50 sm:text-base resize-none p-4 font-medium"
                placeholder="Edit your professional summary..."
              />

              {/* Stats */}
              <div className="flex items-center justify-between mt-4 px-4 py-3 bg-secondary-100 dark:bg-secondary-800 rounded-lg">
                <div className="text-sm">
                  <p className="text-secondary-600 dark:text-secondary-400">
                    <span className="font-bold text-secondary-900 dark:text-white">{editedSummary.length}</span> characters
                  </p>
                </div>
                <div className="text-sm">
                  <p className="text-secondary-600 dark:text-secondary-400">
                    <span className="font-bold text-secondary-900 dark:text-white">
                      {editedSummary.split(' ').filter((w) => w.length > 0).length}
                    </span> words
                  </p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setEditedSummary(data)
                  setIsEditing(false)
                }}
                className="flex-1 px-6 py-3 bg-white dark:bg-secondary-800 border-2 border-secondary-300 dark:border-secondary-700 text-secondary-900 dark:text-white rounded-xl font-semibold hover:bg-secondary-50 dark:hover:bg-secondary-700 transition-all shadow-md"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveEdit}
                className="flex-1 px-6 py-3 bg-secondary-900 hover:bg-secondary-800 dark:bg-white dark:hover:bg-secondary-100 text-white dark:text-secondary-900 rounded-xl font-bold shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2"
              >
                <Check className="w-5 h-5" />
                Save Changes
              </button>
            </div>
          </motion.div>
        </AnimatePresence>
      )}
      
      {/* Insufficient Credits Modal */}
      <InsufficientCreditsModal
        isOpen={showCreditsModal}
        onClose={() => setShowCreditsModal(false)}
        featureName="AI Summary Generation"
        requiredCredits={creditsInfo.required}
        currentBalance={creditsInfo.current}
      />
    </div>
  )
}
