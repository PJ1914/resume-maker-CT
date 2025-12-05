import { Plus, X, Star, Award, Calendar as CalendarIcon } from 'lucide-react'
import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

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
  
  const [showDatePicker, setShowDatePicker] = useState(false)
  const [calendarDate, setCalendarDate] = useState(new Date())
  const datePickerRef = useRef<HTMLDivElement>(null)

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

  // Close date picker when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (datePickerRef.current && !datePickerRef.current.contains(event.target as Node)) {
        setShowDatePicker(false)
      }
    }

    if (showDatePicker) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [showDatePicker])

  // Format date for display
  const formatDate = (date: Date): string => {
    const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'short', day: 'numeric' }
    return date.toLocaleDateString('en-US', options)
  }

  // Handle date selection from calendar
  const handleDateSelect = (day: number) => {
    const selectedDate = new Date(calendarDate.getFullYear(), calendarDate.getMonth(), day)
    const formattedDate = formatDate(selectedDate)
    setForm({ ...form, date: formattedDate })
    setShowDatePicker(false)
  }

  // Get calendar days
  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()
  }

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay()
  }

  const calendarDays = Array.from({ length: getDaysInMonth(calendarDate) }, (_, i) => i + 1)
  const firstDay = getFirstDayOfMonth(calendarDate)
  const emptyDays = Array.from({ length: firstDay }, (_, i) => i)

  return (
    <div className="space-y-8">
      <div>
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-secondary-100 dark:bg-secondary-800 rounded-lg">
            <Award className="h-6 w-6 text-secondary-900 dark:text-white" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-secondary-900 dark:text-white">Achievements & Awards</h2>
        </div>
        <p className="text-sm sm:text-base text-secondary-600 dark:text-secondary-400 ml-11">
          Showcase notable achievements, awards, or recognition you've received
        </p>
      </div>

      {/* Add Achievement Form */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-2xl border-2 border-secondary-300 dark:border-secondary-700 bg-white dark:bg-secondary-900 shadow-lg hover:shadow-xl transition-shadow"
      >
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-32 h-32 bg-secondary-200/20 rounded-full blur-2xl" />
        
        <div className="relative p-6 sm:p-8">
          <h3 className="text-lg font-semibold text-secondary-900 dark:text-white mb-6 flex items-center gap-2">
            <Plus className="h-5 w-5 text-secondary-900 dark:text-white" />
            Add New Achievement
          </h3>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-secondary-700 dark:text-secondary-300 mb-2">
                Achievement Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={form.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                placeholder="e.g., Employee of the Month, Outstanding Performance Award"
                className="w-full px-4 py-3 border-2 border-secondary-300 dark:border-secondary-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-secondary-600 focus:border-transparent bg-white dark:bg-secondary-950 text-secondary-900 dark:text-white placeholder-secondary-400 dark:placeholder-secondary-600 transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-secondary-700 dark:text-secondary-300 mb-2">
                Description
              </label>
              <textarea
                value={form.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Brief description of what made this achievement notable..."
                rows={3}
                className="w-full px-4 py-3 border-2 border-secondary-300 dark:border-secondary-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-secondary-600 focus:border-transparent resize-none bg-white dark:bg-secondary-950 text-secondary-900 dark:text-white placeholder-secondary-400 dark:placeholder-secondary-600 transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-secondary-700 dark:text-secondary-300 mb-2">
                Date
              </label>
              <div className="relative" ref={datePickerRef}>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={form.date}
                    onChange={(e) => handleInputChange('date', e.target.value)}
                    placeholder="e.g., January 2024 or 2024"
                    className="flex-1 px-4 py-3 border-2 border-secondary-300 dark:border-secondary-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-secondary-600 focus:border-transparent bg-white dark:bg-secondary-950 text-secondary-900 dark:text-white placeholder-secondary-400 dark:placeholder-secondary-600 transition-all"
                  />
                  <button
                    onClick={() => setShowDatePicker(!showDatePicker)}
                    className="px-4 py-3 bg-secondary-100 dark:bg-secondary-800 hover:bg-secondary-200 dark:hover:bg-secondary-700 text-secondary-900 dark:text-white rounded-xl transition-all border-2 border-secondary-300 dark:border-secondary-700"
                    title="Open date picker"
                  >
                    <CalendarIcon className="h-5 w-5" />
                  </button>
                </div>

                {/* Date Picker Popup */}
                <AnimatePresence>
                  {showDatePicker && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="absolute top-full mt-2 left-0 z-50 bg-white dark:bg-secondary-900 border-2 border-secondary-300 dark:border-secondary-700 rounded-xl shadow-lg p-4"
                    >
                      {/* Calendar Header */}
                      <div className="flex items-center justify-between mb-4">
                        <button
                          onClick={() => setCalendarDate(new Date(calendarDate.getFullYear(), calendarDate.getMonth() - 1))}
                          className="p-1 hover:bg-secondary-100 dark:hover:bg-secondary-800 rounded-lg transition-all"
                        >
                          <X className="h-4 w-4 rotate-45 text-secondary-600 dark:text-secondary-400" />
                        </button>
                        <h3 className="text-sm font-semibold text-secondary-900 dark:text-white">
                          {calendarDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                        </h3>
                        <button
                          onClick={() => setCalendarDate(new Date(calendarDate.getFullYear(), calendarDate.getMonth() + 1))}
                          className="p-1 hover:bg-secondary-100 dark:hover:bg-secondary-800 rounded-lg transition-all"
                        >
                          <Plus className="h-4 w-4 text-secondary-600 dark:text-secondary-400" />
                        </button>
                      </div>

                      {/* Days of week */}
                      <div className="grid grid-cols-7 gap-1 mb-2">
                        {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day) => (
                          <div key={day} className="h-6 flex items-center justify-center text-xs font-semibold text-secondary-500 dark:text-secondary-400">
                            {day}
                          </div>
                        ))}
                      </div>

                      {/* Calendar Days */}
                      <div className="grid grid-cols-7 gap-1">
                        {emptyDays.map((i) => (
                          <div key={`empty-${i}`} className="h-7" />
                        ))}
                        {calendarDays.map((day) => (
                          <button
                            key={day}
                            onClick={() => handleDateSelect(day)}
                            className="h-7 w-7 flex items-center justify-center text-xs rounded-lg hover:bg-secondary-900 dark:hover:bg-white hover:text-white dark:hover:text-secondary-900 text-secondary-900 dark:text-white transition-all"
                          >
                            {day}
                          </button>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            <button
              onClick={addAchievement}
              className="w-full px-6 py-3 bg-secondary-900 hover:bg-secondary-800 dark:bg-white dark:hover:bg-secondary-100 text-white dark:text-secondary-900 rounded-xl font-semibold flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transition-all transform hover:scale-105"
            >
              <Plus className="h-5 w-5" />
              Add Achievement
            </button>
          </div>
        </div>
      </motion.div>

      {/* Achievements List */}
      {safeData.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="space-y-4"
        >
          <h3 className="text-lg font-semibold text-secondary-900 dark:text-white flex items-center gap-2">
            <Star className="h-5 w-5 text-secondary-900 dark:text-white" />
            Your Achievements ({safeData.length})
          </h3>
          
          <AnimatePresence mode="popLayout">
            {safeData.map((achievement, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="group relative overflow-hidden rounded-xl border-2 border-secondary-300 dark:border-secondary-700 bg-white dark:bg-secondary-900 p-5 sm:p-6 hover:shadow-lg transition-all hover:border-secondary-400 dark:hover:border-secondary-600"
              >
                <div className="absolute top-0 right-0 -mt-2 -mr-2 w-16 h-16 bg-secondary-200/10 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
                
                <div className="relative flex justify-between items-start gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start gap-3">
                      <Star className="h-5 w-5 text-secondary-900 dark:text-white flex-shrink-0 mt-1" />
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-secondary-900 dark:text-white text-base sm:text-lg leading-tight">
                          {achievement.title}
                        </h4>
                        {achievement.description && (
                          <p className="text-sm text-secondary-600 dark:text-secondary-400 mt-2 leading-relaxed">
                            {achievement.description}
                          </p>
                        )}
                        {achievement.date && (
                          <p className="text-xs font-medium text-secondary-700 dark:text-secondary-300 mt-2 bg-secondary-100 dark:bg-secondary-800 px-2.5 py-1 rounded-full w-fit">
                            {achievement.date}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => removeAchievement(index)}
                    className="flex-shrink-0 p-2 text-secondary-400 dark:text-secondary-500 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/20 rounded-lg transition-all"
                    title="Delete achievement"
                  >
                    <X className="h-5 w-5" />
                  </motion.button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      )}

      {safeData.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="relative overflow-hidden rounded-2xl border-2 border-dashed border-secondary-300 dark:border-secondary-700 bg-secondary-50 dark:bg-secondary-950 p-12 text-center"
        >
          <div className="absolute top-0 right-0 -mt-8 -mr-8 w-24 h-24 bg-secondary-200/5 rounded-full blur-2xl" />
          
          <div className="relative">
            <Award className="h-12 w-12 text-secondary-300 dark:text-secondary-600 mx-auto mb-3" />
            <p className="text-secondary-600 dark:text-secondary-400 font-medium">
              No achievements added yet
            </p>
            <p className="text-xs text-secondary-500 dark:text-secondary-500 mt-1">
              Start by adding your first achievement above
            </p>
          </div>
        </motion.div>
      )}
    </div>
  )
}
