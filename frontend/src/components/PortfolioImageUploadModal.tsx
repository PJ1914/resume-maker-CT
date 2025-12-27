import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Upload, Image as ImageIcon, Trash2, Check } from 'lucide-react';
import toast from 'react-hot-toast';
import { auth } from '../lib/firebase';
import { API_URL } from '../config/firebase';

interface PortfolioImageUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: (images: {
    profilePhoto: string | null;
    projectImages: { [key: string]: string };
  }) => void;
  projects: Array<{ id?: string; name: string }>;
}

export const PortfolioImageUploadModal: React.FC<PortfolioImageUploadModalProps> = ({
  isOpen,
  onClose,
  onComplete,
  projects
}) => {
  const [profilePhoto, setProfilePhoto] = useState<File | null>(null);
  const [profilePhotoPreview, setProfilePhotoPreview] = useState<string | null>(null);
  const [projectImages, setProjectImages] = useState<{ [key: string]: File }>({});
  const [projectImagePreviews, setProjectImagePreviews] = useState<{ [key: string]: string }>({});
  const [uploading, setUploading] = useState(false);

  const handleProfilePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size must be less than 5MB');
      return;
    }

    setProfilePhoto(file);

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setProfilePhotoPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleProjectImageSelect = (projectId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size must be less than 5MB');
      return;
    }

    setProjectImages(prev => ({ ...prev, [projectId]: file }));

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setProjectImagePreviews(prev => ({ ...prev, [projectId]: reader.result as string }));
    };
    reader.readAsDataURL(file);
  };

  const removeProfilePhoto = () => {
    setProfilePhoto(null);
    setProfilePhotoPreview(null);
  };

  const removeProjectImage = (projectId: string) => {
    setProjectImages(prev => {
      const newImages = { ...prev };
      delete newImages[projectId];
      return newImages;
    });
    setProjectImagePreviews(prev => {
      const newPreviews = { ...prev };
      delete newPreviews[projectId];
      return newPreviews;
    });
  };

  const handleUploadAndContinue = async () => {
    setUploading(true);

    try {
      const uploadedImages: {
        profilePhoto: string | null;
        projectImages: { [key: string]: string };
      } = {
        profilePhoto: null,
        projectImages: {}
      };

      // Upload profile photo
      if (profilePhoto) {
        const formData = new FormData();
        formData.append('file', profilePhoto);
        formData.append('type', 'profile');

        const response = await fetch(`${API_URL}/api/portfolio/upload-image`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${await auth.currentUser?.getIdToken()}`
          },
          body: formData
        });

        if (!response.ok) throw new Error('Failed to upload profile photo');
        const data = await response.json();
        uploadedImages.profilePhoto = data.url;
      }

      // Upload project images
      for (const [projectId, file] of Object.entries(projectImages)) {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('type', 'project');
        formData.append('project_id', projectId);

        const response = await fetch(`${API_URL}/api/portfolio/upload-image`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${await auth.currentUser?.getIdToken()}`
          },
          body: formData
        });

        if (!response.ok) throw new Error(`Failed to upload image for project ${projectId}`);
        const data = await response.json();
        uploadedImages.projectImages[projectId] = data.url;
      }

      toast.success('Images uploaded successfully!');
      onComplete(uploadedImages);
    } catch (error: any) {
      console.error('Upload error:', error);
      toast.error(error.message || 'Failed to upload images');
    } finally {
      setUploading(false);
    }
  };

  const handleSkip = () => {
    onComplete({ profilePhoto: null, projectImages: {} });
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.95, y: 20 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-white dark:bg-secondary-900 rounded-lg shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden border-4 border-secondary-900 dark:border-white"
        >
          {/* Header */}
          <div className="p-6 border-b border-secondary-200 dark:border-secondary-800">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="bg-secondary-100 dark:bg-secondary-800 rounded-full p-3">
                  <ImageIcon className="w-6 h-6 text-secondary-900 dark:text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-secondary-900 dark:text-white">
                    Add Portfolio Images
                  </h2>
                  <p className="text-secondary-600 dark:text-secondary-400 text-sm">
                    Upload images to enhance your portfolio (optional)
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="text-secondary-400 hover:text-secondary-600 dark:hover:text-secondary-300 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
            <div className="space-y-8">

              {/* Profile Photo Upload */}
              <div>
                <label className="block text-sm font-semibold text-secondary-900 dark:text-white mb-3">
                  Profile Photo
                </label>

                {profilePhotoPreview ? (
                  <div className="relative inline-block">
                    <img
                      src={profilePhotoPreview}
                      alt="Profile preview"
                      className="w-32 h-32 rounded-full object-cover border-4 border-secondary-200 dark:border-secondary-700"
                    />
                    <button
                      onClick={removeProfilePhoto}
                      className="absolute -top-2 -right-2 p-2 bg-red-500 hover:bg-red-600 text-white rounded-full shadow-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-secondary-300 dark:border-secondary-700 rounded-lg cursor-pointer hover:border-secondary-400 dark:hover:border-secondary-600 transition-colors bg-secondary-50 dark:bg-secondary-800/50">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <Upload className="w-10 h-10 text-secondary-400 mb-3" />
                      <p className="text-sm text-secondary-600 dark:text-secondary-400 mb-1">
                        <span className="font-semibold">Click to upload</span> or drag and drop
                      </p>
                      <p className="text-xs text-secondary-500">PNG, JPG, WEBP (Max 5MB)</p>
                    </div>
                    <input
                      type="file"
                      className="hidden"
                      accept="image/*"
                      onChange={handleProfilePhotoSelect}
                    />
                  </label>
                )}
              </div>

              {/* Project Images Upload */}
              {projects && projects.length > 0 && (
                <div>
                  <label className="block text-sm font-semibold text-secondary-900 dark:text-white mb-3">
                    Project Images
                  </label>
                  <p className="text-xs text-secondary-500 dark:text-secondary-400 mb-4">
                    Add images to showcase your projects
                  </p>

                  <div className="space-y-4">
                    {projects.map((project, index) => {
                      const projectId = project.id || `project-${index}`;
                      const preview = projectImagePreviews[projectId];

                      return (
                        <div
                          key={projectId}
                          className="bg-secondary-50 dark:bg-secondary-800/50 rounded-lg p-4 border border-secondary-200 dark:border-secondary-700"
                        >
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1">
                              <h4 className="font-medium text-secondary-900 dark:text-white mb-2">
                                {project.name}
                              </h4>

                              {preview ? (
                                <div className="relative inline-block">
                                  <img
                                    src={preview}
                                    alt={`${project.name} preview`}
                                    className="w-32 h-24 rounded-lg object-cover border-2 border-secondary-300 dark:border-secondary-600"
                                  />
                                  <button
                                    onClick={() => removeProjectImage(projectId)}
                                    className="absolute -top-2 -right-2 p-1.5 bg-red-500 hover:bg-red-600 text-white rounded-full shadow-lg transition-colors"
                                  >
                                    <Trash2 className="w-3 h-3" />
                                  </button>
                                </div>
                              ) : (
                                <label className="inline-flex items-center gap-2 px-4 py-2 bg-secondary-900 dark:bg-white text-white dark:text-secondary-900 rounded-lg cursor-pointer hover:bg-secondary-800 dark:hover:bg-secondary-100 transition-colors">
                                  <Upload className="w-4 h-4" />
                                  <span className="text-sm font-medium">Upload Image</span>
                                  <input
                                    type="file"
                                    className="hidden"
                                    accept="image/*"
                                    onChange={(e) => handleProjectImageSelect(projectId, e)}
                                  />
                                </label>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Info Box */}
              <div className="bg-secondary-50 dark:bg-secondary-800/50 rounded-lg p-4 border border-secondary-200 dark:border-secondary-700">
                <div className="flex items-start gap-3">
                  <ImageIcon className="w-5 h-5 text-secondary-900 dark:text-white flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-secondary-600 dark:text-secondary-400">
                    <p className="font-semibold text-secondary-900 dark:text-white mb-1">
                      Image Guidelines
                    </p>
                    <ul className="list-disc list-inside space-y-1 text-xs">
                      <li>Profile photo: Square format recommended (500x500px)</li>
                      <li>Project images: Landscape format recommended (1200x600px)</li>
                      <li>Maximum file size: 5MB per image</li>
                      <li>Supported formats: PNG, JPG, WEBP</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="p-6 border-t border-secondary-200 dark:border-secondary-800 flex gap-3">
            <button
              onClick={handleSkip}
              disabled={uploading}
              className="flex-1 px-4 py-3 bg-secondary-100 dark:bg-secondary-800 text-secondary-900 dark:text-white rounded-lg font-semibold hover:bg-secondary-200 dark:hover:bg-secondary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Skip Images
            </button>
            <button
              onClick={handleUploadAndContinue}
              disabled={uploading || (!profilePhoto && Object.keys(projectImages).length === 0)}
              className="flex-1 px-4 py-3 bg-secondary-900 dark:bg-white text-white dark:text-secondary-900 rounded-lg font-semibold hover:bg-secondary-800 dark:hover:bg-secondary-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {uploading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white dark:border-secondary-900 border-t-transparent rounded-full animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  Upload & Continue
                </>
              )}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default PortfolioImageUploadModal;
