import React from 'react';
import { FileText, Clock, Search, ArrowRight } from 'lucide-react';

interface ResumeVersionCardProps {
    version: {
        version_id: string;
        version_name: string;
        created_at: string;
    };
    onView: (versionId: string) => void;
    onDelete?: (versionId: string) => void;
}

export function ResumeVersionCard({ version, onView, onDelete }: ResumeVersionCardProps) {
    const formatDate = (dateString: string) => {
        // Create date object directly from ISO string (which should be in UTC from backend)
        const date = new Date(dateString);

        // Use Intl.DateTimeFormat for robust local time formatting
        return new Intl.DateTimeFormat('default', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        }).format(date);
    };

    return (
        <div className="bg-white dark:bg-secondary-800 rounded-lg p-3 border border-secondary-200 dark:border-secondary-700 hover:border-primary-500 transition-colors group">
            <div className="flex justify-between items-start mb-2">
                <div className="p-1.5 bg-primary-50 dark:bg-primary-900/30 rounded-md">
                    <FileText className="h-4 w-4 text-primary-600 dark:text-primary-400" />
                </div>
                <button
                    onClick={() => onView(version.version_id)}
                    className="p-1 hover:bg-secondary-100 dark:hover:bg-secondary-700 rounded text-secondary-500 hover:text-primary-600 transition-colors"
                    title="View Version"
                >
                    <ArrowRight className="h-4 w-4" />
                </button>
            </div>
            <div className="flex justify-between items-start">
                <h4 className="text-sm font-medium text-secondary-900 dark:text-white line-clamp-2 mb-1 flex-1 pr-2" title={version.version_name}>
                    {version.version_name}
                </h4>
            </div>
            <div className="flex items-center justify-between mt-2">
                <div className="flex items-center gap-1 text-xs text-secondary-500">
                    <Clock className="h-3 w-3" />
                    <span>{formatDate(version.created_at)}</span>
                </div>
                {onDelete && (
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onDelete(version.version_id);
                        }}
                        className="text-red-400 hover:text-red-600 p-1 rounded hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                        title="Delete Version"
                    >
                        <Trash2 className="h-3.5 w-3.5" />
                    </button>
                )}
            </div>
        </div>
    );
}

import { Trash2 } from 'lucide-react';
