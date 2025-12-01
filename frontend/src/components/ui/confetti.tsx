import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'

interface ConfettiProps {
    count?: number
}

export const Confetti = ({ count = 50 }: ConfettiProps) => {
    const [pieces, setPieces] = useState<any[]>([])

    useEffect(() => {
        const colors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6']
        const newPieces = Array.from({ length: count }).map((_, i) => ({
            id: i,
            x: Math.random() * 100, // percent
            y: -10 - Math.random() * 20, // start above screen
            color: colors[Math.floor(Math.random() * colors.length)],
            rotation: Math.random() * 360,
            scale: 0.5 + Math.random() * 1,
            duration: 2 + Math.random() * 3,
            delay: Math.random() * 0.5
        }))
        setPieces(newPieces)
    }, [count])

    return (
        <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
            {pieces.map((piece) => (
                <motion.div
                    key={piece.id}
                    initial={{
                        top: `${piece.y}%`,
                        left: `${piece.x}%`,
                        rotate: piece.rotation,
                        scale: piece.scale,
                        opacity: 1
                    }}
                    animate={{
                        top: '110%',
                        rotate: piece.rotation + 360 + Math.random() * 360,
                        opacity: 0
                    }}
                    transition={{
                        duration: piece.duration,
                        ease: "linear",
                        delay: piece.delay,
                        repeat: Infinity,
                        repeatDelay: Math.random() * 2
                    }}
                    style={{
                        position: 'absolute',
                        width: '10px',
                        height: '10px',
                        backgroundColor: piece.color,
                        borderRadius: Math.random() > 0.5 ? '50%' : '2px'
                    }}
                />
            ))}
        </div>
    )
}
