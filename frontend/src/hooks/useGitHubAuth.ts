import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  linkGitHubAccount,
  signInWithGitHub,
  getGitHubCredentials,
  isGitHubLinked,
  unlinkGitHubAccount,
  GitHubAuthResult
} from '../services/github-auth.service';

export const useGitHubAuth = () => {
  const { user } = useAuth();
  const [isLinking, setIsLinking] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const [githubData, setGithubData] = useState<GitHubAuthResult | null>(null);
  const [isLinked, setIsLinked] = useState(false);

  /**
   * Link GitHub account to current user
   */
  const linkGitHub = async () => {
    if (!user) {
      throw new Error('No user signed in');
    }

    setIsLinking(true);
    try {
      const result = await linkGitHubAccount();
      setGithubData(result);
      setIsLinked(true);
      return result;
    } catch (error: any) {
      console.error('Failed to link GitHub:', error);
      throw error;
    } finally {
      setIsLinking(false);
    }
  };

  /**
   * Sign in with GitHub (standalone)
   */
  const signIn = async () => {
    setIsLinking(true);
    try {
      const result = await signInWithGitHub();
      setGithubData(result);
      setIsLinked(true);
      return result;
    } catch (error: any) {
      console.error('Failed to sign in with GitHub:', error);
      throw error;
    } finally {
      setIsLinking(false);
    }
  };

  /**
   * Check if GitHub is linked
   */
  const checkGitHubLink = async () => {
    if (!user) return false;

    setIsChecking(true);
    try {
      const linked = await isGitHubLinked(user.uid);
      setIsLinked(linked);
      
      if (linked) {
        const credentials = await getGitHubCredentials(user.uid);
        setGithubData(credentials);
      }
      
      return linked;
    } catch (error) {
      console.error('Failed to check GitHub link:', error);
      return false;
    } finally {
      setIsChecking(false);
    }
  };

  /**
   * Unlink GitHub account
   */
  const unlinkGitHub = async () => {
    if (!user) return;

    try {
      await unlinkGitHubAccount(user.uid);
      setGithubData(null);
      setIsLinked(false);
    } catch (error) {
      console.error('Failed to unlink GitHub:', error);
      throw error;
    }
  };

  /**
   * Get GitHub credentials
   */
  const getCredentials = async (): Promise<GitHubAuthResult | null> => {
    if (!user) return null;

    try {
      const credentials = await getGitHubCredentials(user.uid);
      setGithubData(credentials);
      return credentials;
    } catch (error) {
      console.error('Failed to get credentials:', error);
      return null;
    }
  };

  return {
    linkGitHub,
    signInWithGitHub: signIn,
    unlinkGitHub,
    checkGitHubLink,
    getCredentials,
    isLinking,
    isChecking,
    isLinked,
    githubData
  };
};
