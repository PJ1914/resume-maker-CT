import { useState, useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  getPortfolioTemplates,
  getUnlockedTemplates,
  unlockTemplate,
  generatePortfolio,
  deployPortfolio,
  getPortfolioSessions,
  deletePortfolioSession,
  GeneratePortfolioRequest,
  DeployPortfolioRequest
} from '../services/portfolio.service';
import { onSnapshot, doc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../context/AuthContext';

/**
 * Hook to fetch portfolio templates
 */
export const usePortfolioTemplates = () => {
  return useQuery({
    queryKey: ['portfolio-templates'],
    queryFn: getPortfolioTemplates,
    staleTime: 1000 * 60 * 5, // 5 minutes,
  });
};

/**
 * Hook to fetch unlocked templates with real-time updates
 */
export const useUnlockedTemplates = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!user?.uid) return;

    // Set up real-time listener for user's unlocked templates
    const unsubscribe = onSnapshot(
      doc(db, 'users', user.uid),
      (snapshot) => {
        if (snapshot.exists()) {
          const userData = snapshot.data();
          const unlockedTemplates = userData?.unlocked_templates || [];
          
          // Update the query cache with real-time data
          queryClient.setQueryData(['unlocked-templates'], unlockedTemplates);
          console.log('[Real-time] Unlocked templates updated:', unlockedTemplates);
        }
      },
      (error) => {
        console.error('[Real-time] Error listening to unlocked templates:', error);
      }
    );

    return () => unsubscribe();
  }, [user?.uid, queryClient]);

  return useQuery({
    queryKey: ['unlocked-templates'],
    queryFn: getUnlockedTemplates,
    staleTime: 0, // Always fetch fresh data - critical for unlock state
    gcTime: 5 * 60 * 1000, // Keep in cache for 5 minutes
  });
};

/**
 * Hook to unlock a template
 */
export const useUnlockTemplate = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ templateId, paymentMethod }: { templateId: string; paymentMethod: 'credits' | 'inr' }) =>
      unlockTemplate(templateId, paymentMethod),
    onSuccess: (data, variables) => {
      console.log('[useUnlockTemplate] Template unlocked successfully:', variables.templateId);
      // Force refetch unlocked templates immediately
      queryClient.invalidateQueries({ queryKey: ['unlocked-templates'] });
      queryClient.refetchQueries({ queryKey: ['unlocked-templates'] });
      // Invalidate credits balance (use correct key format)
      queryClient.invalidateQueries({ queryKey: ['credits', 'balance'] });
      queryClient.refetchQueries({ queryKey: ['credits', 'balance'] });
    },
    onError: (error: any) => {
      console.error('[useUnlockTemplate] Failed to unlock template:', error);
    },
  });
};

/**
 * Hook for portfolio generation workflow
 */
export const usePortfolioGeneration = () => {
  const queryClient = useQueryClient();
  const [previewHtml, setPreviewHtml] = useState<string | null>(null);
  const [zipUrl, setZipUrl] = useState<string | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);

  const generateMutation = useMutation({
    mutationFn: (request: GeneratePortfolioRequest) => {
      console.log('[usePortfolioGeneration] Generating portfolio with request:', request);
      return generatePortfolio(request);
    },
    onSuccess: (data) => {
      console.log('[usePortfolioGeneration] Generation successful:', data);
      setPreviewHtml(data.html_preview);
      setZipUrl(data.zip_url);
      setSessionId(data.session_id);
      // Invalidate credits and sessions
      queryClient.invalidateQueries({ queryKey: ['credits', 'balance'] });
      queryClient.invalidateQueries({ queryKey: ['portfolio-sessions'] });
    },
    onError: (error) => {
      console.error('[usePortfolioGeneration] Generation failed:', error);
    },
  });

  const deployMutation = useMutation({
    mutationFn: (request: DeployPortfolioRequest) => deployPortfolio(request),
    onSuccess: () => {
      // Invalidate credits and sessions
      queryClient.invalidateQueries({ queryKey: ['credits', 'balance'] });
      queryClient.invalidateQueries({ queryKey: ['portfolio-sessions'] });
    },
  });

  const clearPreview = () => {
    setPreviewHtml(null);
    setZipUrl(null);
    setSessionId(null);
  };

  return {
    generate: generateMutation.mutate,
    deploy: deployMutation.mutate,
    isGenerating: generateMutation.isPending,
    isDeploying: deployMutation.isPending,
    generateError: generateMutation.error,
    deployError: deployMutation.error,
    deployResult: deployMutation.data,
    previewHtml,
    zipUrl,
    sessionId,
    clearPreview,
  };
};

/**
 * Hook to fetch portfolio sessions (history)
 */
export const usePortfolioSessions = () => {
  return useQuery({
    queryKey: ['portfolio-sessions'],
    queryFn: getPortfolioSessions,
    staleTime: 1000 * 60, // 1 minute
  });
};

/**
 * Hook to delete a portfolio session
 */
export const useDeletePortfolioSession = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (sessionId: string) => deletePortfolioSession(sessionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['portfolio-sessions'] });
    },
  });
};
