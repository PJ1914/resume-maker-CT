import React, { useEffect, useState } from 'react';
import { resumeService } from '@/services/resume.service';
import { ResumeVersionCard } from './ResumeVersionCard';
import { Loader2, ArrowLeft } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { ConfirmModal } from '../ui/ConfirmModal';

export function VersionHistory() {
    const { resumeId } = useParams<{ resumeId: string }>();
    const navigate = useNavigate();
    const [versions, setVersions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [versionToDelete, setVersionToDelete] = useState<string | null>(null);

    useEffect(() => {
        if (resumeId) {
            loadVersions();
        }
    }, [resumeId]);

    const loadVersions = async () => {
        if (!resumeId) return;
        try {
            const data = await resumeService.getVersions(resumeId);
            setVersions(data);
        } catch (error) {
            console.error("Failed to load versions", error);
            toast.error("Failed to load history");
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteClick = (versionId: string) => {
        setVersionToDelete(versionId);
        setDeleteModalOpen(true);
    };

    const confirmDelete = async () => {
        if (!resumeId || !versionToDelete) return;

        try {
            await resumeService.deleteVersion(resumeId, versionToDelete);
            setVersions(prev => prev.filter(v => v.version_id !== versionToDelete));
            toast.success("Version deleted");
        } catch (error) {
            console.error("Failed to delete version", error);
            toast.error("Failed to delete version");
        } finally {
            setDeleteModalOpen(false);
            setVersionToDelete(null);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[50vh]">
                <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto p-6">
            <div className="mb-6 flex items-center gap-4">
                <button
                    onClick={() => navigate(-1)}
                    className="p-2 hover:bg-secondary-100 dark:hover:bg-secondary-800 rounded-full transition-colors"
                >
                    <ArrowLeft className="h-5 w-5" />
                </button>
                <h1 className="text-2xl font-bold text-secondary-900 dark:text-white">Version History</h1>
            </div>

            <div className="bg-white dark:bg-secondary-900 rounded-xl shadow-sm border border-secondary-200 dark:border-secondary-800 overflow-hidden">
                <div className="p-6 border-b border-secondary-200 dark:border-secondary-800">
                    <h2 className="text-lg font-semibold mb-1">Timeline</h2>
                    <p className="text-secondary-500 text-sm">Track changes and improvements to your resume.</p>
                </div>

                <div className="divide-y divide-secondary-200 dark:divide-secondary-800">
                    {versions.length === 0 ? (
                        <div className="p-8 text-center text-secondary-500">
                            No versions recorded yet. Optimize your resume to create versions.
                        </div>
                    ) : (
                        <div className="p-6 grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                            {versions.map(v => (
                                <ResumeVersionCard
                                    key={v.version_id}
                                    version={v}
                                    onView={(id) => {
                                        // Navigate to editor with version param
                                        navigate(`/editor/${resumeId}?version=${id}`);
                                    }}
                                    onDelete={handleDeleteClick}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </div>

            <ConfirmModal
                isOpen={deleteModalOpen}
                onClose={() => setDeleteModalOpen(false)}
                onConfirm={confirmDelete}
                title="Delete Version"
                message="Are you sure you want to delete this version? This action cannot be undone."
                type="danger"
                confirmText="Delete"
            />
        </div>
    );
}
