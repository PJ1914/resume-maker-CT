export interface QAPair {
    q: string;
    a: string;
}

export interface InterviewSession {
    id?: string;
    user_id?: string;
    resume_id?: string;
    role: string;
    experience_level: string;
    technical_questions: QAPair[];
    hr_questions: QAPair[];
    created_at?: string;
    credits_used?: number;
}

export interface GenerateInterviewRequest {
    resume_id: string;
    role: string;
    experience_level: string;
    question_types: string[];
}

export interface GenerateInterviewResponse {
    session_id: string;
    technical: QAPair[];
    hr: QAPair[];
    credits_used: number;
}
