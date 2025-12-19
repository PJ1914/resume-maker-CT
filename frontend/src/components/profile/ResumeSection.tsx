import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { FileText, MoreVertical, Edit, Download, Copy, Trash2, Plus } from 'lucide-react'
import { useResumes } from '@/hooks/useResumes'
import { format } from 'date-fns'
import { Menu, Transition } from '@headlessui/react'
import { Fragment } from 'react'

export default function ResumeSection() {
    const navigate = useNavigate()
    const { data: resumes, isLoading } = useResumes()

    // Sort by created_at descending and take top 3
    const recentResumes = [...(resumes || [])]
        .sort((a, b) => {
            const dateA = new Date(a.created_at || 0).getTime()
            const dateB = new Date(b.created_at || 0).getTime()
            return dateB - dateA
        })
        .slice(0, 3)

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white dark:bg-[#111111] rounded-2xl p-6 border border-secondary-200 dark:border-white/10 shadow-sm dark:shadow-none transition-colors"
        >
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg sm:text-xl font-bold text-secondary-900 dark:text-white flex items-center gap-2">
                    <FileText className="h-5 w-5 text-purple-400" />
                    Your Resumes
                </h2>
                <div className="flex gap-2">
                    <button
                        onClick={() => navigate('/resume/create')}
                        className="text-xs sm:text-sm bg-purple-600 hover:bg-purple-500 text-white px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1"
                    >
                        <Plus className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                        New
                    </button>
                    <button
                        onClick={() => navigate('/resumes')}
                        className="text-xs sm:text-sm text-secondary-500 dark:text-gray-400 hover:text-secondary-900 dark:hover:text-white px-2 py-1.5 transition-colors"
                    >
                        View All
                    </button>
                </div>
            </div>

            {isLoading ? (
                <div className="space-y-4">
                    {[1, 2].map((i) => (
                        <div key={i} className="h-20 bg-secondary-100 dark:bg-white/5 rounded-xl animate-pulse" />
                    ))}
                </div>
            ) : recentResumes.length > 0 ? (
                <div className="space-y-4">
                    {recentResumes.map((resume: any, index: number) => (
                        <div
                            key={resume.resume_id || `resume-${index}`}
                            className="group flex items-center justify-between p-4 rounded-xl bg-secondary-50 dark:bg-[#0a0a0a] border border-secondary-200 dark:border-white/10 hover:border-purple-400 dark:hover:border-purple-500/30 transition-all"
                        >
                            <div className="flex items-center gap-4">
                                <div className="h-10 w-10 rounded-lg bg-purple-500/10 flex items-center justify-center text-purple-400">
                                    <FileText className="h-5 w-5" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-secondary-900 dark:text-white text-sm sm:text-base truncate max-w-[150px] sm:max-w-xs">
                                        {resume.original_filename?.replace(/\.[^/.]+$/, "") || resume.filename?.replace(/\.[^/.]+$/, "") || 'Untitled Resume'}
                                    </h3>
                                    <div className="flex items-center gap-3 text-xs text-secondary-500 dark:text-gray-400">
                                        <span>Created {resume.created_at ? format(new Date(resume.created_at), 'MMM d, yyyy') : 'Unknown'}</span>
                                        {resume.latest_score > 0 && (
                                            <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${resume.latest_score >= 70 ? 'bg-green-500/10 text-green-400' :
                                                resume.latest_score >= 50 ? 'bg-yellow-500/10 text-yellow-400' :
                                                    'bg-red-500/10 text-red-400'
                                                }`}>
                                                Score: {resume.latest_score}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => navigate(`/editor/${resume.resume_id}`)}
                                    className="p-2 text-secondary-400 dark:text-gray-400 hover:text-secondary-900 dark:hover:text-white hover:bg-secondary-200 dark:hover:bg-white/10 rounded-lg transition-colors"
                                    title="Edit"
                                >
                                    <Edit className="h-4 w-4" />
                                </button>

                                {/* Dropdown Menu */}
                                <Menu as="div" className="relative">
                                    <Menu.Button className="p-2 text-secondary-400 dark:text-gray-400 hover:text-secondary-900 dark:hover:text-white hover:bg-secondary-200 dark:hover:bg-white/10 rounded-lg transition-colors">
                                        <MoreVertical className="h-4 w-4" />
                                    </Menu.Button>
                                    <Transition
                                        as={Fragment}
                                        enter="transition ease-out duration-100"
                                        enterFrom="transform opacity-0 scale-95"
                                        enterTo="transform opacity-100 scale-100"
                                        leave="transition ease-in duration-75"
                                        leaveFrom="transform opacity-100 scale-100"
                                        leaveTo="transform opacity-0 scale-95"
                                    >
                                        <Menu.Items className="absolute right-0 mt-2 w-48 origin-top-right divide-y divide-secondary-100 dark:divide-white/10 rounded-md bg-white dark:bg-[#111111] shadow-xl ring-1 ring-black ring-opacity-5 focus:outline-none z-10 border border-secondary-200 dark:border-white/10">
                                            <div className="px-1 py-1">
                                                <Menu.Item>
                                                    {({ active }) => (
                                                        <button
                                                            onClick={() => navigate(`/resumes/${resume.resume_id}`)}
                                                            className={`${active ? 'bg-secondary-100 dark:bg-white/10 text-secondary-900 dark:text-white' : 'text-secondary-700 dark:text-gray-300'
                                                                } group flex w-full items-center rounded-md px-2 py-2 text-sm`}
                                                        >
                                                            <Download className="mr-2 h-4 w-4" />
                                                            Export PDF
                                                        </button>
                                                    )}
                                                </Menu.Item>
                                                <Menu.Item>
                                                    {({ active }) => (
                                                        <button
                                                            className={`${active ? 'bg-secondary-100 dark:bg-white/10 text-secondary-900 dark:text-white' : 'text-secondary-700 dark:text-gray-300'
                                                                } group flex w-full items-center rounded-md px-2 py-2 text-sm`}
                                                        >
                                                            <Copy className="mr-2 h-4 w-4" />
                                                            Duplicate
                                                        </button>
                                                    )}
                                                </Menu.Item>
                                            </div>
                                            <div className="px-1 py-1">
                                                <Menu.Item>
                                                    {({ active }) => (
                                                        <button
                                                            className={`${active ? 'bg-red-500/10 text-red-400' : 'text-red-400'
                                                                } group flex w-full items-center rounded-md px-2 py-2 text-sm`}
                                                        >
                                                            <Trash2 className="mr-2 h-4 w-4" />
                                                            Delete
                                                        </button>
                                                    )}
                                                </Menu.Item>
                                            </div>
                                        </Menu.Items>
                                    </Transition>
                                </Menu>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-8 text-secondary-400 dark:text-gray-400">
                    <p>No resumes created yet.</p>
                    <button
                        onClick={() => navigate('/resume/create')}
                        className="mt-2 text-blue-400 font-medium hover:underline text-sm"
                    >
                        Create your first resume
                    </button>
                </div>
            )}
        </motion.div>
    )
}
