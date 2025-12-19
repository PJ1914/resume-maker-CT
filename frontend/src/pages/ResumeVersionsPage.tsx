import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useResumes } from '@/hooks/useResumes';
import { History, FileText, ArrowRight, Loader2 } from 'lucide-react';
import type { ResumeListItem } from '@/services/resume.service';

export default function ResumeVersionsPage() {
    const navigate = useNavigate();
    const { data: resumesData, isLoading: loading } = useResumes();
    const resumes = resumesData || [];

    const handleSelectResume = (resumeId: string) => {
        navigate(`/resumes/${resumeId}/history`);
    };

    if (loading) {
        return (
            <div className="flex justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary-500" />
            </div>
        );
    }

    return (
        <div className="p-4 sm:p-8 max-w-7xl mx-auto">
            <div className="mb-6 sm:mb-8">
                <h1 className="text-2xl sm:text-3xl font-bold text-secondary-900 dark:text-white mb-2 flex items-center gap-2">
                    <History className="h-8 w-8 text-primary-500" />
                    Resume Version History
                </h1>
                <p className="text-sm sm:text-base text-secondary-600 dark:text-secondary-400">
                    Select a resume to view its automatic version history and tracked improvements.
                </p>
            </div>

            {resumes.length === 0 ? (
                <div className="text-center py-12 bg-white dark:bg-secondary-900 rounded-lg border border-secondary-200 dark:border-secondary-800">
                    <p className="text-secondary-500">No resumes found. Create a resume to start tracking versions.</p>
                    <button
                        onClick={() => navigate('/resume/create')}
                        className="mt-4 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
                    >
                        Create Resume
                    </button>
                </div>
            ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {resumes.map((resume: ResumeListItem) => (
                        <div
                            key={resume.resume_id}
                            onClick={() => handleSelectResume(resume.resume_id)}
                            className="bg-white dark:bg-secondary-900 rounded-xl border border-secondary-200 dark:border-secondary-800 p-6 hover:shadow-lg hover:border-primary-500 dark:hover:border-primary-500 transition-all cursor-pointer group"
                        >
                            <div className="flex items-start justify-between mb-4">
                                <div className="p-2 bg-primary-50 dark:bg-primary-900/10 rounded-lg">
                                    <FileText className="h-6 w-6 text-primary-600 dark:text-primary-400" />
                                </div>
                                <span className="bg-secondary-100 dark:bg-secondary-800 text-secondary-600 dark:text-secondary-400 text-xs px-2 py-1 rounded-full">
                                    View History
                                </span>
                            </div>

                            <h3 className="font-semibold text-lg text-secondary-900 dark:text-white mb-1 truncate" title={resume.original_filename}>
                                {resume.original_filename}
                            </h3>
                            <p className="text-sm text-secondary-500 dark:text-secondary-400">
                                Created: {new Date(resume.created_at).toLocaleDateString()}
                            </p>

                            <div className="mt-4 flex items-center gap-2 text-sm text-primary-600 dark:text-primary-400 font-medium group-hover:translate-x-1 transition-transform">
                                Explore Versions <ArrowRight className="h-4 w-4" />
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
