import React, { useState } from 'react';
import { Sparkles } from 'lucide-react';
import { GenerateInterviewResponse } from '@/types/interview';
import { InterviewPrepModal } from './InterviewPrepModal';
import { InterviewResults } from './InterviewResults';

interface InterviewPrepButtonProps {
    resumeId: string;
    className?: string; // Allow custom styling positioning
}

export function InterviewPrepButton({ resumeId, className }: InterviewPrepButtonProps) {
    const [showModal, setShowModal] = useState(false);
    const [results, setResults] = useState<GenerateInterviewResponse | null>(null);

    const handleSuccess = (data: GenerateInterviewResponse) => {
        setResults(data);
        setShowModal(false);
    };

    return (
        <>
            <button
                onClick={() => setShowModal(true)}
                className={`flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white rounded-lg shadow-lg shadow-indigo-500/20 transition-all font-medium text-sm ${className || ''}`}
            >
                <Sparkles className="h-4 w-4" />
                Interview Prep
            </button>

            <InterviewPrepModal
                isOpen={showModal}
                onClose={() => setShowModal(false)}
                resumeId={resumeId}
                onSuccess={handleSuccess}
            />

            {results && (
                <InterviewResults
                    data={results}
                    onClose={() => setResults(null)}
                />
            )}
        </>
    );
}
