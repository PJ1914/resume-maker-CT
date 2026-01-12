import LogoP from '../assests/logo-p.png'

interface BrandLogoProps {
    className?: string
    iconClassName?: string
    textClassName?: string
    subTextClassName?: string
    variant?: 'auto' | 'dark' | 'light'
}

export function BrandLogo({
    className = "",
    iconClassName = "h-8 sm:h-10 w-auto",
    textClassName = "text-xl font-bold",
    subTextClassName = "text-[10px] font-medium tracking-wider uppercase",
    variant = 'auto'
}: BrandLogoProps) {

    // Determine text colors based on variant
    const mainTextColor = variant === 'light'
        ? 'text-white' // Light text for dark backgrounds
        : variant === 'dark'
            ? 'text-secondary-900' // Dark text for light backgrounds
            : 'text-secondary-900 dark:text-white' // Auto (standard)

    const subTextColor = variant === 'light'
        ? 'text-white/60'
        : variant === 'dark'
            ? 'text-secondary-500'
            : 'text-secondary-500 dark:text-white/60'

    return (
        <div className={`flex items-center gap-1 ${className}`}>
            <img
                src={LogoP}
                alt="Prativeda P Icon"
                className={`${iconClassName} object-contain`}
            />
            <div className={`flex flex-col leading-none ${className.includes('flex-col') ? 'items-center' : ''}`}>
                <span className={`${textClassName} tracking-tight ${mainTextColor}`}>
                    Prativeda
                </span>
                <span className={`${subTextClassName} ${subTextColor}`}>
                    Resume Maker
                </span>
            </div>
        </div>
    )
}
