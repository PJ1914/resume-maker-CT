import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { adminService } from '@/services/admin.service'
import {
    Settings,
    Save,
    Shield,
    CreditCard,
    Megaphone
} from 'lucide-react'
import toast from 'react-hot-toast'

export default function SettingsPage() {
    const queryClient = useQueryClient()

    const { data: settings, isLoading } = useQuery({
        queryKey: ['admin-settings'],
        queryFn: adminService.getSettings
    })

    const updateMutation = useMutation({
        mutationFn: adminService.updateSettings,
        onSuccess: () => {
            toast.success('System settings updated')
            queryClient.invalidateQueries({ queryKey: ['admin-settings'] })
        }
    })

    const handleSave = (e: React.FormEvent) => {
        e.preventDefault()
        const formData = new FormData(e.target as HTMLFormElement)
        const data: any = Object.fromEntries(formData.entries())

        // Convert checkboxes
        data.maintenance_mode = formData.get('maintenance_mode') === 'on'
        data.allow_signups = formData.get('allow_signups') === 'on'
        data.default_credits = Number(data.default_credits)

        updateMutation.mutate(data)
    }

    if (isLoading) return (
        <div className="p-8 space-y-4">
            <div className="animate-pulse space-y-4">
                <div className="h-8 w-48 bg-gray-300 dark:bg-gray-700 rounded"></div>
                <div className="grid md:grid-cols-2 gap-4">
                    {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="bg-white dark:bg-gray-800 rounded-lg p-6 space-y-3">
                            <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
                            <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded"></div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">System Settings</h1>
                <p className="text-gray-500 dark:text-gray-400">Configure global application settings</p>
            </div>

            <form onSubmit={handleSave} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* General Settings */}
                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 space-y-6">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        <Settings className="h-5 w-5 text-gray-400" /> General Configuration
                    </h3>

                    <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                            <div>
                                <label className="font-medium text-gray-900 dark:text-white block">Maintenance Mode</label>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Disable access for non-admin users</p>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    name="maintenance_mode"
                                    defaultChecked={settings?.maintenance_mode}
                                    className="sr-only peer"
                                />
                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 dark:peer-focus:ring-primary-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary-600"></div>
                            </label>
                        </div>

                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                            <div>
                                <label className="font-medium text-gray-900 dark:text-white block">Allow New Signups</label>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Enable or disable user registration</p>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    name="allow_signups"
                                    defaultChecked={settings?.allow_signups}
                                    className="sr-only peer"
                                />
                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 dark:peer-focus:ring-primary-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary-600"></div>
                            </label>
                        </div>
                    </div>
                </div>

                {/* Onboarding & Credits */}
                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 space-y-6">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        <CreditCard className="h-5 w-5 text-gray-400" /> Onboarding & Credits
                    </h3>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Default Welcome Credits</label>
                        <input
                            type="number"
                            name="default_credits"
                            defaultValue={settings?.default_credits}
                            className="w-full rounded-lg border border-gray-300 dark:border-gray-600 px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none"
                        />
                        <p className="text-xs text-gray-500 mt-1">Credits assigned to new users upon registration</p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Global Announcement Banner</label>
                        <input
                            name="announcement_banner"
                            defaultValue={settings?.announcement_banner}
                            className="w-full rounded-lg border border-gray-300 dark:border-gray-600 px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none"
                            placeholder="Enter text to display at the top of the app..."
                        />
                    </div>
                </div>

                <div className="lg:col-span-2 flex justify-end">
                    <button
                        type="submit"
                        disabled={updateMutation.isPending}
                        className="flex items-center gap-2 px-6 py-3 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-colors font-bold shadow-lg shadow-primary-600/20 disabled:opacity-50"
                    >
                        <Save className="h-5 w-5" />
                        {updateMutation.isPending ? 'Saving...' : 'Save Configuration'}
                    </button>
                </div>
            </form>
        </div>
    )
}
