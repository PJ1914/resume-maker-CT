 import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

export interface DashboardStats {
    total_users: number
    active_users_today: number
    credits_purchased_today: number
    total_credits_used: number
    resumes_created: number
    ats_checks_today: number
    ai_actions_today: number
    templates_purchased: number
    portfolios_deployed: number
}

export interface AnalyticsData {
    user_growth: Array<{ date: string; count: number }>
    revenue_trend: Array<{ date: string; amount: number; credits: number; count: number }>
    credit_usage: Array<{ feature: string; count: number; credits: number }>
    top_templates: Array<{ template: string; count: number }>
    user_activity: {
        hourly: Array<{ hour: number; count: number }>
    }
    platform_stats: {
        resumes: number
        portfolios: number
        interviews: number
        total: number
    }
}

export const adminService = {
    getStats: async (): Promise<DashboardStats> => {
        const token = localStorage.getItem('authToken')
        const response = await axios.get(`${API_URL}/api/admin/stats`, {
            headers: { Authorization: `Bearer ${token}` }
        })
        return response.data
    },

    getLogs: async () => {
        const token = localStorage.getItem('authToken')
        const response = await axios.get(`${API_URL}/api/admin/logs`, {
            headers: { Authorization: `Bearer ${token}` }
        })
        return response.data
    },

    getAnalytics: async (days: number = 30): Promise<AnalyticsData> => {
        const token = localStorage.getItem('authToken')
        const response = await axios.get(`${API_URL}/api/admin/analytics`, {
            params: { days },
            headers: { Authorization: `Bearer ${token}` }
        })
        return response.data
    },

    getUsers: async (page: number = 1, limit: number = 50) => {
        const token = localStorage.getItem('authToken')
        const response = await axios.get(`${API_URL}/api/admin/users?page=${page}&limit=${limit}`, {
            headers: { Authorization: `Bearer ${token}` }
        })
        return response.data
    },

    getUserDetails: async (uid: string) => {
        const token = localStorage.getItem('authToken')
        const response = await axios.get(`${API_URL}/api/admin/users/${uid}`, {
            headers: { Authorization: `Bearer ${token}` }
        })
        return response.data
    },

    banUser: async (uid: string) => {
        const token = localStorage.getItem('authToken')
        const response = await axios.post(`${API_URL}/api/admin/users/${uid}/ban`, {}, {
            headers: { Authorization: `Bearer ${token}` }
        })
        return response.data
    },

    unbanUser: async (uid: string) => {
        const token = localStorage.getItem('authToken')
        const response = await axios.post(`${API_URL}/api/admin/users/${uid}/unban`, {}, {
            headers: { Authorization: `Bearer ${token}` }
        })
        return response.data
    },

    getResumes: async () => {
        const token = localStorage.getItem('authToken')
        const response = await axios.get(`${API_URL}/api/admin/resumes`, {
            headers: { Authorization: `Bearer ${token}` }
        })
        return response.data
    },

    getResumeDetails: async (id: string) => {
        const token = localStorage.getItem('authToken')
        const response = await axios.get(`${API_URL}/api/admin/resumes/${id}`, {
            headers: { Authorization: `Bearer ${token}` }
        })
        return response.data
    },

    deleteResume: async (id: string) => {
        const token = localStorage.getItem('authToken')
        const response = await axios.delete(`${API_URL}/api/admin/resumes/${id}`, {
            headers: { Authorization: `Bearer ${token}` }
        })
        return response.data
    },

    getTemplates: async (type?: string) => {
        const token = localStorage.getItem('authToken')
        const response = await axios.get(`${API_URL}/api/admin/templates`, {
            params: { type },
            headers: { Authorization: `Bearer ${token}` }
        })
        return response.data
    },

    createTemplate: async (data: any) => {
        const token = localStorage.getItem('authToken')
        const response = await axios.post(`${API_URL}/api/admin/templates`, data, {
            headers: { Authorization: `Bearer ${token}` }
        })
        return response.data
    },

    updateTemplate: async (id: string, data: any) => {
        const token = localStorage.getItem('authToken')
        const response = await axios.put(`${API_URL}/api/admin/templates/${id}`, data, {
            headers: { Authorization: `Bearer ${token}` }
        })
        return response.data
    },

    deleteTemplate: async (id: string) => {
        const token = localStorage.getItem('authToken')
        const response = await axios.delete(`${API_URL}/api/admin/templates/${id}`, {
            headers: { Authorization: `Bearer ${token}` }
        })
        return response.data
    },

    uploadTemplateFiles: async (templateId: string, files: {
        indexHtml?: File
        stylesCss?: File
        scriptJs?: File
        metadataJson?: File
        previewHtml?: File
        readmeMd?: File
    }) => {
        const token = localStorage.getItem('authToken')
        const formData = new FormData()
        
        if (files.indexHtml) formData.append('index_html', files.indexHtml)
        if (files.stylesCss) formData.append('styles_css', files.stylesCss)
        if (files.scriptJs) formData.append('script_js', files.scriptJs)
        if (files.metadataJson) formData.append('metadata_json', files.metadataJson)
        if (files.previewHtml) formData.append('preview_html', files.previewHtml)
        if (files.readmeMd) formData.append('readme_md', files.readmeMd)
        
        const response = await axios.post(`${API_URL}/api/admin/templates/${templateId}/upload`, formData, {
            headers: { 
                Authorization: `Bearer ${token}`,
                'Content-Type': 'multipart/form-data'
            }
        })
        return response.data
    },

    getPortfolios: async () => {
        const token = localStorage.getItem('authToken')
        const response = await axios.get(`${API_URL}/api/admin/portfolios`, {
            headers: { Authorization: `Bearer ${token}` }
        })
        return response.data
    },

    updatePortfolioStatus: async (id: string, status: string) => {
        const token = localStorage.getItem('authToken')
        const response = await axios.post(`${API_URL}/api/admin/portfolios/${id}/status`, null, {
            params: { status },
            headers: { Authorization: `Bearer ${token}` }
        })
        return response.data
    },

    deletePortfolio: async (id: string) => {
        const token = localStorage.getItem('authToken')
        const response = await axios.delete(`${API_URL}/api/admin/portfolios/${id}`, {
            headers: { Authorization: `Bearer ${token}` }
        })
        return response.data
    },

    getTransactions: async () => {
        const token = localStorage.getItem('authToken')
        const response = await axios.get(`${API_URL}/api/admin/transactions`, {
            headers: { Authorization: `Bearer ${token}` }
        })
        return response.data
    },

    adjustCredits: async (userId: string, amount: number, reason: string) => {
        const token = localStorage.getItem('authToken')
        const response = await axios.post(`${API_URL}/api/admin/credits/adjust`, null, {
            params: { user_id: userId, amount, reason },
            headers: { Authorization: `Bearer ${token}` }
        })
        return response.data
    },

    getAILogs: async () => {
        const token = localStorage.getItem('authToken')
        const response = await axios.get(`${API_URL}/api/admin/ai-logs`, {
            headers: { Authorization: `Bearer ${token}` }
        })
        return response.data
    },

    getAnnouncements: async () => {
        const token = localStorage.getItem('authToken')
        const response = await axios.get(`${API_URL}/api/admin/announcements`, {
            headers: { Authorization: `Bearer ${token}` }
        })
        return response.data
    },

    createAnnouncement: async (data: any) => {
        const token = localStorage.getItem('authToken')
        const response = await axios.post(`${API_URL}/api/admin/announcements`, data, {
            headers: { Authorization: `Bearer ${token}` }
        })
        return response.data
    },

    deleteAnnouncement: async (id: string) => {
        const token = localStorage.getItem('authToken')
        const response = await axios.delete(`${API_URL}/api/admin/announcements/${id}`, {
            headers: { Authorization: `Bearer ${token}` }
        })
        return response.data
    },

    getSettings: async () => {
        const token = localStorage.getItem('authToken')
        const response = await axios.get(`${API_URL}/api/admin/settings`, {
            headers: { Authorization: `Bearer ${token}` }
        })
        return response.data
    },

    updateSettings: async (data: any) => {
        const token = localStorage.getItem('authToken')
        const response = await axios.put(`${API_URL}/api/admin/settings`, data, {
            headers: { Authorization: `Bearer ${token}` }
        })
        return response.data
    }
}
