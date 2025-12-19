import { apiClient } from './api';
import { GenerateInterviewRequest, GenerateInterviewResponse, InterviewSession } from '../types/interview';

export const interviewService = {
    generate: async (data: GenerateInterviewRequest): Promise<GenerateInterviewResponse> => {
        return apiClient.post<GenerateInterviewResponse>('/api/interview/generate', data);
    },

    getSession: async (sessionId: string): Promise<InterviewSession> => {
        return apiClient.get<InterviewSession>(`/api/interview/session/${sessionId}`);
    },

    deductExportCredit: async (): Promise<void> => {
        await apiClient.post('/api/interview/deduct-export-credit');
    },

    getHistory: async (): Promise<InterviewSession[]> => {
        return apiClient.get<InterviewSession[]>('/api/interview/history');
    }
};
