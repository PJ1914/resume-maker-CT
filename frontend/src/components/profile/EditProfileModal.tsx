import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Camera, Loader, Check } from 'lucide-react'
import toast from 'react-hot-toast'
import { userProfileService } from '@/services/user-profile.service'
import { useAuth } from '@/context/AuthContext'

interface EditProfileModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function EditProfileModal({ isOpen, onClose }: EditProfileModalProps) {
  const { user } = useAuth()
  const [displayName, setDisplayName] = useState(user?.displayName || '')
  const [photoURL, setPhotoURL] = useState(user?.photoURL || '')
  const [isLoading, setIsLoading] = useState(false)
  const [previewImage, setPreviewImage] = useState<string>(user?.photoURL || '')

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size must be less than 5MB')
      return
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select a valid image file')
      return
    }

    try {
      const dataUrl = await userProfileService.uploadProfileImage(file)
      setPreviewImage(dataUrl)
      setPhotoURL(dataUrl)
      toast.success('Image selected successfully')
    } catch (error) {
      toast.error('Failed to upload image')
    }
  }

  const handleSave = async () => {
    if (!displayName.trim()) {
      toast.error('Display name cannot be empty')
      return
    }

    setIsLoading(true)
    try {
      await userProfileService.updateProfile(displayName, photoURL)
      toast.success('Profile updated successfully')
      onClose()
    } catch (error) {
      toast.error('Failed to update profile')
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="relative w-full max-w-md mx-4 bg-white dark:bg-[#111111] border border-secondary-200 dark:border-white/10 rounded-2xl p-6 shadow-2xl"
          >
            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-1.5 text-secondary-400 dark:text-gray-400 hover:text-secondary-900 dark:hover:text-white hover:bg-secondary-100 dark:hover:bg-white/10 rounded-lg transition-colors"
            >
              <X className="h-5 w-5" />
            </button>

            {/* Header */}
            <h2 className="text-2xl font-bold text-secondary-900 dark:text-white mb-6">Edit Profile</h2>

            {/* Profile Image Section */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-secondary-700 dark:text-gray-300 mb-3">Profile Picture</label>
              <div className="flex items-center gap-4">
                <div className="h-24 w-24 rounded-full bg-secondary-100 dark:bg-white/10 flex items-center justify-center overflow-hidden border-2 border-secondary-200 dark:border-white/20 flex-shrink-0">
                  {previewImage ? (
                    <img src={previewImage} alt="Preview" className="h-full w-full object-cover" />
                  ) : (
                    <Camera className="h-8 w-8 text-secondary-400 dark:text-gray-400" />
                  )}
                </div>

                <div className="flex-1 space-y-2">
                  <label className="flex items-center justify-center px-4 py-2 rounded-lg bg-secondary-100 dark:bg-white/10 hover:bg-secondary-200 dark:hover:bg-white/20 border border-secondary-200 dark:border-white/20 text-secondary-900 dark:text-white text-sm font-medium cursor-pointer transition-colors">
                    <Camera className="h-4 w-4 mr-2" />
                    Change Photo
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                  </label>
                  <p className="text-xs text-secondary-500 dark:text-gray-400">Max 5MB • JPG, PNG supported</p>
                </div>
              </div>
            </div>

            {/* Display Name Section */}
            <div className="mb-6">
              <label htmlFor="displayName" className="block text-sm font-medium text-secondary-700 dark:text-gray-300 mb-2">
                Display Name
              </label>
              <input
                id="displayName"
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Enter your name"
                className="w-full px-4 py-3 rounded-lg bg-secondary-50 dark:bg-white/5 border border-secondary-200 dark:border-white/10 text-secondary-900 dark:text-white placeholder:text-secondary-400 dark:placeholder:text-gray-500 focus:border-secondary-400 dark:focus:border-white/30 focus:outline-none transition-colors"
              />
              <p className="text-xs text-secondary-500 dark:text-gray-400 mt-1">This is how others will see you</p>
            </div>

            {/* Email (Read-only) */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-secondary-700 dark:text-gray-300 mb-2">Email Address</label>
              <div className="px-4 py-3 rounded-lg bg-secondary-50 dark:bg-white/5 border border-secondary-200 dark:border-white/10 text-secondary-500 dark:text-gray-400 text-sm">
                {user?.email}
              </div>
              <p className="text-xs text-secondary-500 dark:text-gray-400 mt-1">Email cannot be changed here</p>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                onClick={onClose}
                disabled={isLoading}
                className="flex-1 px-4 py-3 rounded-lg bg-secondary-100 dark:bg-white/10 hover:bg-secondary-200 dark:hover:bg-white/20 text-secondary-700 dark:text-white text-sm font-medium border border-secondary-200 dark:border-white/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={isLoading}
                className="flex-1 px-4 py-3 rounded-lg bg-teal-600 hover:bg-teal-500 text-white text-sm font-medium flex items-center justify-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <Loader className="h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Check className="h-4 w-4" />
                    Save Changes
                  </>
                )}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
