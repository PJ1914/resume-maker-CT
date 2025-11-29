import { useState } from 'react'
import { X, ChevronLeft, ChevronRight, ZoomIn, ZoomOut } from 'lucide-react'

interface PDFViewerProps {
  pdfUrl: string
  fileName?: string
  onClose?: () => void
}

export default function PDFViewer({ pdfUrl, fileName = 'Document', onClose }: PDFViewerProps) {
  const [scale, setScale] = useState(100)

  const handleZoomIn = () => setScale(prev => Math.min(prev + 10, 200))
  const handleZoomOut = () => setScale(prev => Math.max(prev - 10, 50))

  return (
    <div className="w-full h-full flex flex-col bg-secondary-900">
      {/* Toolbar */}
      <div className="bg-secondary-800 border-b border-secondary-700 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h3 className="text-white font-medium text-sm">{fileName}</h3>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={handleZoomOut}
            title="Zoom Out"
            className="p-2 hover:bg-secondary-700 rounded transition-colors text-white"
          >
            <ZoomOut className="h-4 w-4" />
          </button>
          
          <span className="text-white text-xs w-12 text-center">{scale}%</span>
          
          <button
            onClick={handleZoomIn}
            title="Zoom In"
            className="p-2 hover:bg-secondary-700 rounded transition-colors text-white"
          >
            <ZoomIn className="h-4 w-4" />
          </button>

          <div className="w-px h-6 bg-secondary-700 mx-2"></div>

          <button
            onClick={() => window.open(pdfUrl, '_blank')}
            title="Open in New Tab"
            className="p-2 hover:bg-secondary-700 rounded transition-colors text-white text-xs font-medium"
          >
            Open Full Screen
          </button>

          {onClose && (
            <button
              onClick={onClose}
              title="Close"
              className="p-2 hover:bg-secondary-700 rounded transition-colors text-white ml-2"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {/* PDF Container */}
      <div className="flex-1 overflow-auto bg-secondary-950">
        <div className="flex justify-center p-4">
          <iframe
            src={`${pdfUrl}#toolbar=0`}
            style={{
              width: `${scale}%`,
              height: 'auto',
              minHeight: '100%',
              border: 'none',
            }}
            title={fileName}
            className="bg-white shadow-lg"
          />
        </div>
      </div>
    </div>
  )
}
