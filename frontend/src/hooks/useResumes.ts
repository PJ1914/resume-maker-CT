import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { resumeService } from '../services/resume.service';
import toast from 'react-hot-toast';

// Query keys
export const resumeKeys = {
  all: ['resumes'] as const,
  lists: () => [...resumeKeys.all, 'list'] as const,
  list: (filters?: any) => [...resumeKeys.lists(), filters] as const,
  details: () => [...resumeKeys.all, 'detail'] as const,
  detail: (id: string) => [...resumeKeys.details(), id] as const,
};

// Hook to get all resumes
export function useResumes() {
  return useQuery({
    queryKey: resumeKeys.list(),
    queryFn: async () => {
      try {
        console.log('[useResumes] Fetching resumes...');
        const response = await resumeService.listResumes();
        console.log('[useResumes] Response:', response);
        const resumes = response?.resumes || [];
        console.log('[useResumes] Resumes count:', resumes.length);
        return resumes;
      } catch (error) {
        console.error('[useResumes] Error fetching resumes:', error);
        return []; // Return empty array on error
      }
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
    retry: 1, // Retry once on failure
  });
}

// Hook to get single resume
export function useResume(id: string | undefined) {
  return useQuery({
    queryKey: resumeKeys.detail(id || ''),
    queryFn: () => resumeService.getResume(id!),
    enabled: !!id, // Only run if id exists
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

// Hook to delete resume
export function useDeleteResume() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => resumeService.deleteResume(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: resumeKeys.lists() });
      toast.success('Resume deleted successfully!');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to delete resume');
    },
  });
}
