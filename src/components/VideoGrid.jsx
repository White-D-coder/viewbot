import { useState, useEffect } from 'react'
import { VideoPlayer } from './VideoPlayer'

export function VideoGrid({ videoList, count, debugMode }) {
    const [visibleCount, setVisibleCount] = useState(0)

    // Staggered loading: Reveal one player every 150ms to reduce CPU spike
    useEffect(() => {
        setVisibleCount(0) // Reset on mount
        const interval = setInterval(() => {
            setVisibleCount(prev => {
                if (prev < count) return prev + 1
                clearInterval(interval)
                return prev
            })
        }, 150)
        return () => clearInterval(interval)
    }, [count, videoList]) // Reset when list changes

    const players = Array.from({ length: count }, (_, i) => i)

    return (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 xl:grid-cols-6 gap-2">
            {players.map((index) => (
                index < visibleCount ? (
                    <VideoPlayer key={index} videoList={videoList} index={index} debugMode={debugMode} />
                ) : (
                    <div key={index} className="bg-neutral-800 rounded h-40 border border-neutral-700 flex flex-col items-center justify-center text-xs text-neutral-600">
                        <div className="w-4 h-4 rounded-full border-2 border-green-900 border-t-green-500 animate-spin mb-2"></div>
                        Initializing Node {index + 1}...
                    </div>
                )
            ))}
        </div>
    )
}
