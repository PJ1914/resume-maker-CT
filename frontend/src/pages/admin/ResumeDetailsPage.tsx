import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { adminService } from '@/services/admin.service'
import {
    ArrowLeft,
    FileText,
    Download,
    Calendar,
    User,
    Zap,
    Activity,
    CheckCircle,
    Trash2,
    Code,
    Mail,
    Phone,
    MapPin,
    Linkedin,
    Github,
    GraduationCap,
    Briefcase,
    FolderOpen,
    Wrench,
    Globe,
    ExternalLink
} from 'lucide-react'
import { format } from 'date-fns'
import toast from 'react-hot-toast'
import { useState } from 'react'

export default function ResumeDetailsPage() {
    const { id } = useParams()
    const navigate = useNavigate()
    const queryClient = useQueryClient()
    const [showJson, setShowJson] = useState(false)

    const { data: resume, isLoading } = useQuery({
        queryKey: ['admin-resume', id],
        queryFn: () => adminService.getResumeDetails(id!),
        staleTime: 5 * 60 * 1000, // Cache for 5 minutes
        refetchOnWindowFocus: false
    })

    const deleteMutation = useMutation({
        mutationFn: adminService.deleteResume,
        onSuccess: () => {
            toast.success('Resume deleted successfully')
            navigate('/admin/resumes')
        }
    })

    const handleDelete = () => {
        if (window.confirm('Are you sure you want to delete this resume? This action cannot be undone.')) {
            deleteMutation.mutate(id!)
        }
    }

    if (isLoading) return (
        <div className="p-8 space-y-4">
            <div className="animate-pulse space-y-4">
                <div className="h-8 w-64 bg-gray-300 dark:bg-gray-700 rounded"></div>
                <div className="bg-white dark:bg-gray-800 rounded-lg p-6 space-y-4">
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6"></div>
                </div>
            </div>
        </div>
    )
    if (!resume) return <div className="p-8 text-center">Resume not found</div>

    return (
        <div className="space-y-6">
            <button
                onClick={() => navigate('/admin/resumes')}
                className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors"
            >
                <ArrowLeft className="h-4 w-4" /> Back to Resumes
            </button>

            {/* Header */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                    <div className="flex items-center gap-4">
                        <div className="h-16 w-16 rounded-lg bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-blue-600 dark:text-blue-400">
                            <FileText className="h-8 w-8" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{resume.title}</h1>
                            <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400 mt-1">
                                <span className="flex items-center gap-1">
                                    <User className="h-3.5 w-3.5" /> {resume.user_email}
                                </span>
                                <span className="flex items-center gap-1">
                                    <Calendar className="h-3.5 w-3.5" /> Updated {format(new Date(resume.updated_at), 'MMM d, yyyy')}
                                </span>
                                <span className="flex items-center gap-1">
                                    <Activity className="h-3.5 w-3.5" /> Version {resume.version}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setShowJson(!showJson)}
                            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600 font-medium text-sm transition-colors"
                        >
                            <Code className="h-4 w-4" /> {showJson ? 'Hide JSON' : 'View JSON'}
                        </button>
                        <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary-600 text-white hover:bg-primary-700 font-medium text-sm transition-colors">
                            <Download className="h-4 w-4" /> Download PDF
                        </button>
                        <button
                            onClick={handleDelete}
                            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-50 text-red-700 hover:bg-red-100 dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/30 font-medium text-sm transition-colors"
                        >
                            <Trash2 className="h-4 w-4" /> Delete
                        </button>
                    </div>
                </div>
            </div>

            {showJson && (
                <div className="bg-gray-900 rounded-xl shadow-sm border border-gray-700 p-6 overflow-hidden">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-bold text-white flex items-center gap-2">
                            <Code className="h-5 w-5 text-green-400" />
                            Raw Resume Data
                        </h3>
                        <span className="text-xs text-gray-400">Read-only view</span>
                    </div>
                    <pre className="text-xs sm:text-sm text-green-400 font-mono overflow-auto max-h-[500px] bg-black/50 p-4 rounded-lg">
                        {JSON.stringify(resume, null, 2)}
                    </pre>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Content - Stats & History */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Content Stats */}
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Content Summary</h3>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                            <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-700/50 text-center">
                                <div className="text-2xl font-bold text-gray-900 dark:text-white">{resume.content_summary?.experience_count || 0}</div>
                                <div className="text-xs text-gray-500">Experience</div>
                            </div>
                            <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-700/50 text-center">
                                <div className="text-2xl font-bold text-gray-900 dark:text-white">{resume.content_summary?.education_count || 0}</div>
                                <div className="text-xs text-gray-500">Education</div>
                            </div>
                            <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-700/50 text-center">
                                <div className="text-2xl font-bold text-gray-900 dark:text-white">{resume.content_summary?.projects_count || 0}</div>
                                <div className="text-xs text-gray-500">Projects</div>
                            </div>
                            <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-700/50 text-center">
                                <div className="text-2xl font-bold text-gray-900 dark:text-white">{resume.content_summary?.skills_count || 0}</div>
                                <div className="text-xs text-gray-500">Skills</div>
                            </div>
                        </div>
                    </div>

                    {/* Contact Information */}
                    {resume.contact && Object.keys(resume.contact).length > 0 && (
                        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                                <User className="h-5 w-5 text-blue-500" />
                                Contact Information
                            </h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {resume.contact.email && (
                                    <div className="flex items-center gap-2">
                                        <Mail className="h-4 w-4 text-gray-400" />
                                        <span className="text-sm text-gray-900 dark:text-white">{resume.contact.email}</span>
                                    </div>
                                )}
                                {resume.contact.phone && (
                                    <div className="flex items-center gap-2">
                                        <Phone className="h-4 w-4 text-gray-400" />
                                        <span className="text-sm text-gray-900 dark:text-white">{resume.contact.phone}</span>
                                    </div>
                                )}
                                {resume.contact.location && (
                                    <div className="flex items-center gap-2">
                                        <MapPin className="h-4 w-4 text-gray-400" />
                                        <span className="text-sm text-gray-900 dark:text-white">{resume.contact.location}</span>
                                    </div>
                                )}
                                {resume.contact.linkedin && (
                                    <div className="flex items-center gap-2">
                                        <Linkedin className="h-4 w-4 text-blue-500" />
                                        <a href={resume.contact.linkedin.startsWith('http') ? resume.contact.linkedin : `https://${resume.contact.linkedin}`} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline">
                                            LinkedIn
                                        </a>
                                    </div>
                                )}
                                {resume.contact.github && (
                                    <div className="flex items-center gap-2">
                                        <Github className="h-4 w-4 text-gray-600" />
                                        <a href={resume.contact.github.startsWith('http') ? resume.contact.github : `https://${resume.contact.github}`} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline">
                                            GitHub
                                        </a>
                                    </div>
                                )}
                                {resume.contact.portfolio && (
                                    <div className="flex items-center gap-2">
                                        <Globe className="h-4 w-4 text-gray-400" />
                                        <a href={resume.contact.portfolio.startsWith('http') ? resume.contact.portfolio : `https://${resume.contact.portfolio}`} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline">
                                            Portfolio
                                        </a>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Education */}
                    {resume.education?.length > 0 && (
                        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                                <GraduationCap className="h-5 w-5 text-purple-500" />
                                Education ({resume.education.length})
                            </h3>
                            <div className="space-y-4">
                                {resume.education.map((edu: any, i: number) => (
                                    <div key={i} className="p-4 rounded-lg bg-gray-50 dark:bg-gray-700/50 border-l-4 border-purple-500">
                                        <div className="font-medium text-gray-900 dark:text-white">{edu.degree || 'Degree'}</div>
                                        <div className="text-sm text-gray-600 dark:text-gray-300">{edu.school || edu.institution}</div>
                                        {edu.field && <div className="text-xs text-gray-500">{edu.field}</div>}
                                        <div className="text-xs text-gray-500 mt-1">
                                            {edu.startDate} - {edu.endDate || 'Present'}
                                            {edu.gpa && <span className="ml-2">• GPA: {edu.gpa}</span>}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Experience */}
                    {resume.experience?.length > 0 && (
                        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                                <Briefcase className="h-5 w-5 text-green-500" />
                                Experience ({resume.experience.length})
                            </h3>
                            <div className="space-y-4">
                                {resume.experience.map((exp: any, i: number) => (
                                    <div key={i} className="p-4 rounded-lg bg-gray-50 dark:bg-gray-700/50 border-l-4 border-green-500">
                                        <div className="font-medium text-gray-900 dark:text-white">{exp.position || exp.title}</div>
                                        <div className="text-sm text-gray-600 dark:text-gray-300">{exp.company}</div>
                                        {exp.location && <div className="text-xs text-gray-500">{exp.location}</div>}
                                        <div className="text-xs text-gray-500 mt-1">
                                            {exp.startDate} - {exp.endDate || 'Present'}
                                        </div>
                                        {exp.description && (
                                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-2 whitespace-pre-line">{exp.description}</p>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Projects */}
                    {resume.projects?.length > 0 && (
                        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                                <FolderOpen className="h-5 w-5 text-orange-500" />
                                Projects ({resume.projects.length})
                            </h3>
                            <div className="space-y-4">
                                {resume.projects.map((proj: any, i: number) => (
                                    <div key={i} className="p-4 rounded-lg bg-gray-50 dark:bg-gray-700/50 border-l-4 border-orange-500">
                                        <div className="flex items-start justify-between">
                                            <div className="font-medium text-gray-900 dark:text-white">{proj.name}</div>
                                            {proj.link && (
                                                <a href={proj.link.startsWith('http') ? proj.link : `https://${proj.link}`} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:text-blue-600">
                                                    <ExternalLink className="h-4 w-4" />
                                                </a>
                                            )}
                                        </div>
                                        {proj.technologies && (
                                            <div className="text-xs text-orange-600 dark:text-orange-400 mt-1">{proj.technologies}</div>
                                        )}
                                        {(proj.startDate || proj.endDate) && (
                                            <div className="text-xs text-gray-500 mt-1">
                                                {proj.startDate} {proj.endDate && `- ${proj.endDate}`}
                                            </div>
                                        )}
                                        {proj.description && (
                                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-2 whitespace-pre-line">{proj.description}</p>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Skills */}
                    {resume.skills && (typeof resume.skills === 'object' && Object.keys(resume.skills).length > 0 || Array.isArray(resume.skills) && resume.skills.length > 0) && (
                        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                                <Wrench className="h-5 w-5 text-cyan-500" />
                                Skills
                            </h3>
                            <div className="space-y-4">
                                {/* Handle skills as dict {category: [items]} */}
                                {typeof resume.skills === 'object' && !Array.isArray(resume.skills) &&
                                    Object.entries(resume.skills).map(([category, items]: [string, any]) => (
                                        <div key={category}>
                                            <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{category}</div>
                                            <div className="flex flex-wrap gap-2">
                                                {Array.isArray(items) && items.map((skill: string, i: number) => (
                                                    <span key={i} className="px-2 py-1 text-xs rounded-full bg-cyan-100 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-400">
                                                        {skill}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    ))
                                }
                                {/* Handle skills as list [{category, items}] */}
                                {Array.isArray(resume.skills) && resume.skills.map((skillCat: any, i: number) => (
                                    <div key={i}>
                                        <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{skillCat.category}</div>
                                        <div className="flex flex-wrap gap-2">
                                            {skillCat.items?.map((skill: string, j: number) => (
                                                <span key={j} className="px-2 py-1 text-xs rounded-full bg-cyan-100 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-400">
                                                    {skill}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* ATS History */}
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">ATS Score History</h3>
                        <div className="space-y-4">
                            {resume.ats_history?.map((entry: any, i: number) => (
                                <div key={i} className="flex items-center justify-between p-3 border-b border-gray-100 dark:border-gray-700 last:border-0">
                                    <div className="flex items-center gap-3">
                                        <div className={`h-2 w-2 rounded-full ${entry.score >= 70 ? 'bg-green-500' : entry.score >= 50 ? 'bg-yellow-500' : 'bg-red-500'
                                            }`} />
                                        <span className="text-sm text-gray-600 dark:text-gray-300">{format(new Date(entry.timestamp), 'PP p')}</span>
                                    </div>
                                    <span className="font-bold text-gray-900 dark:text-white">{entry.score}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Sidebar - AI & Template */}
                <div className="space-y-6">
                    {/* Current Score */}
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                        <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Current ATS Score</h3>
                        <div className="flex items-end gap-2">
                            <span className="text-4xl font-bold text-gray-900 dark:text-white">{resume.score}</span>
                            <span className="text-sm text-gray-500 mb-1">/ 100</span>
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mt-3">
                            <div
                                className={`h-2 rounded-full ${resume.score >= 70 ? 'bg-green-500' : resume.score >= 50 ? 'bg-yellow-500' : 'bg-red-500'
                                    }`}
                                style={{ width: `${resume.score}%` }}
                            />
                        </div>
                    </div>

                    {/* AI Enhancements */}
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                            <Zap className="h-5 w-5 text-yellow-500" />
                            AI Enhancements
                        </h3>
                        <div className="space-y-3">
                            {resume.ai_enhancements?.map((enhancement: any, i: number) => (
                                <div key={i} className="flex items-start gap-2 text-sm">
                                    <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                                    <div>
                                        <p className="text-gray-900 dark:text-white capitalize">{enhancement.type.replace('_', ' ')}</p>
                                        <p className="text-xs text-gray-500">{format(new Date(enhancement.timestamp), 'MMM d, h:mm a')}</p>
                                    </div>
                                </div>
                            ))}
                            {!resume.ai_enhancements?.length && <p className="text-gray-500 text-sm">No AI features used yet.</p>}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
