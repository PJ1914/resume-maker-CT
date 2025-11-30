import React, { useState, useRef } from 'react';
import { Upload, X, Check, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

interface TemplateFile {
  id: string;
  file: File;
  name: string;
  type: 'html' | 'latex' | 'unknown';
  preview?: string;
}

interface TemplateUploadProps {
  onTemplatesUploaded?: (templates: TemplateFile[]) => void;
  isOpen?: boolean;
  onClose?: () => void;
}

export const TemplateUpload: React.FC<TemplateUploadProps> = ({
  onTemplatesUploaded,
  isOpen = true,
  onClose,
}) => {
  const [templates, setTemplates] = useState<TemplateFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const getTemplateType = (filename: string): 'html' | 'latex' | 'unknown' => {
    const ext = filename.split('.').pop()?.toLowerCase();
    if (ext === 'html' || ext === 'htm') return 'html';
    if (ext === 'tex' || ext === 'latex') return 'latex';
    return 'unknown';
  };

  const handleFiles = (files: FileList) => {
    const newTemplates: TemplateFile[] = [];

    Array.from(files).forEach((file) => {
      const type = getTemplateType(file.name);

      if (type === 'unknown') {
        toast.error(`${file.name}: Only HTML and LaTeX files are supported`);
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        toast.error(`${file.name}: File size exceeds 5MB limit`);
        return;
      }

      newTemplates.push({
        id: Math.random().toString(36).substring(2, 11),
        file,
        name: file.name,
        type,
      });
    });

    if (newTemplates.length > 0) {
      setTemplates([...templates, ...newTemplates]);
      toast.success(`${newTemplates.length} template(s) added`);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (e.dataTransfer.files) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleFiles(e.target.files);
    }
  };

  const removeTemplate = (id: string) => {
    setTemplates(templates.filter((t) => t.id !== id));
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleSubmit = () => {
    if (templates.length === 0) {
      toast.error('Please add at least one template');
      return;
    }

    onTemplatesUploaded?.(templates);
    toast.success(`${templates.length} template(s) uploaded successfully!`);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 flex items-center justify-between p-6 border-b">
          <div>
            <h2 className="text-2xl font-bold text-secondary-700">Upload Custom Templates</h2>
            <p className="text-secondary-700 text-sm mt-1">
              Upload HTML or LaTeX templates to customize your resume
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-secondary-700 hover:text-secondary-700"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Drag and Drop Area */}
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-lg p-12 text-center cursor-pointer transition-colors ${
              isDragging
                ? 'border-secondary-300 bg-secondary-500'
                : 'border-gray-300 bg-secondary-300 hover:bg-secondary-300'
            }`}
          >
            <Upload
              size={48}
              className={`mx-auto mb-4 ${
                isDragging ? 'text-secondary-600' : 'text-secondary-700'
              }`}
            />
            <h3 className="text-lg font-semibold text-secondary-700 mb-2">
              Drag and drop your templates
            </h3>
            <p className="text-secondary-700 mb-4">
              or click to browse files (.html, .tex, .latex)
            </p>
            <button
              onClick={handleUploadClick}
              className="inline-block px-6 py-2 bg-secondary-500 text-white rounded-lg hover:bg-secondary-500 transition-colors"
            >
              Browse Files
            </button>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept=".html,.htm,.tex,.latex"
              onChange={handleInputChange}
              className="hidden"
            />
          </div>

          {/* File List */}
          {templates.length > 0 && (
            <div className="mt-6">
              <h3 className="text-lg font-semibold text-secondary-700 mb-3">
                Selected Templates ({templates.length})
              </h3>
              <div className="space-y-2">
                {templates.map((template) => (
                  <div
                    key={template.id}
                    className="flex items-center justify-between p-4 bg-secondary-300 rounded-lg border border-gray-200"
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className="flex-shrink-0">
                        <div className="w-10 h-10 bg-secondary-500 rounded-lg flex items-center justify-center">
                          <span className="text-xs font-semibold text-secondary-600 uppercase">
                            {template.type === 'html' ? 'HTML' : 'TEX'}
                          </span>
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-secondary-700 truncate">
                          {template.name}
                        </p>
                        <p className="text-xs text-secondary-700">
                          {(template.file.size / 1024).toFixed(2)} KB
                        </p>
                      </div>
                      <Check size={20} className="text-success-600 flex-shrink-0" />
                    </div>
                    <button
                      onClick={() => removeTemplate(template.id)}
                      className="ml-4 p-2 text-secondary-700 hover:text-danger-600 hover:bg-danger-100 rounded-lg transition-colors"
                    >
                      <X size={18} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Info Box */}
          <div className="mt-6 p-4 bg-secondary-500 border border-secondary-300 rounded-lg flex gap-3">
            <AlertCircle size={20} className="text-secondary-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-secondary-600">
              <p className="font-semibold mb-1">Supported formats:</p>
              <ul className="list-disc list-inside space-y-0.5 text-xs">
                <li>HTML templates (.html, .htm)</li>
                <li>LaTeX templates (.tex, .latex)</li>
                <li>Maximum file size: 5MB per template</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 flex gap-3 justify-end p-6 border-t bg-secondary-300">
          <button
            onClick={onClose}
            className="px-6 py-2 text-secondary-700 bg-white border border-gray-300 rounded-lg hover:bg-secondary-300 transition-colors font-medium"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={templates.length === 0}
            className="px-6 py-2 bg-secondary-500 text-white rounded-lg hover:bg-secondary-500 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Upload {templates.length > 0 && `(${templates.length})`}
          </button>
        </div>
      </div>
    </div>
  );
};

export default TemplateUpload;
