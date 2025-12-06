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
      const response = await resumeService.listResumes();
      return response.resumes; // Extract resumes array from response
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
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

// Hook to create resume
export function useCreateResume() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: any) => resumeService.createResume(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: resumeKeys.lists() });
      toast.success('Resume created successfully!');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to create resume');
    },
  });
}

// Hook to update resume
export function useUpdateResume() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      resumeService.updateResume(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: resumeKeys.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: resumeKeys.lists() });
      toast.success('Resume updated successfully!');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update resume');
    },
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
