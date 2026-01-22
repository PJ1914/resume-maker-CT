import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { resumeService } from '../services/resume.service';
import { creditKeys } from './useCredits';
import toast from 'react-hot-toast';

// Query keys
export const scoringKeys = {
  all: ['scoring'] as const,
  score: (resumeId: string) => [...scoringKeys.all, resumeId] as const,
};

// Hook to get resume score
export function useResumeScore(resumeId: string | undefined, enabled: boolean = false) {
  return useQuery({
    queryKey: scoringKeys.score(resumeId || ''),
    queryFn: () => resumeService.getScore(resumeId!),
    enabled: !!resumeId && enabled, // Only fetch when explicitly enabled
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 1,
    throwOnError: false, // Don't throw on 404, just return error in data
  });
}

// Hook to trigger ATS scoring
export function useScoreResume() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ resumeId, preferGemini = true, jobDescription }: { resumeId: string; preferGemini?: boolean; jobDescription?: string }) =>
      resumeService.scoreResume(resumeId, preferGemini, true, jobDescription),
    onSuccess: (data, variables) => {
      // Directly update the cache with the new score from POST response
      // This ensures we show the correct score immediately without refetching
      console.log('[useScoreResume] Score received:', data.scoring_method, 'Total:', data.total_score);
      queryClient.setQueryData(scoringKeys.score(variables.resumeId), data);

      // Update credits balance immediately if credits were deducted
      if (data.credits_used && data.credits_used > 0) {
        // Immediate UI update
        queryClient.setQueryData(creditKeys.balance(), (oldData: any) => {
          if (oldData) {
            return {
              ...oldData,
              balance: data.credits_remaining,
              total_spent: oldData.total_spent + data.credits_used,
            };
          }
          return oldData;
        });

        // Refetch fresh data from server in background (no await)
        queryClient.invalidateQueries({ queryKey: creditKeys.balance() }).catch(() => { });
      }

      toast.success('ATS score calculated successfully!');
    },
    // Don't handle error here - let the component handle it for custom modal support
  });
}
