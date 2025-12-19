import React, { useState } from 'react';
import { X, Copy, Check, Download, RefreshCw, MessageSquare } from 'lucide-react';
import { GenerateInterviewResponse } from '@/types/interview';
import { interviewService } from '@/services/interview.service';
import { jsPDF } from 'jspdf';

interface InterviewResultsProps {
    data: GenerateInterviewResponse;
    onClose: () => void;
}

export function InterviewResults({ data, onClose }: InterviewResultsProps) {
    const [activeTab, setActiveTab] = useState<'technical' | 'hr'>(data.technical.length > 0 ? 'technical' : 'hr');
    const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

    const handleCopy = (text: string, index: number) => {
        navigator.clipboard.writeText(text);
        setCopiedIndex(index);
        setTimeout(() => setCopiedIndex(null), 2000);
    };

    const handleExportPDF = async () => {
        try {
            await interviewService.deductExportCredit();
        } catch (e) {
            alert("Insufficient credits for PDF export or error occurred.");
            return;
        }

        const doc = new jsPDF();
        doc.setFontSize(16);
        doc.text("Interview Q&A", 20, 20);

        let y = 30;
        const questions = activeTab === 'technical' ? data.technical : data.hr;

        questions.forEach((qa, i) => {
            if (y > 270) {
                doc.addPage();
                y = 20;
            }
            doc.setFontSize(12);
            doc.setFont("helvetica", "bold");
            const qLines = doc.splitTextToSize(`Q${i + 1}: ${qa.q}`, 170);
            doc.text(qLines, 20, y);
            y += qLines.length * 7;

            doc.setFont("helvetica", "normal");
            const aLines = doc.splitTextToSize(`A: ${qa.a}`, 170);
            doc.text(aLines, 20, y);
            y += aLines.length * 7 + 10;
        });

        doc.save("interview-prep.pdf");
    };

    const questions = activeTab === 'technical' ? data.technical : data.hr;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

            <div className="relative w-full max-w-4xl h-[90vh] flex flex-col bg-white dark:bg-secondary-900 rounded-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">

                {/* Header */}
                <div className="flex-none p-4 sm:p-6 border-b border-secondary-100 dark:border-secondary-800 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-secondary-900 z-10">
                    <div>
                        <h2 className="text-xl font-bold text-secondary-900 dark:text-white flex items-center gap-2">
                            <MessageSquare className="h-6 w-6 text-primary-500" />
                            Interview Preparation
                        </h2>
                        <p className="text-sm text-secondary-500 dark:text-secondary-400 mt-1">
                            {data.technical.length + data.hr.length} personalized questions generated
                        </p>
                    </div>
                    <div className="flex items-center gap-3 w-full sm:w-auto">
                        <button
                            onClick={handleExportPDF}
                            className="flex-1 sm:flex-none justify-center px-4 py-2 bg-secondary-100 dark:bg-secondary-800 hover:bg-secondary-200 dark:hover:bg-secondary-700 text-secondary-700 dark:text-secondary-300 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                        >
                            <Download className="h-4 w-4" /> <span className="sm:inline">Export PDF</span>
                        </button>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-secondary-100 dark:hover:bg-secondary-800 rounded-lg text-secondary-400 hover:text-secondary-600 dark:hover:text-secondary-300 transition-colors"
                        >
                            <X className="h-5 w-5" />
                        </button>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex-none px-4 sm:px-6 pt-4 border-b border-secondary-100 dark:border-secondary-800 bg-secondary-50/50 dark:bg-secondary-900/50 overflow-x-auto no-scrollbar">
                    <div className="flex gap-6 min-w-max">
                        {data.technical.length > 0 && (
                            <button
                                onClick={() => setActiveTab('technical')}
                                className={`pb-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${activeTab === 'technical'
                                    ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                                    : 'border-transparent text-secondary-600 dark:text-secondary-400 hover:text-secondary-900 dark:hover:text-secondary-200'
                                    }`}
                            >
                                Technical Questions ({data.technical.length})
                            </button>
                        )}
                        {data.hr.length > 0 && (
                            <button
                                onClick={() => setActiveTab('hr')}
                                className={`pb-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${activeTab === 'hr'
                                    ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                                    : 'border-transparent text-secondary-600 dark:text-secondary-400 hover:text-secondary-900 dark:hover:text-secondary-200'
                                    }`}
                            >
                                HR Questions ({data.hr.length})
                            </button>
                        )}
                    </div>
                </div>

                {/* Content - Scrollable */}
                <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-secondary-50 dark:bg-secondary-950/30">
                    <div className="space-y-4 max-w-3xl mx-auto">
                        {questions.map((qa, index) => (
                            <div
                                key={index}
                                className="bg-white dark:bg-secondary-800 rounded-xl shadow-sm border border-secondary-100 dark:border-secondary-700 overflow-hidden"
                            >
                                <div className="p-4 border-b border-secondary-100 dark:border-secondary-700/50 bg-secondary-50/30 dark:bg-secondary-900/10">
                                    <div className="flex gap-3">
                                        <span className="flex-none w-6 h-6 rounded-full bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 flex items-center justify-center text-xs font-bold mt-0.5">
                                            Q{index + 1}
                                        </span>
                                        <h3 className="text-secondary-900 dark:text-secondary-100 font-medium leading-relaxed">
                                            {qa.q}
                                        </h3>
                                    </div>
                                </div>

                                <div className="p-4 bg-white dark:bg-secondary-800">
                                    <div className="flex flex-col sm:flex-row gap-3">
                                        {/* Spacer alignment - hidden on mobile to save space */}
                                        <div className="hidden sm:block flex-none w-6" />

                                        <div className="flex-1">
                                            <div className="prose dark:prose-invert max-w-none text-secondary-600 dark:text-secondary-300 text-sm leading-relaxed whitespace-pre-line">
                                                {qa.a}
                                            </div>

                                            <div className="flex flex-wrap items-center gap-2 mt-4 pt-4 border-t border-secondary-100 dark:border-secondary-700/50">
                                                <button
                                                    onClick={() => handleCopy(qa.a, index)}
                                                    className="flex items-center gap-1.5 text-xs font-medium text-secondary-500 dark:text-secondary-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                                                >
                                                    {copiedIndex === index ? (
                                                        <>
                                                            <Check className="h-3.5 w-3.5" /> Copied
                                                        </>
                                                    ) : (
                                                        <>
                                                            <Copy className="h-3.5 w-3.5" /> Copy Answer
                                                        </>
                                                    )}
                                                </button>
                                                <div className="hidden sm:block w-px h-3 bg-secondary-200 dark:bg-secondary-700" />
                                                <button className="flex items-center gap-1.5 text-xs font-medium text-secondary-500 dark:text-secondary-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
                                                    <RefreshCw className="h-3.5 w-3.5" /> Regenerate
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

            </div>
        </div>
    );
}
