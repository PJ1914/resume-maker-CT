/**
 * Template Renderer Component
 * Renders resume using PDF preview for all LaTeX templates (resume_1 through resume_7)
 */

import React, { useState, useEffect } from 'react';
import { ResumeDetail } from '@/services/resume.service';
import { getAuthToken } from '@/services/auth.service';

interface TemplateRendererProps {
  resume: ResumeDetail;
}

export const TemplateRenderer: React.FC<TemplateRendererProps> = React.memo(({ resume }) => {
  const template = resume.template || 'resume_1'
  const [pdfUrl, setPdfUrl] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  
  useEffect(() => {
    const fetchPreview = async () => {
      try {
        const token = await getAuthToken()
        if (!token) {
          throw new Error('No auth token available')
        }
        
        const response = await fetch(
          `${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/api/resumes/${resume.resume_id}/preview/${template}`,
          {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          }
        )
        
        if (!response.ok) {
          throw new Error(`Preview failed: ${response.statusText}`)
        }
        
        const blob = await response.blob()
        const url = URL.createObjectURL(blob)
        setPdfUrl(url)
      } catch (error) {
        console.error('Failed to load preview:', error)
      } finally {
        setLoading(false)
      }
    }
    
    fetchPreview()
    
    return () => {
      if (pdfUrl) {
        URL.revokeObjectURL(pdfUrl)
      }
    }
  }, [resume.resume_id, template])
  
  if (loading) {
    return (
      <div className="w-full bg-secondary-100 dark:bg-secondary-800 rounded-lg overflow-hidden flex items-center justify-center" style={{ height: '800px' }}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-2 border-primary-900 dark:border-primary-500 border-t-transparent mx-auto mb-3"></div>
          <p className="text-secondary-600 dark:text-secondary-400">Loading preview...</p>
        </div>
      </div>
    )
  }
  
  if (!pdfUrl) {
    return (
      <div className="w-full bg-secondary-100 dark:bg-secondary-800 rounded-lg overflow-hidden flex items-center justify-center" style={{ height: '800px' }}>
        <p className="text-secondary-600 dark:text-secondary-400">Failed to load preview</p>
      </div>
    )
  }
  
  // All templates now use PDF preview
  return (
    <div className="w-full bg-secondary-100 dark:bg-secondary-800 rounded-lg overflow-hidden" style={{ height: '800px' }}>
      <iframe
        src={`${pdfUrl}#view=FitH&toolbar=0&navpanes=0`}
        className="w-full h-full"
        title={`Resume Preview - ${template}`}
        style={{ border: 'none' }}
      />
    </div>
  );
}, (prevProps, nextProps) => {
  // Only re-render if resume_id or template changed
  return prevProps.resume.resume_id === nextProps.resume.resume_id && 
         prevProps.resume.template === nextProps.resume.template;
});
