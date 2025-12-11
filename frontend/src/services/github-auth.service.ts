import { 
  signInWithPopup, 
  linkWithPopup,
  unlink,
  getAdditionalUserInfo,
  OAuthCredential,
  reauthenticateWithPopup,
  fetchSignInMethodsForEmail,
  GithubAuthProvider
} from 'firebase/auth';
import { auth, githubProvider } from '../lib/firebase';

export interface GitHubAuthResult {
  accessToken: string;
  username: string;
  email: string;
  profileUrl: string;
}

/**
 * Sign in with GitHub (for new users or standalone GitHub login)
 */
export const signInWithGitHub = async (): Promise<GitHubAuthResult> => {
  try {
    const result = await signInWithPopup(auth, githubProvider);
    const credential = result.user;
    
    // Get GitHub access token from credential - CORRECT WAY
    const githubCredential = GithubAuthProvider.credentialFromResult(result);
    const accessToken = githubCredential?.accessToken;
    
    if (!accessToken) {
      console.error('No access token in result:', result);
      throw new Error('Failed to get GitHub access token');
    }

    // Get additional user info
    const additionalUserInfo = getAdditionalUserInfo(result);
    const githubProfile = additionalUserInfo?.profile as any;

    // Store GitHub token and profile in Firestore
    await storeGitHubCredentials(
      credential.uid,
      accessToken,
      githubProfile?.login || '',
      githubProfile?.email || credential.email || '',
      githubProfile?.html_url || ''
    );

    return {
      accessToken,
      username: githubProfile?.login || '',
      email: githubProfile?.email || credential.email || '',
      profileUrl: githubProfile?.html_url || ''
    };
  } catch (error: any) {
    console.error('GitHub sign-in error:', error);
    throw new Error(error.message || 'GitHub authentication failed');
  }
};

/**
 * Link GitHub account to existing Firebase user
 * This opens a GitHub OAuth popup and stores the credentials in Firestore
 */
export const linkGitHubAccount = async (): Promise<GitHubAuthResult> => {
  try {
    const currentUser = auth.currentUser;
    
    if (!currentUser) {
      throw new Error('No user is currently signed in');
    }

    const result = await linkWithPopup(currentUser, githubProvider);
    
    // Get GitHub access token - CORRECT WAY
    const credential = GithubAuthProvider.credentialFromResult(result);
    const accessToken = credential?.accessToken;
    
    if (!accessToken) {
      console.error('No access token in result:', result);
      throw new Error('Failed to get GitHub access token');
    }

    // Get additional user info
    const additionalUserInfo = getAdditionalUserInfo(result);
    const githubProfile = additionalUserInfo?.profile as any;

    // Store GitHub token and profile
    await storeGitHubCredentials(
      currentUser.uid,
      accessToken,
      githubProfile?.login || '',
      githubProfile?.email || currentUser.email || '',
      githubProfile?.html_url || ''
    );

    return {
      accessToken,
      username: githubProfile?.login || '',
      email: githubProfile?.email || currentUser.email || '',
      profileUrl: githubProfile?.html_url || ''
    };
  } catch (error: any) {
    console.error('GitHub linking error:', error);
    
    // Handle various error cases
    if (error.code === 'auth/credential-already-in-use') {
      throw new Error('This GitHub account is already linked to another user. Please unlink it from the other account first, or sign in with that account.');
    }
    
    if (error.code === 'auth/popup-closed-by-user') {
      throw new Error('GitHub popup was closed. Please try again.');
    }
    
    if (error.code === 'auth/popup-blocked') {
      throw new Error('GitHub popup was blocked by your browser. Please allow popups and try again.');
    }
    
    if (error.code === 'auth/cancelled-popup-request') {
      throw new Error('Another popup is already open. Please close it and try again.');
    }
    
    if (error.code === 'auth/account-exists-with-different-credential') {
      throw new Error('An account already exists with this email. Please sign in with your original method first.');
    }
    
    throw new Error(error.message || 'Failed to link GitHub account');
  }
};

/**
 * Store GitHub credentials via backend API (stores in resume-maker Firestore)
 */
const storeGitHubCredentials = async (
  userId: string,
  accessToken: string,
  username: string,
  email: string,
  profileUrl: string
) => {
  try {
    // Get Firebase ID token for backend authentication
    const user = auth.currentUser
    if (!user) {
      throw new Error('No authenticated user')
    }
    
    const idToken = await user.getIdToken()
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'
    
    const response = await fetch(`${API_URL}/api/auth/github-token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${idToken}`
      },
      body: JSON.stringify({
        github_token: accessToken,
        username,
        email,
        photo_url: profileUrl
      })
    })
    
    if (!response.ok) {
      throw new Error(`Failed to store GitHub token: ${response.statusText}`)
    }
    
    console.log('[GitHub Auth] Token stored via backend')
  } catch (error) {
    console.error('[GitHub Auth] Error storing credentials:', error)
    throw error
  }
};

/**
 * Get GitHub credentials via backend API
 */
export const getGitHubCredentials = async (userId: string): Promise<GitHubAuthResult | null> => {
  try {
    const user = auth.currentUser
    if (!user) {
      return null
    }
    
    const idToken = await user.getIdToken()
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'
    
    const response = await fetch(`${API_URL}/api/auth/github-token`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${idToken}`
      }
    })
    
    if (!response.ok) {
      return null
    }
    
    const data = await response.json()
    
    if (!data.github_token) {
      return null
    }
    
    return {
      accessToken: data.github_token,
      username: data.username || '',
      email: data.email || '',
      profileUrl: data.photo_url || ''
    }
  } catch (error) {
    console.error('Error fetching GitHub credentials:', error)
    return null
  }
};

/**
 * Check if user has GitHub linked via backend API
 */
export const isGitHubLinked = async (userId: string): Promise<boolean> => {
  const credentials = await getGitHubCredentials(userId)
  return credentials !== null
};

/**
 * Unlink GitHub account from Firebase Auth and backend Firestore
 */
export const unlinkGitHubAccount = async (userId: string): Promise<void> => {
  try {
    const currentUser = auth.currentUser;
    
    if (!currentUser || currentUser.uid !== userId) {
      throw new Error('User not authenticated');
    }

    // Unlink from Firebase Auth
    try {
      await unlink(currentUser, 'github.com');
      console.log('Successfully unlinked GitHub from Firebase Auth');
    } catch (unlinkError: any) {
      // If not linked in Firebase Auth, that's okay
      if (unlinkError.code !== 'auth/no-such-provider') {
        console.warn('Firebase Auth unlink warning:', unlinkError);
      }
    }

    // Remove from backend Firestore via API
    try {
      const idToken = await currentUser.getIdToken()
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'
      
      const response = await fetch(`${API_URL}/api/auth/github-token`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${idToken}`
        }
      })
      
      if (response.ok) {
        console.log('Successfully removed GitHub data from backend')
      } else {
        console.warn('Failed to remove GitHub data from backend:', await response.text())
      }
    } catch (apiError) {
      console.error('Error removing GitHub data from backend:', apiError)
      // Don't fail the unlink if backend deletion fails
    }
    
    console.log('Successfully unlinked GitHub account');
  } catch (error) {
    console.error('Error unlinking GitHub:', error);
    throw new Error('Failed to unlink GitHub account');
  }
};
