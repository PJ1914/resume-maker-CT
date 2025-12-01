import { Check } from 'lucide-react'

interface ThemeCustomizerProps {
    theme: {
        primary_color: string
        secondary_color: string
    }
    onChange: (theme: { primary_color: string; secondary_color: string }) => void
}

const COLOR_PRESETS = [
    { name: 'Classic Blue', primary: '00008B', secondary: '4B4B4B', class: 'bg-blue-900' },
    { name: 'Royal Purple', primary: '6B21A8', secondary: '4B4B4B', class: 'bg-purple-800' },
    { name: 'Teal', primary: '0F766E', secondary: '4B4B4B', class: 'bg-teal-700' },
    { name: 'Crimson', primary: '991B1B', secondary: '4B4B4B', class: 'bg-red-800' },
    { name: 'Slate', primary: '334155', secondary: '64748B', class: 'bg-slate-700' },
    { name: 'Black', primary: '000000', secondary: '4B4B4B', class: 'bg-black' },
]

export default function ThemeCustomizer({ theme, onChange }: ThemeCustomizerProps) {
    return (
        <div className="bg-white dark:bg-secondary-900 border border-secondary-200 dark:border-secondary-800 rounded-xl p-5 shadow-sm">
            <h3 className="font-bold text-secondary-900 dark:text-white mb-4">Customize Theme</h3>

            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-3">
                        Accent Color
                    </label>
                    <div className="flex flex-wrap gap-3">
                        {COLOR_PRESETS.map((preset) => (
                            <button
                                key={preset.name}
                                onClick={() => onChange({ primary_color: preset.primary, secondary_color: preset.secondary })}
                                className={`w-10 h-10 rounded-full ${preset.class} flex items-center justify-center transition-transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500`}
                                title={preset.name}
                            >
                                {theme.primary_color === preset.primary && (
                                    <Check className="w-5 h-5 text-white" />
                                )}
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}
