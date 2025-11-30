import React from 'react';

export const Avatar1 = ({ className }: { className?: string }) => (
    <svg viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
        <circle cx="18" cy="18" r="18" fill="#FFADAD" />
        <rect x="8" y="18" width="20" height="14" rx="7" fill="#FFE5E5" />
        <circle cx="18" cy="14" r="6" fill="#FFE5E5" />
        <path d="M14 15C14 15 15 16 18 16C21 16 22 15 22 15" stroke="#FF8585" strokeWidth="2" strokeLinecap="round" />
        <circle cx="15" cy="12" r="1.5" fill="#333" />
        <circle cx="21" cy="12" r="1.5" fill="#333" />
    </svg>
);

export const Avatar2 = ({ className }: { className?: string }) => (
    <svg viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
        <circle cx="18" cy="18" r="18" fill="#FFD6A5" />
        <rect x="8" y="18" width="20" height="14" rx="7" fill="#FFF0DB" />
        <circle cx="18" cy="14" r="6" fill="#FFF0DB" />
        <path d="M14 15C14 15 15 16 18 16C21 16 22 15 22 15" stroke="#FFB46F" strokeWidth="2" strokeLinecap="round" />
        <circle cx="15" cy="12" r="1.5" fill="#333" />
        <circle cx="21" cy="12" r="1.5" fill="#333" />
    </svg>
);

export const Avatar3 = ({ className }: { className?: string }) => (
    <svg viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
        <circle cx="18" cy="18" r="18" fill="#FDFFB6" />
        <rect x="8" y="18" width="20" height="14" rx="7" fill="#FFFFE0" />
        <circle cx="18" cy="14" r="6" fill="#FFFFE0" />
        <path d="M14 15C14 15 15 16 18 16C21 16 22 15 22 15" stroke="#E6E890" strokeWidth="2" strokeLinecap="round" />
        <circle cx="15" cy="12" r="1.5" fill="#333" />
        <circle cx="21" cy="12" r="1.5" fill="#333" />
    </svg>
);

export const Avatar4 = ({ className }: { className?: string }) => (
    <svg viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
        <circle cx="18" cy="18" r="18" fill="#CAFFBF" />
        <rect x="8" y="18" width="20" height="14" rx="7" fill="#E8FFE3" />
        <circle cx="18" cy="14" r="6" fill="#E8FFE3" />
        <path d="M14 15C14 15 15 16 18 16C21 16 22 15 22 15" stroke="#9BF686" strokeWidth="2" strokeLinecap="round" />
        <circle cx="15" cy="12" r="1.5" fill="#333" />
        <circle cx="21" cy="12" r="1.5" fill="#333" />
    </svg>
);

export const Avatar5 = ({ className }: { className?: string }) => (
    <svg viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
        <circle cx="18" cy="18" r="18" fill="#9BF6FF" />
        <rect x="8" y="18" width="20" height="14" rx="7" fill="#D6FCFF" />
        <circle cx="18" cy="14" r="6" fill="#D6FCFF" />
        <path d="M14 15C14 15 15 16 18 16C21 16 22 15 22 15" stroke="#69E2EE" strokeWidth="2" strokeLinecap="round" />
        <circle cx="15" cy="12" r="1.5" fill="#333" />
        <circle cx="21" cy="12" r="1.5" fill="#333" />
    </svg>
);

export const Avatar6 = ({ className }: { className?: string }) => (
    <svg viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
        <circle cx="18" cy="18" r="18" fill="#A0C4FF" />
        <rect x="8" y="18" width="20" height="14" rx="7" fill="#D1E3FF" />
        <circle cx="18" cy="14" r="6" fill="#D1E3FF" />
        <path d="M14 15C14 15 15 16 18 16C21 16 22 15 22 15" stroke="#7FA9EE" strokeWidth="2" strokeLinecap="round" />
        <circle cx="15" cy="12" r="1.5" fill="#333" />
        <circle cx="21" cy="12" r="1.5" fill="#333" />
    </svg>
);

export const Avatar7 = ({ className }: { className?: string }) => (
    <svg viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
        <circle cx="18" cy="18" r="18" fill="#BDB2FF" />
        <rect x="8" y="18" width="20" height="14" rx="7" fill="#E2DDFF" />
        <circle cx="18" cy="14" r="6" fill="#E2DDFF" />
        <path d="M14 15C14 15 15 16 18 16C21 16 22 15 22 15" stroke="#9D8EFF" strokeWidth="2" strokeLinecap="round" />
        <circle cx="15" cy="12" r="1.5" fill="#333" />
        <circle cx="21" cy="12" r="1.5" fill="#333" />
    </svg>
);

export const Avatar8 = ({ className }: { className?: string }) => (
    <svg viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
        <circle cx="18" cy="18" r="18" fill="#FFC6FF" />
        <rect x="8" y="18" width="20" height="14" rx="7" fill="#FFE3FF" />
        <circle cx="18" cy="14" r="6" fill="#FFE3FF" />
        <path d="M14 15C14 15 15 16 18 16C21 16 22 15 22 15" stroke="#FF9EFF" strokeWidth="2" strokeLinecap="round" />
        <circle cx="15" cy="12" r="1.5" fill="#333" />
        <circle cx="21" cy="12" r="1.5" fill="#333" />
    </svg>
);

const avatars = [Avatar1, Avatar2, Avatar3, Avatar4, Avatar5, Avatar6, Avatar7, Avatar8];

export const getAvatar = (seed: string) => {
    let hash = 0;
    for (let i = 0; i < seed.length; i++) {
        hash = seed.charCodeAt(i) + ((hash << 5) - hash);
    }
    const index = Math.abs(hash) % avatars.length;
    return avatars[index];
};
