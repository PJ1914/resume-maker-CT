import { useMemo } from 'react'
import { motion } from 'framer-motion'
import { CheckCircle2, AlertCircle, TrendingUp } from 'lucide-react'

interface ResumeStrengthMeterProps {
    data: {
        contact: { name: string; email: string; phone: string }
        summary: string
        experience: any[]
        education: any[]
        skills: { technical: string[]; soft: string[] }
        projects: any[]
        certifications: any[]
        languages: any[]
        achievements: any[]
    }
}

export default function ResumeStrengthMeter({ data }: ResumeStrengthMeterProps) {
    const analysis = useMemo(() => {
        let score = 0
        const suggestions: string[] = []

        // Contact (15 points)
        if (data.contact.name && data.contact.email && data.contact.phone) {
            score += 15
        } else {
            suggestions.push('Add contact details')
        }

        // Summary (15 points)
        if (data.summary && data.summary.length > 50) {
            score += 15
        } else {
            suggestions.push('Write a professional summary')
        }

        // Experience (25 points)
        if (data.experience.length >= 2) {
            score += 25
        } else if (data.experience.length === 1) {
            score += 15
            suggestions.push('Add one more experience')
        } else {
            suggestions.push('Add work experience')
        }

        // Skills (15 points)
        const totalSkills = (data.skills.technical?.length || 0) + (data.skills.soft?.length || 0)
        if (totalSkills >= 5) {
            score += 15
        } else {
            suggestions.push('Add at least 5 skills')
        }

        // Education (10 points)
        if (data.education.length > 0) {
            score += 10
        } else {
            suggestions.push('Add education')
        }

        // Projects (10 points)
        if (data.projects.length > 0) {
            score += 10
        } else {
            suggestions.push('Add a project')
        }

        // Extras (10 points)
        if (data.certifications.length > 0 || data.languages.length > 0 || data.achievements.length > 0) {
            score += 10
        }

        return { score, suggestions }
    }, [data])

    const getColor = (score: number) => {
        if (score >= 80) return 'text-green-500'
        if (score >= 50) return 'text-amber-500'
        return 'text-red-500'
    }

    const getBgColor = (score: number) => {
        if (score >= 80) return 'bg-green-500'
        if (score >= 50) return 'bg-amber-500'
        return 'bg-red-500'
    }

    return (
        <div className="bg-white dark:bg-secondary-900 border border-secondary-200 dark:border-secondary-800 rounded-xl p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-secondary-900 dark:text-white flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-primary-600" />
                    Resume Strength
                </h3>
                <span className={`text-xl font-bold ${getColor(analysis.score)}`}>
                    {analysis.score}%
                </span>
            </div>

            {/* Progress Bar */}
            <div className="h-2.5 bg-secondary-100 dark:bg-secondary-800 rounded-full overflow-hidden mb-4">
                <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${analysis.score}%` }}
                    transition={{ duration: 1, ease: "easeOut" }}
                    className={`h-full rounded-full ${getBgColor(analysis.score)}`}
                />
            </div>

            {/* Suggestions */}
            {analysis.suggestions.length > 0 ? (
                <div className="space-y-2">
                    <p className="text-xs font-semibold text-secondary-500 dark:text-secondary-400 uppercase tracking-wider">
                        To Improve:
                    </p>
                    {analysis.suggestions.slice(0, 3).map((suggestion, i) => (
                        <div key={i} className="flex items-center gap-2 text-sm text-secondary-700 dark:text-secondary-300">
                            <AlertCircle className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />
                            <span>{suggestion}</span>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 p-2 rounded-lg">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Excellent! Your resume looks strong.</span>
                </div>
            )}
        </div>
    )
}
