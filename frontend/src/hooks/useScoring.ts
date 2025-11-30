import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { resumeService } from '../services/resume.service';
import toast from 'react-hot-toast';

// Query keys
export const scoringKeys = {
  all: ['scoring'] as const,
  score: (resumeId: string) => [...scoringKeys.all, resumeId] as const,
};

// Hook to get resume score
export function useResumeScore(resumeId: string | undefined) {
  return useQuery({
    queryKey: scoringKeys.score(resumeId || ''),
    queryFn: () => resumeService.getScore(resumeId!),
    enabled: !!resumeId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 1,
  });
}

// Hook to trigger ATS scoring
export function useScoreResume() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ resumeId, preferGemini = true }: { resumeId: string; preferGemini?: boolean }) =>
      resumeService.scoreResume(resumeId, preferGemini),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: scoringKeys.score(variables.resumeId) });
      toast.success('ATS score calculated successfully!');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to calculate ATS score');
    },
  });
}
