/**
 * Templated Resume Preview Component
 * Fetches real PDF preview from backend using the selected template
 */

import React, { useState, useEffect, useCallback } from 'react';
import { getAuthToken } from '../services/auth.service';
import { API_URL } from '@/config/firebase';

interface TemplatedResumePreviewProps {
    resumeId: string;
    template: string;
    lastSaved?: number; // Timestamp to trigger refresh
}

export const TemplatedResumePreview: React.FC<TemplatedResumePreviewProps> = ({
    resumeId,
    template,
    lastSaved,
}) => {
    const [pdfUrl, setPdfUrl] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchPreview = useCallback(async () => {
        if (!resumeId || !template) return;

        setLoading(true);
        setError(null);

        try {
            const token = await getAuthToken();
            // Add cache-busting query param to force fresh fetch
            const response = await fetch(
                `${API_URL}/api/resumes/${resumeId}/preview/${template}?t=${Date.now()}`,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Cache-Control': 'no-cache',
                    },
                }
            );

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ detail: 'Preview failed' }));
                throw new Error(errorData.detail || `Preview failed with status ${response.status}`);
            }

            // Create blob URL from response
            const blob = await response.blob();
            const url = URL.createObjectURL(blob);

            // Clean up old URL
            if (pdfUrl) {
                URL.revokeObjectURL(pdfUrl);
            }

            setPdfUrl(url);
        } catch (err) {
            console.error('Preview fetch error:', err);
            setError(err instanceof Error ? err.message : 'Failed to load preview');
        } finally {
            setLoading(false);
        }
    }, [resumeId, template, lastSaved]);

    // Fetch preview on mount and when dependencies change
    useEffect(() => {
        fetchPreview();

        // Cleanup on unmount
        return () => {
            if (pdfUrl) {
                URL.revokeObjectURL(pdfUrl);
            }
        };
    }, [fetchPreview]);

    // Cleanup old URL when pdfUrl changes
    useEffect(() => {
        return () => {
            if (pdfUrl) {
                URL.revokeObjectURL(pdfUrl);
            }
        };
    }, [pdfUrl]);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-[600px] bg-white rounded shadow-lg">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-10 w-10 border-2 border-primary-600 border-t-transparent mx-auto mb-3"></div>
                    <p className="text-sm text-secondary-600">Generating preview...</p>
                    <p className="text-xs text-secondary-400 mt-1">Using template: {template}</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center h-[600px] bg-white rounded shadow-lg p-6">
                <svg className="w-12 h-12 text-red-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-sm text-red-600 mb-4">{error}</p>
                <button
                    onClick={fetchPreview}
                    className="px-4 py-2 bg-primary-600 text-white rounded-lg text-sm hover:bg-primary-700 transition-colors"
                >
                    Retry Preview
                </button>
            </div>
        );
    }

    return (
        <div className="w-full bg-white rounded shadow-lg overflow-hidden relative" style={{ height: '600px' }}>
            {/* Refresh button */}
            <button
                onClick={fetchPreview}
                disabled={loading}
                className="absolute top-2 right-2 z-10 p-2 bg-white hover:bg-gray-100 rounded-full shadow-md transition-colors disabled:opacity-50"
                title="Refresh Preview"
            >
                <svg className={`w-4 h-4 text-gray-600 ${loading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
            </button>
            {pdfUrl && (
                <iframe
                    src={`${pdfUrl}#view=FitH&toolbar=0&navpanes=0`}
                    className="w-full h-full border-0"
                    title="Resume Preview"
                />
            )}
        </div>
    );
};

export default TemplatedResumePreview;
