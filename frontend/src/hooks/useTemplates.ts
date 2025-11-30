import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { templateService } from '../services/templates.service';
import toast from 'react-hot-toast';

// Query keys
export const templateKeys = {
  all: ['templates'] as const,
  lists: () => [...templateKeys.all, 'list'] as const,
  list: (filters?: any) => [...templateKeys.lists(), filters] as const,
  details: () => [...templateKeys.all, 'detail'] as const,
  detail: (id: string) => [...templateKeys.details(), id] as const,
};

// Hook to get all templates
export function useTemplates() {
  return useQuery({
    queryKey: templateKeys.list(),
    queryFn: () => templateService.listTemplates(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

// Hook to get single template
export function useTemplate(id: string | undefined) {
  return useQuery({
    queryKey: templateKeys.detail(id || ''),
    queryFn: () => templateService.getTemplate(id!),
    enabled: !!id,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}

// Hook to upload template (admin only)
export function useUploadTemplate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (file: File) => templateService.uploadTemplate(file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: templateKeys.lists() });
      toast.success('Template uploaded successfully!');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to upload template');
    },
  });
}

// Hook to delete template (admin only)
export function useDeleteTemplate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => templateService.deleteTemplate(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: templateKeys.lists() });
      toast.success('Template deleted successfully!');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to delete template');
    },
  });
}
