import { useState, useEffect, useRef } from 'react'
import YouTube from 'react-youtube'
import { RefreshCw, User } from 'lucide-react'

const USER_AGENTS = [
    "CyberWolf99", "PixelNinja", "DataMiner_X", "NetRunner01", "GlitchHunter",
    "CodeMaster", "ByteSurfer", "NeonRider", "QuantumLeap", "StealthMode",
    "AlphaProtocol", "SystemOverride", "LogicGate", "NullPointer", "BinaryBoss",
    "SyntaxError", "CacheFlow", "PacketSniffer", "BandwidthKing", "LatencyZero",
    "RootAccess", "AdminPrivileges", "User_404", "EchoPing", "TraceRoute",
    "FirewallBreaker", "ProxyServer", "VPN_Ghost", "IncognitoUser", "DarkWebDrifter"
]

export function VideoPlayer({ videoList, index, debugMode }) {
    const [key, setKey] = useState(0) // Used to force re-mount/reset
    const [user, setUser] = useState('')
    const [currentVideoId, setCurrentVideoId] = useState('')
    const [status, setStatus] = useState('Initializing...')
    const [debugState, setDebugState] = useState(null) // Raw player state
    const playerRef = useRef(null)

    const getRandomVideo = () => {
        if (!videoList || videoList.length === 0) return ''
        return videoList[Math.floor(Math.random() * videoList.length)]
    }

    // Assign a random user and video on mount or reset
    useEffect(() => {
        const randomUser = USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)] + `_${Math.floor(Math.random() * 1000)}`
        setUser(randomUser)

        // Pick random video from pool
        const vid = getRandomVideo()
        setCurrentVideoId(vid)

        setStatus('Buffering...')
    }, [key, videoList])

    const opts = {
        height: '100%',
        width: '100%',
        playerVars: {
            autoplay: 1,
            controls: 0,
            mute: 1,
            modestbranding: 1,
            rel: 0,
            origin: window.location.origin,
        },
        host: 'https://www.youtube-nocookie.com',
    }

    const triggerNextVideo = () => {
        setStatus('Switching Account...')
        const delay = Math.floor(Math.random() * 8000) + 2000
        setTimeout(() => {
            setKey(prev => prev + 1)
        }, delay)
    }

    const onReady = (event) => {
        const player = event.target
        playerRef.current = player
        player.setPlaybackQuality('small')

        const duration = player.getDuration()
        if (duration > 0 && Math.random() > 0.8) {
            player.seekTo(duration * Math.random() * 0.2, true)
        }

        player.playVideo()
    }

    const onStateChange = (event) => {
        setDebugState(event.data) // Capture raw state

        // If playing (1)
        if (event.data === 1) {
            setStatus('Watching')
            // Auto switch after random duration
            const watchTime = (Math.floor(Math.random() * 180) + 30) * 1000
            setTimeout(() => {
                if (playerRef.current) {
                    setStatus('Leaving...')
                    triggerNextVideo()
                }
            }, watchTime)
        }
    }

    const onError = () => {
        setStatus('Error - Skipping')
        setTimeout(() => {
            setKey(prev => prev + 1)
        }, 3000)
    }

    if (!currentVideoId) return <div className="bg-neutral-800 h-40 flex items-center justify-center text-xs text-neutral-600">No Video Source</div>

    return (
        <div className="bg-neutral-800 rounded overflow-hidden border border-neutral-700 shadow-md flex flex-col h-40">
            <div className="bg-neutral-900 px-2 py-1 flex justify-between items-center text-[10px] font-mono border-b border-neutral-700">
                <div className="flex items-center gap-1 text-green-400">
                    <User size={10} />
                    <span className="truncate max-w-[80px]">{user}</span>
                </div>
                <div className="flex items-center gap-1 text-neutral-400">
                    {debugMode && <span className="text-[9px] text-yellow-500 font-bold mr-2">STATE: {debugState}</span>}
                    <span>{status}</span>
                    {(status === 'Buffering...' || status === 'Switching Account...') && <RefreshCw size={8} className="animate-spin" />}
                </div>
            </div>

            <div className="flex-1 relative bg-black">
                <div className="absolute inset-0 pointer-events-none opacity-80">
                    <YouTube
                        key={`${currentVideoId}-${key}`}
                        videoId={currentVideoId}
                        opts={opts}
                        onEnd={triggerNextVideo}
                        onReady={onReady}
                        onStateChange={onStateChange}
                        onError={onError}
                        className="h-full w-full object-cover"
                        iframeClassName="h-full w-full"
                    />
                </div>
                <div className="absolute inset-0 bg-transparent z-10"></div>
            </div>
        </div>
    )
}
