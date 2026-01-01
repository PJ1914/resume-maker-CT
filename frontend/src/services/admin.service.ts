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
    getStats: async (forceRefresh: boolean = false): Promise<DashboardStats> => {
        const token = localStorage.getItem('authToken')
        const response = await axios.get(`${API_URL}/api/admin/stats`, {
            headers: { Authorization: `Bearer ${token}` },
            params: { force_refresh: forceRefresh }
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

    getLiveUsers: async (minutes: number = 5): Promise<{
        live_users: Array<{
            uid: string
            email: string
            display_name: string | null
            photo_url: string | null
            last_active: string
            minutes_ago: number
            credits_balance: number
            current_page: string | null
            provider: string
        }>
        count: number
        time_window_minutes: number
        checked_at: string
    }> => {
        const token = localStorage.getItem('authToken')
        const response = await axios.get(`${API_URL}/api/admin/live-users`, {
            params: { minutes },
            headers: { Authorization: `Bearer ${token}` }
        })
        return response.data
    },

    getUsers: async (page: number = 1, limit: number = 50, filters?: {
        status?: string
        role?: string
        credits?: string
        joined?: string
        search?: string
    }) => {
        const token = localStorage.getItem('authToken')
        const params = new URLSearchParams({
            page: page.toString(),
            limit: limit.toString()
        })

        if (filters?.status && filters.status !== 'all') params.append('status', filters.status)
        if (filters?.role && filters.role !== 'all') params.append('role', filters.role)
        if (filters?.credits && filters.credits !== 'all') params.append('credits', filters.credits)
        if (filters?.joined && filters.joined !== 'all') params.append('joined', filters.joined)
        if (filters?.search) params.append('search', filters.search)

        const response = await axios.get(`${API_URL}/api/admin/users?${params.toString()}`, {
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

    makeAdmin: async (uid: string) => {
        const token = localStorage.getItem('authToken')
        const response = await axios.post(`${API_URL}/api/admin/users/${uid}/make-admin`, {}, {
            headers: { Authorization: `Bearer ${token}` }
        })
        return response.data
    },

    removeAdmin: async (uid: string) => {
        const token = localStorage.getItem('authToken')
        const response = await axios.post(`${API_URL}/api/admin/users/${uid}/remove-admin`, {}, {
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
    },

    getHelpStructure: async () => {
        const response = await axios.get(`${API_URL}/api/help/structure`)
        return response.data
    },

    getHelpArticle: async (slug: string) => {
        const response = await axios.get(`${API_URL}/api/help/article/${slug}`)
        return response.data
    },

    saveHelpArticle: async (data: any) => {
        const token = localStorage.getItem('authToken')
        const response = await axios.post(`${API_URL}/api/help/article`, data, {
            headers: { Authorization: `Bearer ${token}` }
        })
        return response.data
    },

    deleteHelpArticle: async (slug: string) => {
        const token = localStorage.getItem('authToken')
        const response = await axios.delete(`${API_URL}/api/help/article/${slug}`, {
            headers: { Authorization: `Bearer ${token}` }
        })
        return response.data
    }
}
