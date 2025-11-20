/**
 * PDF Export Service
 * Handles PDF generation and download via backend LaTeX compiler
 */

import { getAuthToken } from './auth.service';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export interface Template {
  name: string;
  description: string;
  preview?: string;
}

export interface ExportRequest {
  template: 'modern' | 'classic' | 'minimalist';
  save_to_storage?: boolean;
}

export interface ExportResponse {
  success: boolean;
  storage_url?: string;
  signed_url?: string;
  message: string;
}

/**
 * Get list of available LaTeX templates
 */
export async function getTemplates(): Promise<Template[]> {
  try {
    const token = await getAuthToken();
    const response = await fetch(`${API_BASE_URL}/api/resumes/templates`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch templates');
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching templates:', error);
    throw error;
  }
}

/**
 * Export resume as PDF
 */
export async function exportResumePDF(
  resumeId: string,
  request: ExportRequest
): Promise<ExportResponse> {
  try {
    const token = await getAuthToken();
    const response = await fetch(
      `${API_BASE_URL}/api/resumes/${resumeId}/export`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'PDF export failed');
    }

    return await response.json();
  } catch (error) {
    console.error('Error exporting PDF:', error);
    throw error;
  }
}

/**
 * Download PDF directly (streaming)
 */
export async function downloadResumePDF(
  resumeId: string,
  template: 'modern' | 'classic' | 'minimalist',
  filename?: string
): Promise<void> {
  try {
    const token = await getAuthToken();
    const response = await fetch(
      `${API_BASE_URL}/api/resumes/${resumeId}/export/download?template=${template}`,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error('Failed to download PDF');
    }

    // Get filename from Content-Disposition header or use default
    const contentDisposition = response.headers.get('Content-Disposition');
    const defaultFilename = filename || `resume_${template}.pdf`;
    const extractedFilename = contentDisposition
      ? contentDisposition.split('filename=')[1]?.replace(/"/g, '')
      : defaultFilename;

    // Download file
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = extractedFilename;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  } catch (error) {
    console.error('Error downloading PDF:', error);
    throw error;
  }
}

/**
 * Export and download in one step (with storage save)
 */
export async function exportAndDownloadPDF(
  resumeId: string,
  template: 'modern' | 'classic' | 'minimalist'
): Promise<ExportResponse> {
  try {
    // Export with storage save
    const result = await exportResumePDF(resumeId, {
      template,
      save_to_storage: true,
    });

    // Download using signed URL
    if (result.signed_url) {
      const a = document.createElement('a');
      a.href = result.signed_url;
      a.download = `resume_${template}.pdf`;
      a.target = '_blank';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }

    return result;
  } catch (error) {
    console.error('Error in export and download:', error);
    throw error;
  }
}
