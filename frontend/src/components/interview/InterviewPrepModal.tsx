import React, { useState, useEffect } from 'react';
import { X, Loader2, Sparkles, Briefcase, GraduationCap, FileQuestion, Check } from 'lucide-react';
import { interviewService } from '@/services/interview.service';
import { creditService } from '@/services/credits.service';
import { GenerateInterviewResponse } from '@/types/interview';
import { useAuth } from '@/context/AuthContext';
import { CreditWarning } from './CreditWarning';

interface InterviewPrepModalProps {
    isOpen: boolean;
    onClose: () => void;
    resumeId: string;
    onSuccess: (data: GenerateInterviewResponse) => void;
}

export function InterviewPrepModal({ isOpen, onClose, resumeId, onSuccess }: InterviewPrepModalProps) {
    const [role, setRole] = useState('');
    const [experienceLevel, setExperienceLevel] = useState('Fresher');
    const [questionTypes, setQuestionTypes] = useState<string[]>(['technical', 'hr']);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [balance, setBalance] = useState<number | null>(null);
    const { user } = useAuth();

    useEffect(() => {
        if (isOpen) {
            creditService.getBalance().then(data => setBalance(data.balance));
        }
    }, [isOpen]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!role.trim()) {
            setError('Please enter a role');
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const data = await interviewService.generate({
                resume_id: resumeId,
                role,
                experience_level: experienceLevel,
                question_types: questionTypes
            });
            onSuccess(data);
            onClose();
        } catch (err: any) {
            console.error(err);
            setError(err.response?.data?.detail?.message || 'Failed to generate interview questions. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const toggleType = (type: string) => {
        setQuestionTypes(prev => {
            if (prev.includes(type)) {
                if (prev.length === 1) return prev; // Must have at least one
                return prev.filter(t => t !== type);
            }
            return [...prev, type];
        });
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={loading ? undefined : onClose} />

            <div className="relative w-full max-w-lg bg-white dark:bg-secondary-900 rounded-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="p-6 border-b border-secondary-100 dark:border-secondary-800 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-primary-100 dark:bg-primary-900/30 rounded-lg">
                            <Sparkles className="h-5 w-5 text-primary-600 dark:text-primary-400" />
                        </div>
                        <h2 className="text-xl font-semibold text-secondary-900 dark:text-white">
                            AI Interview Prep
                        </h2>
                    </div>
                    <button
                        onClick={onClose}
                        disabled={loading}
                        className="text-secondary-400 hover:text-secondary-600 dark:hover:text-secondary-300 transition-colors"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                {/* Content */}
                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    {error && (
                        <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-sm text-red-600 dark:text-red-400">
                            {error}
                        </div>
                    )}

                    {/* Role */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-secondary-700 dark:text-secondary-300 flex items-center gap-2">
                            <Briefcase className="h-4 w-4" /> Target Role
                        </label>
                        <input
                            type="text"
                            placeholder="e.g. Senior React Developer"
                            value={role}
                            onChange={(e) => setRole(e.target.value)}
                            className="w-full px-4 py-2 bg-secondary-50 dark:bg-secondary-800 border border-secondary-200 dark:border-secondary-700 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none transition-all dark:text-white"
                            required
                        />
                    </div>

                    {/* Experience Level */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-secondary-700 dark:text-secondary-300 flex items-center gap-2">
                            <GraduationCap className="h-4 w-4" /> Experience Level
                        </label>
                        <select
                            value={experienceLevel}
                            onChange={(e) => setExperienceLevel(e.target.value)}
                            className="w-full px-4 py-2 bg-secondary-50 dark:bg-secondary-800 border border-secondary-200 dark:border-secondary-700 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none transition-all dark:text-white"
                        >
                            <option value="Fresher">Fresher (0-1 years)</option>
                            <option value="Junior">Junior (1-3 years)</option>
                            <option value="Mid-level">Mid-level (3-5 years)</option>
                            <option value="Senior">Senior (5-8 years)</option>
                            <option value="Lead">Lead/Manager (8+ years)</option>
                        </select>
                    </div>

                    {/* Question Types */}
                    <div className="space-y-3">
                        <label className="text-sm font-medium text-secondary-700 dark:text-secondary-300 flex items-center gap-2">
                            <FileQuestion className="h-4 w-4" /> Question Types
                        </label>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <button
                                type="button"
                                onClick={() => toggleType('technical')}
                                className={`p-3 rounded-xl border-2 flex items-center justify-center gap-2 transition-all duration-200 relative overflow-hidden ${questionTypes.includes('technical')
                                    ? 'bg-primary-50 dark:bg-primary-900/40 border-primary-600 dark:border-primary-500 text-primary-700 dark:text-primary-300'
                                    : 'bg-white dark:bg-secondary-800 border-secondary-200 dark:border-secondary-700 text-secondary-600 dark:text-secondary-400 hover:border-secondary-300 dark:hover:border-secondary-600 hover:bg-secondary-50 dark:hover:bg-secondary-700/50'
                                    }`}
                            >
                                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${questionTypes.includes('technical')
                                    ? 'border-primary-600 dark:border-primary-500 bg-primary-600 dark:bg-primary-500 text-white'
                                    : 'border-secondary-400 dark:border-secondary-500'
                                    }`}>
                                    {questionTypes.includes('technical') && <Check className="h-3 w-3" strokeWidth={3} />}
                                </div>
                                <span className="font-medium">Technical</span>
                            </button>

                            <button
                                type="button"
                                onClick={() => toggleType('hr')}
                                className={`p-3 rounded-xl border-2 flex items-center justify-center gap-2 transition-all duration-200 relative overflow-hidden ${questionTypes.includes('hr')
                                    ? 'bg-primary-50 dark:bg-primary-900/40 border-primary-600 dark:border-primary-500 text-primary-700 dark:text-primary-300'
                                    : 'bg-white dark:bg-secondary-800 border-secondary-200 dark:border-secondary-700 text-secondary-600 dark:text-secondary-400 hover:border-secondary-300 dark:hover:border-secondary-600 hover:bg-secondary-50 dark:hover:bg-secondary-700/50'
                                    }`}
                            >
                                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${questionTypes.includes('hr')
                                    ? 'border-primary-600 dark:border-primary-500 bg-primary-600 dark:bg-primary-500 text-white'
                                    : 'border-secondary-400 dark:border-secondary-500'
                                    }`}>
                                    {questionTypes.includes('hr') && <Check className="h-3 w-3" strokeWidth={3} />}
                                </div>
                                <span className="font-medium">HR / Behavioral</span>
                            </button>
                        </div>
                    </div>

                    {/* Credits Info */}
                    {balance !== null && balance < 10 ? (
                        <CreditWarning balance={balance} cost={questionTypes.length === 2 ? 10 : 5} />
                    ) : (
                        <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl flex items-start gap-3">
                            <Sparkles className="h-5 w-5 text-blue-500 shrink-0 mt-0.5" />
                            <div className="text-sm">
                                <p className="font-medium text-blue-700 dark:text-blue-300">
                                    Costs {questionTypes.length === 2 ? '10 Credits (5 per category)' : '5 Credits per category'}
                                </p>
                                <p className="text-blue-600 dark:text-blue-400 mt-1">
                                    Generates 10 questions with personalized answers for each selected category.
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex flex-col-reverse sm:flex-row gap-3 pt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="w-full sm:w-auto sm:flex-1 px-4 py-3 border border-secondary-300 dark:border-secondary-600 text-secondary-700 dark:text-secondary-300 rounded-xl font-medium hover:bg-secondary-50 dark:hover:bg-secondary-800 transition-colors"
                            disabled={loading}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full sm:w-auto sm:flex-1 px-4 py-3 bg-gradient-to-r from-primary-600 to-indigo-600 hover:from-primary-700 hover:to-indigo-700 text-white rounded-xl font-medium shadow-lg shadow-primary-500/25 transition-all disabled:opacity-70 flex items-center justify-center gap-2 active:scale-[0.98]"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                    Generating...
                                </>
                            ) : (
                                <>
                                    <Sparkles className="h-4 w-4" />
                                    Generate Interview
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
