import { useState, Fragment } from 'react'
import { motion } from 'framer-motion'
import { Settings, Shield, Bell, Moon, LogOut, Trash2, AlertTriangle } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { useNavigate } from 'react-router-dom'
import { Dialog, Transition } from '@headlessui/react'

export default function SettingsSection() {
    const { signOut, deleteAccount } = useAuth()
    const navigate = useNavigate()
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
    const [isDeleting, setIsDeleting] = useState(false)

    const handleLogout = async () => {
        try {
            await signOut()
            navigate('/login')
        } catch (error) {
            console.error('Logout error:', error)
        }
    }

    const handleDeleteAccount = async () => {
        setIsDeleting(true)
        try {
            await deleteAccount()
            navigate('/login')
        } catch (error) {
            console.error('Delete account error:', error)
            setIsDeleteModalOpen(false)
        } finally {
            setIsDeleting(false)
        }
    }

    const toggleTheme = () => {
        const html = document.documentElement
        if (html.classList.contains('dark')) {
            html.classList.remove('dark')
            localStorage.setItem('theme', 'light')
        } else {
            html.classList.add('dark')
            localStorage.setItem('theme', 'dark')
        }
    }

    return (
        <>
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="bg-white dark:bg-[#111111] rounded-2xl p-6 border border-secondary-200 dark:border-white/10 shadow-sm dark:shadow-none transition-colors"
            >
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-lg sm:text-xl font-bold text-secondary-900 dark:text-white flex items-center gap-2">
                        <Settings className="h-5 w-5 text-secondary-400 dark:text-gray-400" />
                        Settings
                    </h2>
                </div>

                <div className="space-y-1 divide-y divide-secondary-100 dark:divide-white/10">
                    <button className="w-full flex items-center justify-between p-3 hover:bg-secondary-50 dark:hover:bg-white/5 rounded-lg transition-colors group">
                        <div className="flex items-center gap-3">
                            <Shield className="h-5 w-5 text-secondary-400 dark:text-gray-400 group-hover:text-blue-500 dark:group-hover:text-blue-400 transition-colors" />
                            <div className="text-left">
                                <div className="text-sm sm:text-base font-medium text-secondary-900 dark:text-white">Account Security</div>
                                <div className="text-[10px] sm:text-xs text-secondary-500 dark:text-gray-400">Password, 2FA, Connected Accounts</div>
                            </div>
                        </div>
                    </button>

                    <button className="w-full flex items-center justify-between p-3 hover:bg-secondary-50 dark:hover:bg-white/5 rounded-lg transition-colors group">
                        <div className="flex items-center gap-3">
                            <Bell className="h-5 w-5 text-secondary-400 dark:text-gray-400 group-hover:text-yellow-500 dark:group-hover:text-yellow-400 transition-colors" />
                            <div className="text-left">
                                <div className="text-sm sm:text-base font-medium text-secondary-900 dark:text-white">Notifications</div>
                                <div className="text-[10px] sm:text-xs text-secondary-500 dark:text-gray-400">Email alerts, App updates</div>
                            </div>
                        </div>
                    </button>

                    <button
                        onClick={toggleTheme}
                        className="w-full flex items-center justify-between p-3 hover:bg-secondary-50 dark:hover:bg-white/5 rounded-lg transition-colors group"
                    >
                        <div className="flex items-center gap-3">
                            <Moon className="h-5 w-5 text-secondary-400 dark:text-gray-400 group-hover:text-purple-500 dark:group-hover:text-purple-400 transition-colors" />
                            <div className="text-left">
                                <div className="text-sm sm:text-base font-medium text-secondary-900 dark:text-white">App Preferences</div>
                                <div className="text-[10px] sm:text-xs text-secondary-500 dark:text-gray-400">Toggle Dark/Light Mode</div>
                            </div>
                        </div>
                    </button>

                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center justify-between p-3 hover:bg-secondary-50 dark:hover:bg-white/5 rounded-lg transition-colors group"
                    >
                        <div className="flex items-center gap-3">
                            <LogOut className="h-5 w-5 text-secondary-400 dark:text-gray-400 group-hover:text-secondary-900 dark:group-hover:text-white transition-colors" />
                            <div className="text-left">
                                <div className="text-sm sm:text-base font-medium text-secondary-900 dark:text-white group-hover:text-secondary-900 dark:group-hover:text-white">Sign Out</div>
                            </div>
                        </div>
                    </button>
                </div>

                {/* Danger Zone */}
                <div className="mt-8 pt-6 border-t border-secondary-100 dark:border-white/10">
                    <h3 className="text-xs font-semibold text-red-400 uppercase tracking-wider mb-3">Danger Zone</h3>
                    <button
                        onClick={() => setIsDeleteModalOpen(true)}
                        className="w-full flex items-center justify-between p-3 bg-red-500/10 hover:bg-red-500/20 rounded-lg transition-colors group border border-red-500/20"
                    >
                        <div className="flex items-center gap-3">
                            <Trash2 className="h-5 w-5 text-red-400 group-hover:text-red-500 transition-colors" />
                            <div className="text-left">
                                <div className="text-sm sm:text-base font-medium text-red-400 group-hover:text-red-300">Delete Account</div>
                                <div className="text-[10px] sm:text-xs text-red-400/70">Permanently delete your account and all data</div>
                            </div>
                        </div>
                    </button>
                </div>
            </motion.div>

            {/* Delete Confirmation Modal */}
            <Transition appear show={isDeleteModalOpen} as={Fragment}>
                <Dialog as="div" className="relative z-50" onClose={() => setIsDeleteModalOpen(false)}>
                    <Transition.Child
                        as={Fragment}
                        enter="ease-out duration-300"
                        enterFrom="opacity-0"
                        enterTo="opacity-100"
                        leave="ease-in duration-200"
                        leaveFrom="opacity-100"
                        leaveTo="opacity-0"
                    >
                        <div className="fixed inset-0 bg-black/25 backdrop-blur-sm" />
                    </Transition.Child>

                    <div className="fixed inset-0 overflow-y-auto">
                        <div className="flex min-h-full items-center justify-center p-4 text-center">
                            <Transition.Child
                                as={Fragment}
                                enter="ease-out duration-300"
                                enterFrom="opacity-0 scale-95"
                                enterTo="opacity-100 scale-100"
                                leave="ease-in duration-200"
                                leaveFrom="opacity-100 scale-100"
                                leaveTo="opacity-0 scale-95"
                            >
                                <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white dark:bg-secondary-800 p-6 text-left align-middle shadow-xl transition-all border border-secondary-200 dark:border-secondary-700">
                                    <div className="flex items-center gap-4 mb-4">
                                        <div className="h-12 w-12 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center flex-shrink-0">
                                            <AlertTriangle className="h-6 w-6 text-red-600 dark:text-red-400" />
                                        </div>
                                        <Dialog.Title
                                            as="h3"
                                            className="text-lg font-medium leading-6 text-secondary-900 dark:text-white"
                                        >
                                            Delete Account?
                                        </Dialog.Title>
                                    </div>

                                    <div className="mt-2">
                                        <p className="text-sm text-secondary-500 dark:text-secondary-400">
                                            Are you sure you want to delete your account? This action cannot be undone. All your resumes, templates, and credits will be permanently lost.
                                        </p>
                                    </div>

                                    <div className="mt-6 flex gap-3 justify-end">
                                        <button
                                            type="button"
                                            className="inline-flex justify-center rounded-lg border border-secondary-300 dark:border-secondary-600 bg-white dark:bg-secondary-700 px-4 py-2 text-sm font-medium text-secondary-700 dark:text-secondary-200 hover:bg-secondary-50 dark:hover:bg-secondary-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-secondary-500 focus-visible:ring-offset-2"
                                            onClick={() => setIsDeleteModalOpen(false)}
                                            disabled={isDeleting}
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="button"
                                            className="inline-flex justify-center rounded-lg border border-transparent bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                            onClick={handleDeleteAccount}
                                            disabled={isDeleting}
                                        >
                                            {isDeleting ? 'Deleting...' : 'Delete Permanently'}
                                        </button>
                                    </div>
                                </Dialog.Panel>
                            </Transition.Child>
                        </div>
                    </div>
                </Dialog>
            </Transition>
        </>
    )
}
