/**
 * Resume editor service for CRUD operations
 */

import { db, auth } from '../lib/firebase';
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { ResumeData } from '../types/resume';

/**
 * Delete local resume data (clears cached editor state)
 */
export async function deleteLocalResumeData(userId: string, resumeId: string): Promise<void> {
  try {
    const resumeRef = doc(db, 'users', userId, 'resume_data', resumeId);
    await deleteDoc(resumeRef);
    console.log('🗑️ Deleted local resume data');
  } catch (error) {
    console.error('Error deleting local resume data:', error);
    throw error;
  }
}

/**
 * Get resume data for editing
 */
export async function getResume(userId: string, resumeId: string): Promise<ResumeData | null> {
  try {
    const resumeRef = doc(db, 'users', userId, 'resume_data', resumeId);
    const resumeSnap = await getDoc(resumeRef);

    if (resumeSnap.exists()) {
      return resumeSnap.data() as ResumeData;
    }

    return null;
  } catch (error) {
    console.error('Error getting resume:', error);
    throw error;
  }
}

/**
 * Save entire resume data via backend API
 * This ensures data is saved to the correct Firestore database
 */
export async function saveResume(
  userId: string,
  resumeId: string,
  data: ResumeData
): Promise<void> {
  try {
    const user = auth.currentUser;
    if (!user) throw new Error('Not authenticated');

    const token = await user.getIdToken();
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

    const response = await fetch(`${API_URL}/api/resumes/${resumeId}/data`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ detail: 'Save failed' }));
      throw new Error(errorData.detail || `Save failed with status ${response.status}`);
    }
  } catch (error) {
    console.error('Error saving resume:', error);
    throw error;
  }
}

/**
 * Update specific section
 */
export async function updateSection(
  userId: string,
  resumeId: string,
  section: string,
  value: any
): Promise<void> {
  try {
    const resumeRef = doc(db, 'users', userId, 'resume_data', resumeId);

    await updateDoc(resumeRef, {
      [section]: value,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error('Error updating section:', error);
    throw error;
  }
}

/**
 * Get AI improvement suggestion for text
 */
export async function getAISuggestion(
  text: string,
  context: 'summary' | 'experience' | 'project' | 'skill'
): Promise<string> {
  try {
    const user = auth.currentUser;
    if (!user) throw new Error('Not authenticated');

    const token = await user.getIdToken();
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

    const response = await fetch(`${API_URL}/api/ai/improve`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ text, context }),
    });

    if (!response.ok) {
      throw new Error('Failed to get AI suggestion');
    }

    const data = await response.json();
    return data.improved;
  } catch (error) {
    console.error('Error getting AI suggestion:', error);
    throw error;
  }
}

/**
 * Get AI rewrite for text
 */
export async function getAIRewrite(
  text: string,
  context: 'summary' | 'experience' | 'project' | 'skill'
): Promise<string> {
  try {
    const user = auth.currentUser;
    if (!user) throw new Error('Not authenticated');

    const token = await user.getIdToken();
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

    const response = await fetch(`${API_URL}/api/ai/rewrite`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ text, context }),
    });

    if (!response.ok) {
      throw new Error('Failed to get AI rewrite');
    }

    const data = await response.json();
    return data.improved;
  } catch (error) {
    console.error('Error getting AI rewrite:', error);
    throw error;
  }
}
