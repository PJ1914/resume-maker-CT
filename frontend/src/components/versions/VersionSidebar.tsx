import React, { useEffect, useState } from 'react';
import { History, X, Loader2, Save } from 'lucide-react';
import { resumeService } from '@/services/resume.service';
import { ResumeVersionCard } from './ResumeVersionCard';
import { getResume } from '@/services/resume-editor.service';
import { useAuth } from '@/context/AuthContext';

interface VersionSidebarProps {
    resumeId: string;
    isOpen: boolean;
    onClose: () => void;
    onViewVersion: (versionId: string) => void;
}

export function VersionSidebar({ resumeId, isOpen, onClose, onViewVersion }: VersionSidebarProps) {
    const [versions, setVersions] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isOpen) {
            fetchVersions();
        }
    }, [isOpen, resumeId]);

    const fetchVersions = async () => {
        setLoading(true);
        try {
            const data = await resumeService.getVersions(resumeId);
            setVersions(data);
        } catch (error) {
            console.error("Failed to fetch versions", error);
        } finally {
            setLoading(false);
        }
    };

    const { user } = useAuth();
    const [saving, setSaving] = useState(false);

    const handleManualSave = async () => {
        if (!user || !resumeId) return;
        setSaving(true);
        try {
            // Fetch latest data to ensure we save what's on server/local
            const currentData = await getResume(user.uid, resumeId);
            if (currentData) {
                await resumeService.createVersion(resumeId, {
                    resume_json: currentData,
                    job_role: "Manual Save",
                    company: "User Version"
                });
                await fetchVersions(); // Refresh list
            }
        } catch (error) {
            console.error("Failed to save manual version", error);
        } finally {
            setSaving(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-y-0 right-0 w-80 bg-white dark:bg-secondary-900 border-l border-secondary-200 dark:border-secondary-800 shadow-xl z-50 transform transition-transform animate-in slide-in-from-right duration-300">
            <div className="flex items-center justify-between p-4 border-b border-secondary-200 dark:border-secondary-800">
                <h3 className="font-semibold text-lg text-secondary-900 dark:text-white flex items-center gap-2">
                    <History className="h-5 w-5" /> Version History
                </h3>
                <button onClick={onClose} className="text-secondary-500 hover:text-secondary-900 dark:hover:text-white">
                    <X className="h-5 w-5" />
                </button>
            </div>

            <div className="p-4 border-b border-secondary-200 dark:border-secondary-800">
                <button
                    onClick={handleManualSave}
                    disabled={saving}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors text-sm font-medium disabled:opacity-70 disabled:cursor-not-allowed"
                >
                    {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                    {saving ? 'Saving...' : 'Save Current Version'}
                </button>
            </div>

            <div className="p-4 overflow-y-auto h-[calc(100vh-130px)]">
                {loading ? (
                    <div className="flex justify-center py-8">
                        <Loader2 className="h-6 w-6 animate-spin text-primary-500" />
                    </div>
                ) : versions.length === 0 ? (
                    <div className="text-center text-secondary-500 py-8">
                        No versions found.
                    </div>
                ) : (
                    <div className="space-y-3">
                        {versions.map(v => (
                            <ResumeVersionCard
                                key={v.version_id}
                                version={v}
                                onView={onViewVersion}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
