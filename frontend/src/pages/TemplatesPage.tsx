import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Upload, FileText, MoreVertical } from 'lucide-react';
import toast from 'react-hot-toast';
import TemplateUpload from '../components/TemplateUpload';
import TemplateEditor from '../components/TemplateEditor';
import templateService, { Template as TemplateType } from '../services/templates.service';

interface Template extends TemplateType {
  isCustom?: boolean;
}

const defaultTemplates: Template[] = [
  {
    id: 'modern',
    name: 'Modern Professional',
    type: 'latex',
    description: 'Clean and contemporary design with bold section headers',
    content: '',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    isCustom: false,
  },
  {
    id: 'classic',
    name: 'Classic Traditional',
    type: 'latex',
    description: 'Timeless format preferred by traditional industries',
    content: '',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    isCustom: false,
  },
  {
    id: 'minimalist',
    name: 'Minimalist Clean',
    type: 'latex',
    description: 'Simple and elegant with focus on content',
    content: '',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    isCustom: false,
  },
];

interface TemplateFile {
  id: string;
  file: File;
  name: string;
  type: 'html' | 'latex' | 'unknown';
  preview?: string;
}

export const TemplatesPage: React.FC = () => {
  const [templates, setTemplates] = useState<Template[]>(defaultTemplates);
  const [showUpload, setShowUpload] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<Template | null>(null);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  useEffect(() => {
    loadCustomTemplates();
  }, []);

  const loadCustomTemplates = async () => {
    try {
      console.log('Loading custom templates');
      const customTemplates = await templateService.listTemplates();
      console.log('Custom templates loaded:', customTemplates);
      setTemplates([
        ...defaultTemplates,
        ...customTemplates.map((t) => ({ ...t, isCustom: true })),
      ]);
    } catch (error: any) {
      console.error('Failed to load templates:', error);
      toast.error('Failed to load templates');
      // If API fails, just show default templates
    }
  };

  const handleTemplatesUploaded = async (uploadedFiles: TemplateFile[]) => {
    const newTemplates: Template[] = [];
    let uploadedCount = 0;

    for (const file of uploadedFiles) {
      try {
        console.log('Uploading file:', file.name);
        const uploadedTemplate = await templateService.uploadTemplate(file.file);
        console.log('File uploaded successfully:', uploadedTemplate);
        newTemplates.push({ ...uploadedTemplate, isCustom: true });
        uploadedCount++;
      } catch (error: any) {
        const errorMessage = error.response?.data?.detail || error.message || `Failed to upload ${file.name}`;
        toast.error(errorMessage);
        console.error('Upload error:', error);
      }
    }

    if (uploadedCount > 0) {
      setTemplates([...templates, ...newTemplates]);
      setShowUpload(false);
      toast.success(`${uploadedCount} template(s) uploaded successfully!`);
    }
  };

  const handleSaveTemplate = async (updatedTemplate: Template) => {
    try {
      console.log('Saving template:', updatedTemplate.name);
      
      // Check if this is a default template being edited for the first time
      const isDefaultTemplate = !updatedTemplate.isCustom;
      
      let savedTemplate;
      if (isDefaultTemplate) {
        // Create the template in the database with the same ID as default
        console.log('Creating default template as custom:', updatedTemplate.id);
        savedTemplate = await templateService.createTemplate({
          name: updatedTemplate.name,
          type: updatedTemplate.type,
          content: updatedTemplate.content,
          description: updatedTemplate.description || '',
          template_id: updatedTemplate.id,  // Pass the default template ID
        });
      } else {
        // Update existing custom template
        savedTemplate = await templateService.updateTemplate(updatedTemplate.id, {
          name: updatedTemplate.name,
          content: updatedTemplate.content,
          description: updatedTemplate.description || '',
        });
      }

      console.log('Template saved successfully:', savedTemplate);
      setTemplates(
        templates.map((t) => (t.id === updatedTemplate.id ? { ...savedTemplate, isCustom: true } : t))
      );
      setEditingTemplate(null);
      toast.success('Template saved successfully!');
    } catch (error: any) {
      const errorMessage = error.response?.data?.detail || error.message || 'Failed to save template';
      toast.error(errorMessage);
      console.error('Save error:', error);
    }
  };

  const handleDeleteTemplate = async (id: string) => {
    const template = templates.find((t) => t.id === id);
    if (template?.isCustom === false) {
      toast.error('Cannot delete default templates');
      return;
    }

    if (confirm('Are you sure you want to delete this template?')) {
      try {
        await templateService.deleteTemplate(id);
        setTemplates(templates.filter((t) => t.id !== id));
        setOpenMenuId(null);
        toast.success('Template deleted successfully');
      } catch (error) {
        toast.error('Failed to delete template');
        console.error('Delete error:', error);
      }
    }
  };

  const customTemplates = templates.filter((t) => t.isCustom);
  const defaultTemplatesList = templates.filter((t) => !t.isCustom);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Resume Templates</h1>
              <p className="text-gray-600 mt-2">
                Manage your resume templates and create custom designs
              </p>
            </div>
            <button
              onClick={() => setShowUpload(true)}
              className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-lg hover:shadow-xl"
            >
              <Upload size={20} />
              Upload Template
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Default Templates */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Default Templates</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {defaultTemplatesList.map((template) => (
              <div
                key={template.id}
                className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow overflow-hidden border border-gray-200"
              >
                {/* Template Card */}
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-600 rounded-lg flex items-center justify-center">
                      <FileText size={24} className="text-white" />
                    </div>
                    <span className="px-3 py-1 bg-blue-100 text-blue-700 text-xs font-semibold rounded-full">
                      {template.type.toUpperCase()}
                    </span>
                  </div>

                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {template.name}
                  </h3>
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                    {template.description}
                  </p>

                  <button
                    onClick={() => setEditingTemplate(template)}
                    className="w-full px-4 py-2 bg-gray-100 text-gray-900 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                  >
                    View Template
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Custom Templates */}
        {customTemplates.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Your Custom Templates</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {customTemplates.map((template) => (
                <div
                  key={template.id}
                  className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow overflow-hidden border border-gray-200 relative group"
                >
                  {/* Template Card */}
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-purple-600 rounded-lg flex items-center justify-center">
                        <FileText size={24} className="text-white" />
                      </div>
                      <div className="relative">
                        <button
                          onClick={() =>
                            setOpenMenuId(openMenuId === template.id ? null : template.id)
                          }
                          className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                          <MoreVertical size={18} />
                        </button>

                        {/* Dropdown Menu */}
                        {openMenuId === template.id && (
                          <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-10">
                            <button
                              onClick={() => {
                                setEditingTemplate(template);
                                setOpenMenuId(null);
                              }}
                              className="w-full flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-50 border-b transition-colors"
                            >
                              <Edit2 size={16} />
                              Edit Template
                            </button>
                            <button
                              onClick={() => {
                                handleDeleteTemplate(template.id);
                              }}
                              className="w-full flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 transition-colors"
                            >
                              <Trash2 size={16} />
                              Delete
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {template.name}
                    </h3>
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                      {template.description}
                    </p>

                    <div className="flex gap-2">
                      <button
                        onClick={() => setEditingTemplate(template)}
                        className="flex-1 px-4 py-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors font-medium text-sm"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteTemplate(template.id)}
                        className="flex-1 px-4 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors font-medium text-sm"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {customTemplates.length === 0 && (
          <div className="text-center py-12">
            <FileText size={48} className="mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No custom templates yet</h3>
            <p className="text-gray-600 mb-6">
              Upload your own templates to customize your resumes
            </p>
            <button
              onClick={() => setShowUpload(true)}
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              <Plus size={20} />
              Upload First Template
            </button>
          </div>
        )}
      </div>

      {/* Modals */}
      <TemplateUpload
        isOpen={showUpload}
        onClose={() => setShowUpload(false)}
        onTemplatesUploaded={handleTemplatesUploaded}
      />

      {editingTemplate && (
        <TemplateEditor
          isOpen={!!editingTemplate}
          onClose={() => setEditingTemplate(null)}
          template={editingTemplate}
          onSave={(template) => handleSaveTemplate(template as Template)}
        />
      )}
    </div>
  );
};

export default TemplatesPage;
