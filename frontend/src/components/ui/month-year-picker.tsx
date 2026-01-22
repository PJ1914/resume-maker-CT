import { useEffect, useState } from 'react'
import { Calendar, ChevronDown } from 'lucide-react'
import { cn } from '../../lib/utils'

interface MonthYearPickerProps {
    label?: string
    value?: string
    onChange: (value: string) => void
    required?: boolean
    className?: string
    disabled?: boolean
    helperText?: string
}

export function MonthYearPicker({
    label,
    value,
    onChange,
    required,
    className,
    disabled,
    helperText,
}: MonthYearPickerProps) {
    const [month, setMonth] = useState<string>('')
    const [year, setYear] = useState<string>('')

    // Parse value (YYYY-MM) on init/change
    useEffect(() => {
        console.log('[MonthYearPicker] Value changed:', value)
        if (value) {
            const [y, m] = value.split('-')
            console.log('[MonthYearPicker] Parsed year:', y, 'month:', m)
            setYear(y || '')
            setMonth(m || '')
        } else {
            setYear('')
            setMonth('')
        }
    }, [value])

    const handleMonthChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newMonth = e.target.value
        setMonth(newMonth)
        updateValue(year, newMonth)
    }

    const handleYearChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newYear = e.target.value
        setYear(newYear)
        updateValue(newYear, month)
    }

    const updateValue = (y: string, m: string) => {
        if (y && m) {
            onChange(`${y}-${m}`)
        } else if (y || m) {
            // If only one is selected, we wait for both? 
            // Or we can emit partial? Standard HTML month input requires full YYYY-MM
            // Let's emit empty if incomplete to avoid invalid dates, or keep internal state
            // For the parent form, it usually expects a string.
            // Let's only emit if both are present to be safe, or maybe just emit what we have if the parent handles it.
            // But typically "2023-" is invalid for a date object.
            // Let's stick to: if both selected, emit YYYY-MM. If not, emit empty string (cleared).
            if (y && m) {
                onChange(`${y}-${m}`)
            } else {
                onChange('')
            }
        } else {
            onChange('')
        }
    }

    const months = [
        { value: '01', label: 'January' },
        { value: '02', label: 'February' },
        { value: '03', label: 'March' },
        { value: '04', label: 'April' },
        { value: '05', label: 'May' },
        { value: '06', label: 'June' },
        { value: '07', label: 'July' },
        { value: '08', label: 'August' },
        { value: '09', label: 'September' },
        { value: '10', label: 'October' },
        { value: '11', label: 'November' },
        { value: '12', label: 'December' },
    ]

    // Generate years (current year + 10 future, 50 past)
    const currentYear = new Date().getFullYear()
    const years = Array.from({ length: 60 }, (_, i) => (currentYear + 10) - i)

    return (
        <div className={cn('w-full', className)}>
            {label && (
                <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-2">
                    {label} {required && <span className="text-danger-600 dark:text-danger-400">*</span>}
                </label>
            )}
            <div className="flex gap-2">
                {/* Month Select */}
                <div className="relative flex-1">
                    <select
                        value={month}
                        onChange={handleMonthChange}
                        disabled={disabled}
                        className="w-full appearance-none px-4 py-2.5 bg-white dark:bg-secondary-800 border border-secondary-300 dark:border-secondary-700 rounded-lg text-secondary-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    >
                        <option value="">Month</option>
                        {months.map((m) => (
                            <option key={m.value} value={m.value}>
                                {m.label}
                            </option>
                        ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-secondary-400 pointer-events-none" />
                </div>

                {/* Year Select */}
                <div className="relative flex-1">
                    <select
                        value={year}
                        onChange={handleYearChange}
                        disabled={disabled}
                        className="w-full appearance-none px-4 py-2.5 bg-white dark:bg-secondary-800 border border-secondary-300 dark:border-secondary-700 rounded-lg text-secondary-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    >
                        <option value="">Year</option>
                        {years.map((y) => (
                            <option key={y} value={y}>
                                {y}
                            </option>
                        ))}
                    </select>
                    <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-secondary-400 pointer-events-none" />
                </div>
            </div>
            {helperText && (
                <p className="text-xs text-secondary-500 dark:text-secondary-400 mt-1">{helperText}</p>
            )}
        </div>
    )
}
