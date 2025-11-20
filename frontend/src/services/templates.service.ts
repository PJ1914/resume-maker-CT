import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const apiClient = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
apiClient.interceptors.request.use(async (config) => {
  try {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  } catch (error) {
    console.error('Error getting auth token:', error);
  }
  return config;
});

export interface Template {
  id: string;
  name: string;
  type: 'html' | 'latex';
  description: string;
  content: string;
  created_at: string;
  updated_at: string;
}

export const templateService = {
  // Create a new template
  async createTemplate(data: {
    name: string;
    type: 'html' | 'latex';
    content: string;
    description?: string;
    template_id?: string;  // Optional custom ID for default templates
  }): Promise<Template> {
    try {
      console.log('Creating template:', data.name);
      const response = await apiClient.post('/templates', data);
      console.log('Template created successfully:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('Create template error:', error.response?.data || error.message);
      throw error;
    }
  },

  // Get all templates for current user
  async listTemplates(): Promise<Template[]> {
    try {
      console.log('Fetching all templates');
      const response = await apiClient.get('/templates');
      console.log('Templates fetched:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('List templates error:', error.response?.data || error.message);
      throw error;
    }
  },

  // Get a specific template
  async getTemplate(templateId: string): Promise<Template> {
    try {
      console.log('Getting template:', templateId);
      const response = await apiClient.get(`/templates/${templateId}`);
      console.log('Template retrieved:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('Get template error:', error.response?.data || error.message);
      throw error;
    }
  },

  // Update a template
  async updateTemplate(
    templateId: string,
    data: {
      name: string;
      content: string;
      description?: string;
    }
  ): Promise<Template> {
    try {
      console.log('Updating template:', templateId);
      const response = await apiClient.put(`/templates/${templateId}`, data);
      console.log('Template updated successfully:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('Update template error:', error.response?.data || error.message);
      throw error;
    }
  },

  // Delete a template
  async deleteTemplate(templateId: string): Promise<{ status: string; message: string }> {
    try {
      console.log('Deleting template:', templateId);
      const response = await apiClient.delete(`/templates/${templateId}`);
      console.log('Template deleted successfully:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('Delete template error:', error.response?.data || error.message);
      throw error;
    }
  },

  // Upload a template file
  async uploadTemplate(file: File): Promise<Template> {
    try {
      console.log('Uploading template file:', file.name);
      const formData = new FormData();
      formData.append('file', file);

      const uploadClient = axios.create({
        baseURL: `${API_BASE_URL}/api`,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      uploadClient.interceptors.request.use(async (config) => {
        try {
          const token = localStorage.getItem('authToken');
          if (token) {
            config.headers.Authorization = `Bearer ${token}`;
          }
        } catch (error) {
          console.error('Error getting auth token:', error);
        }
        return config;
      });

      const response = await uploadClient.post('/templates/upload', formData);
      console.log('Template uploaded successfully:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('Upload template error:', error.response?.data || error.message);
      throw error;
    }
  },
};

export default templateService;
