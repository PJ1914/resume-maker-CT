import { auth } from '@/lib/firebase'
import { updateProfile, updateEmail } from 'firebase/auth'

export const userProfileService = {
  /**
   * Update user's display name
   */
  async updateDisplayName(displayName: string) {
    const user = auth.currentUser
    if (!user) throw new Error('Not authenticated')
    
    await updateProfile(user, { displayName })
    return user
  },

  /**
   * Update user's profile photo URL
   */
  async updatePhotoURL(photoURL: string) {
    const user = auth.currentUser
    if (!user) throw new Error('Not authenticated')
    
    await updateProfile(user, { photoURL })
    return user
  },

  /**
   * Update both display name and photo URL
   */
  async updateProfile(displayName?: string, photoURL?: string) {
    const user = auth.currentUser
    if (!user) throw new Error('Not authenticated')

    const updates: any = {}
    if (displayName) updates.displayName = displayName
    if (photoURL) updates.photoURL = photoURL

    await updateProfile(user, updates)
    return user
  },

  /**
   * Upload profile image and return download URL
   */
  async uploadProfileImage(file: File): Promise<string> {
    // For now, we'll use base64 data URL
    // In production, you'd upload to Firebase Storage or another service
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => {
        resolve(reader.result as string)
      }
      reader.onerror = reject
      reader.readAsDataURL(file)
    })
  },
}
