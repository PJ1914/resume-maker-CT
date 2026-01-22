import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface CarouselItem {
    id: string;
    content: React.ReactNode;
}

interface HeroProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'title'> {
    title: React.ReactNode;
    subtitle: string;
    items: CarouselItem[];
}

export const HeroSection = React.forwardRef<HTMLDivElement, HeroProps>(
    ({ title, subtitle, items, className, ...props }, ref) => {
        const [currentIndex, setCurrentIndex] = React.useState(Math.floor(items.length / 2));
        const [isPaused, setIsPaused] = React.useState(false);

        const handleNext = React.useCallback(() => {
            setCurrentIndex((prevIndex) => (prevIndex + 1) % items.length);
        }, [items.length]);

        const handlePrev = React.useCallback(() => {
            setCurrentIndex((prevIndex) => (prevIndex - 1 + items.length) % items.length);
        }, [items.length]);

        // Keyboard Navigation
        React.useEffect(() => {
            const handleKeyDown = (e: KeyboardEvent) => {
                if (e.key === 'ArrowLeft') {
                    handlePrev();
                } else if (e.key === 'ArrowRight') {
                    handleNext();
                }
            };

            window.addEventListener('keydown', handleKeyDown);
            return () => window.removeEventListener('keydown', handleKeyDown);
        }, [handleNext, handlePrev]);

        // Auto-advance
        React.useEffect(() => {
            if (isPaused) return;
            const timer = setInterval(() => {
                handleNext();
            }, 5000); // Slower for resumes
            return () => clearInterval(timer);
        }, [handleNext, isPaused]);

        return (
            <div
                ref={ref}
                className={cn(
                    'relative w-full flex flex-col items-center justify-start overflow-x-hidden bg-background text-foreground p-4 pt-16 pb-12',
                    className
                )}
                {...props}
            >
                {/* Background Gradient */}
                <div className="absolute inset-0 z-0 opacity-20 pointer-events-none" aria-hidden="true">
                    <div className="absolute bottom-0 left-[-20%] right-0 top-[-10%] h-[500px] w-[500px] rounded-full bg-[radial-gradient(circle_farthest-side,rgba(128,90,213,0.3),rgba(255,255,255,0))]"></div>
                    <div className="absolute bottom-0 right-[-20%] top-[-10%] h-[500px] w-[500px] rounded-full bg-[radial-gradient(circle_farthest-side,rgba(0,123,255,0.3),rgba(255,255,255,0))]"></div>
                </div>

                {/* Content */}
                <div className="z-10 flex w-full flex-col items-center text-center space-y-8 md:space-y-12">
                    {/* Header Section */}
                    <div className="space-y-4">
                        <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tighter max-w-4xl">
                            {title}
                        </h1>
                        <p className="max-w-2xl mx-auto text-muted-foreground md:text-xl">
                            {subtitle}
                        </p>
                    </div>

                    {/* Main Showcase Section */}
                    <div
                        className="relative w-full h-[400px] md:h-[500px] flex items-center justify-center"
                        onMouseEnter={() => setIsPaused(true)}
                        onMouseLeave={() => setIsPaused(false)}
                    >
                        {/* Carousel Wrapper */}
                        <div className="relative w-full h-full flex items-center justify-center [perspective:1000px]">
                            {items.map((item, index) => {
                                const offset = index - currentIndex;
                                const total = items.length;
                                let pos = (offset + total) % total;
                                if (pos > Math.floor(total / 2)) {
                                    pos = pos - total;
                                }

                                const isCenter = pos === 0;
                                const isAdjacent = Math.abs(pos) === 1;
                                const isVisible = Math.abs(pos) <= 2;

                                if (!isVisible) return null;

                                return (
                                    <div
                                        key={item.id}
                                        className={cn(
                                            'absolute transition-all duration-500 ease-in-out',
                                            'flex items-center justify-center bg-white rounded-lg shadow-xl overflow-hidden',
                                            'w-[280px] h-[400px] md:w-[320px] md:h-[450px]' // Adjusted for A4 ratio
                                        )}
                                        style={{
                                            transform: `
                        translateX(${(pos) * 60}%) 
                        scale(${isCenter ? 1 : isAdjacent ? 0.85 : 0.7})
                        rotateY(${(pos) * -10}deg)
                      `,
                                            zIndex: isCenter ? 10 : 10 - Math.abs(pos),
                                            opacity: isCenter ? 1 : isAdjacent ? 0.6 : 0.3,
                                            filter: isCenter ? 'blur(0px)' : 'blur(2px)',
                                        }}
                                    >
                                        {item.content}
                                    </div>
                                );
                            })}
                        </div>

                        {/* Navigation Buttons */}
                        <Button
                            variant="outline"
                            size="icon"
                            className="absolute left-2 sm:left-8 top-1/2 -translate-y-1/2 rounded-full h-10 w-10 z-20 bg-background/50 backdrop-blur-sm hover:bg-background/80"
                            onClick={handlePrev}
                        >
                            <ChevronLeft className="h-5 w-5" />
                        </Button>
                        <Button
                            variant="outline"
                            size="icon"
                            className="absolute right-2 sm:right-8 top-1/2 -translate-y-1/2 rounded-full h-10 w-10 z-20 bg-background/50 backdrop-blur-sm hover:bg-background/80"
                            onClick={handleNext}
                        >
                            <ChevronRight className="h-5 w-5" />
                        </Button>
                    </div>
                </div>
            </div>
        );
    }
);

HeroSection.displayName = 'HeroSection';
