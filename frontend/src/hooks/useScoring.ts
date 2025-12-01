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
    mutationFn: ({ resumeId, preferGemini = true, useCache = true }: { resumeId: string; preferGemini?: boolean; useCache?: boolean }) =>
      resumeService.scoreResume(resumeId, preferGemini, useCache),
    onSuccess: (data, variables) => {
      // Directly update the cache with the new score from POST response
      // This ensures we show the correct score immediately without refetching
      console.log('[useScoreResume] Score received:', data.scoring_method, 'Total:', data.total_score);
      queryClient.setQueryData(scoringKeys.score(variables.resumeId), data);
      toast.success('ATS score calculated successfully!');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to calculate ATS score');
    },
  });
}
