import { apiClient } from './api'

export interface UploadUrlResponse {
  upload_url: string
  resume_id: string
  storage_path: string
  expires_in: number
}

export interface ResumeListItem {
  resume_id: string
  original_filename: string
  file_size: number
  status: string
  created_at: string
  latest_score: number | null
}

export interface ResumeDetail {
  resume_id: string
  filename: string
  original_filename: string
  content_type: string
  file_size: number
  storage_url: string | null
  status: string
  created_at: string
  updated_at: string
  parsed_text: string | null
  contact_info: any | null
  skills: any | null
  sections: any | null
  experience: any[] | null
  projects: any[] | null
  education: any[] | null
  layout_type: string | null
  latest_score: number | null
  template: string | null
  error_message: string | null
}

export const resumeService = {
  /**
   * Request a presigned upload URL for a resume file
   */
  async requestUploadUrl(
    filename: string,
    contentType: string,
    fileSize: number
  ): Promise<UploadUrlResponse> {
    return apiClient.post<UploadUrlResponse>('/api/upload-url', {
      filename,
      content_type: contentType,
      file_size: fileSize,
    })
  },

  /**
   * Upload file directly to storage using presigned URL
   */
  async uploadFile(uploadUrl: string, file: File): Promise<void> {
    const response = await fetch(uploadUrl, {
      method: 'PUT',
      body: file,
      headers: {
        'Content-Type': file.type,
      },
    })

    if (!response.ok) {
      throw new Error(`Upload failed: ${response.statusText}`)
    }
  },

  /**
   * Notify backend that upload is complete
   */
  async uploadCallback(resumeId: string, storagePath: string): Promise<void> {
    return apiClient.post('/api/upload-callback', {
      resume_id: resumeId,
      storage_path: storagePath,
    })
  },

  /**
   * Upload file directly through backend (avoids CORS issues)
   * This is the recommended approach for development
   */
  async uploadDirect(file: File): Promise<{ resume_id: string; message: string; storage_path: string }> {
    const formData = new FormData()
    formData.append('file', file)

    // Use apiClient but override for multipart/form-data
    const token = await import('./auth.service').then(m => m.getAuthToken())
    
    const response = await fetch('/api/upload-direct', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: formData,
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.detail || 'Upload failed')
    }

    return await response.json()
  },

  /**
   * Get list of user's resumes
   */
  async listResumes(limit = 50): Promise<{ resumes: ResumeListItem[]; total: number }> {
    console.log('[resume.service] Fetching resumes with limit:', limit);
    try {
      const result = await apiClient.get(`/api/resumes?limit=${limit}`);
      console.log('[resume.service] Got resumes:', result);
      return result;
    } catch (error) {
      console.error('[resume.service] Error fetching resumes:', error);
      throw error;
    }
  },

  /**
   * Get detailed information about a resume
   */
  async getResume(resumeId: string): Promise<ResumeDetail> {
    return apiClient.get<ResumeDetail>(`/api/resumes/${resumeId}`)
  },

  /**
   * Delete a resume
   */
  async deleteResume(resumeId: string): Promise<void> {
    return apiClient.delete(`/api/resumes/${resumeId}`)
  },

  /**
   * Update resume data
   */
  async updateResume(resumeId: string, data: any): Promise<ResumeDetail> {
    return apiClient.put<ResumeDetail>(`/api/resumes/${resumeId}`, data)
  },

  /**
   * Create a new resume from form data
   */
  async createResume(data: any): Promise<{ resume_id: string; message: string }> {
    return apiClient.post('/api/create', data)
  },

  /**
   * Re-parse an existing resume with updated extraction logic
   */
  async reparseResume(resumeId: string): Promise<any> {
    return apiClient.post(`/api/resumes/${resumeId}/reparse`, {})
  },

  /**
   * Trigger ATS scoring for a resume
   */
  async scoreResume(resumeId: string, preferGemini: boolean = true, useCache: boolean = true): Promise<any> {
    return apiClient.post(`/api/scoring/${resumeId}`, { 
      prefer_gemini: preferGemini,
      use_cache: useCache 
    })
  },

  /**
   * Get detailed score for a resume
   */
  async getScore(resumeId: string): Promise<any> {
    return apiClient.get(`/api/scoring/${resumeId}`)
  },
}
