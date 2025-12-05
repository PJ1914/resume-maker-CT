import { Calendar as CalendarIcon, X } from 'lucide-react'
import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface DatePickerProps {
  value: string
  onChange: (date: string) => void
  placeholder?: string
  label?: string
}

export function DatePicker({ value, onChange, placeholder = 'Select a date', label }: DatePickerProps) {
  const [showDatePicker, setShowDatePicker] = useState(false)
  const [calendarDate, setCalendarDate] = useState(new Date())
  const datePickerRef = useRef<HTMLDivElement>(null)

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
    onChange(formattedDate)
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

  const handleClearDate = (e: React.MouseEvent) => {
    e.stopPropagation()
    onChange('')
  }

  return (
    <div>
      {label && (
        <label className="block text-sm font-semibold text-secondary-700 dark:text-secondary-300 mb-2">
          {label}
        </label>
      )}
      <div className="relative" ref={datePickerRef}>
        <div className="flex gap-2">
          <input
            type="text"
            value={value}
            readOnly
            placeholder={placeholder}
            className="flex-1 px-4 py-3 border-2 border-secondary-300 dark:border-secondary-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-secondary-600 focus:border-transparent bg-white dark:bg-secondary-950 text-secondary-900 dark:text-white placeholder-secondary-400 dark:placeholder-secondary-600 transition-all cursor-pointer"
            onClick={() => setShowDatePicker(!showDatePicker)}
          />
          <button
            onClick={() => setShowDatePicker(!showDatePicker)}
            className="px-4 py-3 bg-secondary-100 dark:bg-secondary-800 hover:bg-secondary-200 dark:hover:bg-secondary-700 text-secondary-900 dark:text-white rounded-xl transition-all border-2 border-secondary-300 dark:border-secondary-700"
            title="Open date picker"
          >
            <CalendarIcon className="h-5 w-5" />
          </button>
          {value && (
            <button
              onClick={handleClearDate}
              className="px-4 py-3 bg-secondary-100 dark:bg-secondary-800 hover:bg-red-100 dark:hover:bg-red-900/20 text-secondary-900 dark:text-white hover:text-red-600 dark:hover:text-red-400 rounded-xl transition-all border-2 border-secondary-300 dark:border-secondary-700"
              title="Clear date"
            >
              <X className="h-5 w-5" />
            </button>
          )}
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
                  <CalendarIcon className="h-4 w-4 text-secondary-600 dark:text-secondary-400" />
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
  )
}
