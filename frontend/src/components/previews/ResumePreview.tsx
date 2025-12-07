import React, { useState } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import { API_URL } from '@/config/firebase';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

// Set worker source
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

interface ResumePreviewProps {
    templateId: string;
    width?: number;
}

export const ResumePreview: React.FC<ResumePreviewProps> = ({ templateId, width = 300 }) => {
    const [loading, setLoading] = useState(true);

    const onDocumentLoadSuccess = () => {
        setLoading(false);
    };

    return (
        <div className="w-full h-full overflow-hidden relative bg-gray-50 flex items-center justify-center group-hover:shadow-lg transition-shadow">
            <div className="absolute inset-0 flex items-center justify-center">
                {loading && (
                    <div className="space-y-2 w-16">
                      <div className="h-3 bg-gray-200 rounded-full animate-pulse"></div>
                      <div className="h-3 bg-gray-200 rounded-full animate-pulse" style={{animationDelay: '0.1s'}}></div>
                      <div className="h-3 bg-gray-200 rounded-full animate-pulse" style={{animationDelay: '0.2s'}}></div>
                    </div>
                )}
            </div>

            {/* 
        We render the PDF page. 
        We use a fixed width that is large enough for quality, 
        and let CSS scaling handle the responsive fit if needed, 
        or just rely on the container overflow.
        Since these are previews, we want to show the whole page scaled down.
      */}
            <div className="w-full h-full flex items-start justify-center overflow-hidden">
                <Document
                    file={`${API_URL}/api/resumes/template-preview/${templateId}`}
                    onLoadSuccess={onDocumentLoadSuccess}
                    loading={null}
                    error={
                        <div className="text-red-500 text-xs text-center p-4">
                            Preview unavailable
                        </div>
                    }
                >
                    <Page
                        pageNumber={1}
                        width={width}
                        renderTextLayer={false}
                        renderAnnotationLayer={false}
                        className="shadow-sm origin-top"
                    />
                </Document>
            </div>

            {/* Overlay for hover effect */}
            <div className="absolute inset-0 bg-transparent group-hover:bg-black/5 transition-colors pointer-events-none"></div>
        </div>
    );
};
