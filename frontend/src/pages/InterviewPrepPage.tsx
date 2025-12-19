import { useNavigate } from 'react-router-dom'
import { FileText, Sparkles, Upload, History, ArrowRight } from 'lucide-react'
import { useResumes } from '@/hooks/useResumes'
import type { ResumeListItem } from '@/services/resume.service'
import { InterviewPrepButton } from '@/components/interview/InterviewPrepButton'
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { InterviewSession } from '@/types/interview'
import { interviewService } from '@/services/interview.service'
import { InterviewResults } from '@/components/interview/InterviewResults'

export default function InterviewPrepPage() {
    const navigate = useNavigate()
    const { data: resumesData, isLoading: loading } = useResumes()
    const [activeTab, setActiveTab] = useState<'new' | 'history'>('new');
    const [history, setHistory] = useState<InterviewSession[]>([]);
    const [loadingHistory, setLoadingHistory] = useState(false);
    const [selectedSession, setSelectedSession] = useState<InterviewSession | null>(null);

    const resumes = resumesData || []

    useEffect(() => {
        if (activeTab === 'history') {
            fetchHistory();
        }
    }, [activeTab]);

    const fetchHistory = async () => {
        setLoadingHistory(true);
        try {
            const data = await interviewService.getHistory();
            setHistory(data);
        } catch (error) {
            console.error("Failed to fetch history:", error);
        } finally {
            setLoadingHistory(false);
        }
    };

    // Reuse ResumesPage helper logic for display consistency
    const formatDate = (dateString?: string): string => {
        if (!dateString) return 'Unknown date';
        const date = new Date(dateString)
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        })
    }

    const getStatusBadge = (status: string) => {
        // Simplified status for this view
        if (status === 'PARSING' || status === 'SCORING' || status === 'UPLOADED') {
            return <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full">Processing</span>;
        }
        if (status === 'ERROR') {
            return <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full">Error</span>;
        }
        return <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">Ready</span>;
    }

    if (loading) {
        return (
            <div className="p-4 sm:p-8 max-w-7xl mx-auto">
                <div className="animate-pulse space-y-4">
                    <div className="h-8 w-48 bg-secondary-200 dark:bg-secondary-800 rounded"></div>
                    <div className="h-32 bg-secondary-100 dark:bg-secondary-800 rounded"></div>
                </div>
            </div>
        )
    }

    return (
        <div className="p-4 sm:p-8 max-w-7xl mx-auto">
            {/* Header */}
            <div className="mb-6 sm:mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-secondary-900 dark:text-white mb-2">
                        Interview Preparation
                    </h1>
                    <p className="text-sm sm:text-base text-secondary-600 dark:text-secondary-400">
                        Generate AI-powered interview Q&A sessions tailored to your resumes.
                    </p>
                </div>
                <div className="flex bg-secondary-100 dark:bg-secondary-800/50 p-1.5 rounded-xl border border-secondary-200 dark:border-secondary-700/50">
                    {['new', 'history'].map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab as 'new' | 'history')}
                            className={`
                                relative px-6 py-2.5 rounded-lg text-sm font-medium transition-colors z-10 flex items-center gap-2 outline-none
                                ${activeTab === tab
                                    ? 'text-primary-700 dark:text-white'
                                    : 'text-secondary-600 dark:text-secondary-400 hover:text-secondary-900 dark:hover:text-secondary-200'}
                            `}
                        >
                            {tab === 'new' ? <Sparkles className="h-4 w-4" /> : <History className="h-4 w-4" />}
                            <span className="capitalize">{tab === 'new' ? 'New Session' : 'History'}</span>

                            {activeTab === tab && (
                                <motion.div
                                    layoutId="activeTab"
                                    className="absolute inset-0 bg-white dark:bg-secondary-700 rounded-lg shadow-sm border border-secondary-200/50 dark:border-secondary-600 -z-10"
                                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                                />
                            )}
                        </button>
                    ))}
                </div>
            </div>

            {activeTab === 'new' && (
                <>
                    {/* Empty State */}
                    {resumes.length === 0 ? (
                        <div className="text-center py-12 sm:py-16 bg-white dark:bg-secondary-900 rounded-lg border-2 border-dashed border-secondary-300 dark:border-secondary-700 px-4">
                            <div className="h-14 w-14 sm:h-16 sm:w-16 rounded-lg bg-secondary-100 dark:bg-secondary-800 flex items-center justify-center mx-auto">
                                <Sparkles className="h-7 w-7 sm:h-8 sm:w-8 text-secondary-400 dark:text-secondary-500" />
                            </div>
                            <h3 className="mt-4 text-lg font-semibold text-secondary-900 dark:text-white">
                                No resumes found
                            </h3>
                            <p className="mt-2 text-sm text-secondary-600 dark:text-secondary-400 max-w-md mx-auto">
                                Create or upload a resume to start preparing for your interviews.
                            </p>
                            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-6">
                                <button
                                    onClick={() => navigate('/resume/create')}
                                    className="px-5 py-2.5 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition-colors flex items-center gap-2"
                                >
                                    <Sparkles className="h-4 w-4" /> Create Resume
                                </button>
                                <button
                                    onClick={() => navigate('/upload')}
                                    className="px-5 py-2.5 bg-white dark:bg-secondary-800 border border-secondary-300 dark:border-secondary-600 text-secondary-700 dark:text-secondary-300 rounded-lg font-medium hover:bg-secondary-50 dark:hover:bg-secondary-700 transition-colors flex items-center gap-2"
                                >
                                    <Upload className="h-4 w-4" /> Upload
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {resumes.map((resume: ResumeListItem) => (
                                <div
                                    key={resume.resume_id}
                                    className="bg-white dark:bg-secondary-900 rounded-xl border border-secondary-200 dark:border-secondary-800 p-6 hover:shadow-lg transition-all flex flex-col"
                                >
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="p-2 bg-primary-50 dark:bg-primary-900/10 rounded-lg">
                                            <FileText className="h-6 w-6 text-primary-600 dark:text-primary-400" />
                                        </div>
                                        {getStatusBadge(resume.status)}
                                    </div>

                                    <h3 className="font-semibold text-lg text-secondary-900 dark:text-white mb-1 truncate" title={resume.original_filename}>
                                        {resume.original_filename}
                                    </h3>
                                    <p className="text-sm text-secondary-500 dark:text-secondary-400 mb-6">
                                        Last updated: {formatDate(resume.created_at)}
                                    </p>

                                    <div className="mt-auto">
                                        <InterviewPrepButton resumeId={resume.resume_id} className="w-full justify-center" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </>
            )}

            {activeTab === 'history' && (
                <>
                    {loadingHistory ? (
                        <div className="flex justify-center py-12">
                            <div className="animate-spin h-8 w-8 border-4 border-primary-500 border-t-transparent rounded-full"></div>
                        </div>
                    ) : history.length === 0 ? (
                        <div className="text-center py-12 sm:py-16 bg-white dark:bg-secondary-900 rounded-lg border border-secondary-200 dark:border-secondary-800 px-4">
                            <div className="h-14 w-14 sm:h-16 sm:w-16 rounded-lg bg-secondary-100 dark:bg-secondary-800 flex items-center justify-center mx-auto">
                                <History className="h-7 w-7 sm:h-8 sm:w-8 text-secondary-400 dark:text-secondary-500" />
                            </div>
                            <h3 className="mt-4 text-lg font-semibold text-secondary-900 dark:text-white">
                                No history yet
                            </h3>
                            <p className="mt-2 text-sm text-secondary-600 dark:text-secondary-400">
                                Start a new session to see your interview history here.
                            </p>
                            <button
                                onClick={() => setActiveTab('new')}
                                className="mt-6 px-5 py-2.5 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition-colors"
                            >
                                Start New Session
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {history.map((session) => (
                                <div
                                    key={session.id}
                                    onClick={() => setSelectedSession(session)} // Open details on click
                                    className="bg-white dark:bg-secondary-900 rounded-xl border border-secondary-200 dark:border-secondary-800 p-6 hover:border-primary-500 dark:hover:border-primary-500 cursor-pointer transition-all group"
                                >
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                        <div>
                                            <div className="flex items-center gap-3 mb-2">
                                                <h3 className="font-semibold text-lg text-secondary-900 dark:text-white">
                                                    {session.role}
                                                </h3>
                                                <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                                                    {session.experience_level}
                                                </span>
                                            </div>
                                            <p className="text-sm text-secondary-500 dark:text-secondary-400 flex items-center gap-2">
                                                <span>{formatDate(session.created_at)}</span>
                                                <span>•</span>
                                                <span>{session.technical_questions.length} Technical, {session.hr_questions.length} HR Questions</span>
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-2 text-primary-600 dark:text-primary-400 font-medium text-sm group-hover:translate-x-1 transition-transform">
                                            View Details <ArrowRight className="h-4 w-4" />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </>
            )}

            {selectedSession && (
                <InterviewResults
                    data={{
                        session_id: selectedSession.id || '',
                        technical: selectedSession.technical_questions,
                        hr: selectedSession.hr_questions,
                        credits_used: selectedSession.credits_used || 0
                    }}
                    onClose={() => setSelectedSession(null)}
                />
            )}
        </div>
    )
}
