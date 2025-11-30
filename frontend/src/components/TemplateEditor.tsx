import React, { useState, useEffect } from 'react';
import { Save, X, Eye, Code } from 'lucide-react';
import toast from 'react-hot-toast';

interface Template {
  id: string;
  name: string;
  type: 'html' | 'latex';
  content: string;
  description?: string;
  createdAt?: string;
}

interface TemplateEditorProps {
  template: Template;
  isOpen?: boolean;
  onClose?: () => void;
  onSave?: (template: Template & { isCustom?: boolean }) => void | Promise<void>;
}

export const TemplateEditor: React.FC<TemplateEditorProps> = ({
  template: initialTemplate,
  isOpen = true,
  onClose,
  onSave,
}) => {
  const [template, setTemplate] = useState<Template>(initialTemplate);
  const [isPreview, setIsPreview] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setTemplate(initialTemplate);
  }, [initialTemplate]);

  const handleContentChange = (content: string) => {
    setTemplate({ ...template, content });
  };

  const handleNameChange = (name: string) => {
    setTemplate({ ...template, name });
  };

  const handleDescriptionChange = (description: string) => {
    setTemplate({ ...template, description });
  };

  const handleSave = async () => {
    if (!template.name.trim()) {
      toast.error('Please enter a template name');
      return;
    }

    if (!template.content.trim()) {
      toast.error('Template content cannot be empty');
      return;
    }

    setIsSaving(true);
    try {
      console.log('Saving template:', template.name);
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 500));
      onSave?.(template);
      toast.success('Template saved successfully!');
    } catch (error: any) {
      console.error('Save error:', error);
      const errorMessage = error.response?.data?.detail || error.message || 'Failed to save template';
      toast.error(errorMessage);
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex-1">
            <input
              type="text"
              value={template.name}
              onChange={(e) => handleNameChange(e.target.value)}
              className="text-2xl font-bold text-secondary-700 bg-transparent border-none outline-none p-0 w-full"
              placeholder="Template name"
            />
            <input
              type="text"
              value={template.description || ''}
              onChange={(e) => handleDescriptionChange(e.target.value)}
              className="text-sm text-secondary-700 bg-transparent border-none outline-none p-0 w-full mt-1"
              placeholder="Add a description (optional)"
            />
          </div>
          <button
            onClick={onClose}
            className="text-secondary-700 hover:text-secondary-700 ml-4"
          >
            <X size={24} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 px-6 pt-4 border-b bg-secondary-300">
          <button
            onClick={() => setIsPreview(false)}
            className={`flex items-center gap-2 px-4 py-2 font-medium transition-colors ${
              !isPreview
                ? 'text-secondary-600 border-b-2 border-secondary-300'
                : 'text-secondary-700 hover:text-secondary-700'
            }`}
          >
            <Code size={18} />
            Edit
          </button>
          <button
            onClick={() => setIsPreview(true)}
            className={`flex items-center gap-2 px-4 py-2 font-medium transition-colors ${
              isPreview
                ? 'text-secondary-600 border-b-2 border-secondary-300'
                : 'text-secondary-700 hover:text-secondary-700'
            }`}
          >
            <Eye size={18} />
            Preview
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden flex">
          {!isPreview ? (
            <textarea
              value={template.content}
              onChange={(e) => handleContentChange(e.target.value)}
              className="w-full p-6 font-mono text-sm resize-none outline-none border-none"
              placeholder="Paste your template code here..."
              spellCheck="false"
            />
          ) : (
            <div className="w-full p-6 overflow-auto bg-secondary-300">
              <div className="bg-white rounded-lg p-6 border">
                {template.type === 'html' ? (
                  <iframe
                    srcDoc={template.content}
                    className="w-full border-0 rounded"
                    style={{ minHeight: '600px' }}
                  />
                ) : (
                  <div className="text-secondary-700 text-sm whitespace-pre-wrap font-mono">
                    <p className="text-secondary-700 mb-4">
                      LaTeX preview not available in browser. Template content:
                    </p>
                    <code>{template.content}</code>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex gap-3 justify-end p-6 border-t bg-secondary-300">
          <button
            onClick={onClose}
            className="px-6 py-2 text-secondary-700 bg-white border border-gray-300 rounded-lg hover:bg-secondary-300 transition-colors font-medium"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="px-6 py-2 bg-secondary-500 text-white rounded-lg hover:bg-secondary-500 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <Save size={18} />
            {isSaving ? 'Saving...' : 'Save Template'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default TemplateEditor;
