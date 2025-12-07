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

    getUsers: async () => {
        const token = localStorage.getItem('authToken')
        const response = await axios.get(`${API_URL}/api/admin/users`, {
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
