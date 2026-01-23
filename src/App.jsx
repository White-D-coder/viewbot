import { useState } from 'react'
import { VideoGrid } from './components/VideoGrid'
import { Play, Square, Key, Radio, Settings, Cpu, Activity } from 'lucide-react'

function App() {
    const [url, setUrl] = useState('')
    const [apiKey, setApiKey] = useState('')
    const [isPlaying, setIsPlaying] = useState(false)
    const [videoList, setVideoList] = useState([])
    const [statusMsg, setStatusMsg] = useState('')
    const [nodeCount, setNodeCount] = useState(10)
    const [debugMode, setDebugMode] = useState(false) // New Debug Mode State

    const scrapeChannelVideos = async (channelUrl) => {
        try {
            setStatusMsg('Attempting No-Key Scrape...')

            // Ensure we are scrubbing the /videos tab if generic link given
            let targetUrl = channelUrl
            if (!targetUrl.includes('/videos')) {
                if (targetUrl.endsWith('/')) targetUrl += 'videos'
                else targetUrl += '/videos'
            }

            // List of proxies to try in order
            const proxies = [
                (url) => `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(url)}`, // New Primary
                (url) => `https://corsproxy.io/?${encodeURIComponent(url)}`,
                (url) => `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`
            ]

            let html = ''
            let lastError = null

            for (const proxyGen of proxies) {
                try {
                    const proxyUrl = proxyGen(targetUrl)
                    console.log('Trying proxy:', proxyUrl)
                    const res = await fetch(proxyUrl)
                    if (!res.ok) throw new Error(`Status ${res.status}`)
                    html = await res.text()
                    if (html) break // Success
                } catch (e) {
                    console.warn('Proxy failed:', e)
                    lastError = e
                }
            }

            if (!html) throw new Error('All proxies failed. API Key recommended.')

            const regex = /"videoId":"([a-zA-Z0-9_-]{11})"/g
            const matches = [...html.matchAll(regex)]
            const ids = [...new Set(matches.map(m => m[1]))]

            if (ids.length === 0) throw new Error('No videos found in scrape')

            setStatusMsg(`Scraped ${ids.length} videos`)
            return ids

        } catch (e) {
            console.error('Scrape failed', e)
            setStatusMsg(`Scrape Error: ${e.message}`)
            return []
        }
    }

    const fetchChannelVideos = async (channelIdOrUser) => {
        // FALLBACK: If no API Key, try scraping
        if (!apiKey) {
            return await scrapeChannelVideos(channelIdOrUser)
        }

        try {
            setStatusMsg('Resolving Channel...')
            let channelId = channelIdOrUser

            // 1. If it's a URL, try to extract ID or Handle
            if (channelIdOrUser.includes('youtube.com/')) {
                const urlObj = new URL(channelIdOrUser)
                const pathSegments = urlObj.pathname.split('/').filter(Boolean)

                if (pathSegments[0] === 'channel') {
                    channelId = pathSegments[1]
                } else if (pathSegments[0] === 'c' || pathSegments[0] === 'user' || pathSegments[0].startsWith('@')) {
                    // We need to resolve handle/user to ID
                    const handle = pathSegments[0].startsWith('@') ? pathSegments[0] : (pathSegments[1] || pathSegments[0])
                    // Search for channel by handle/name
                    const searchUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&type=channel&q=${handle}&key=${apiKey}`
                    const searchRes = await fetch(searchUrl)
                    const searchData = await searchRes.json()
                    if (searchData.items && searchData.items.length > 0) {
                        channelId = searchData.items[0].snippet.channelId
                    } else {
                        throw new Error('Channel not found')
                    }
                }
            }

            setStatusMsg(`Fetching Uploads for ${channelId}...`)

            // 2. Get Channel Uploads Playlist ID
            const channelUrl = `https://www.googleapis.com/youtube/v3/channels?part=contentDetails&id=${channelId}&key=${apiKey}`
            const channelRes = await fetch(channelUrl)
            const channelData = await channelRes.json()

            if (!channelData.items || channelData.items.length === 0) {
                throw new Error('Invalid Channel ID')
            }

            const uploadsPlaylistId = channelData.items[0].contentDetails.relatedPlaylists.uploads

            // 3. Fetch Videos from Playlist (Max 50 for now)
            const playlistUrl = `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&playlistId=${uploadsPlaylistId}&maxResults=50&key=${apiKey}`
            const playlistRes = await fetch(playlistUrl)
            const playlistData = await playlistRes.json()

            const videos = playlistData.items.map(item => item.snippet.resourceId.videoId)
            setStatusMsg(`Loaded ${videos.length} videos from channel`)
            return videos

        } catch (e) {
            console.error(e)
            // On API failure, also try scraping
            console.log('API Failed, falling back to scrape')
            return await scrapeChannelVideos(channelIdOrUser)
        }
    }

    const handleStart = async () => {
        if (!url) return

        // Check if it's a single video or channel
        if (url.includes('watch?v=') || url.includes('youtu.be/')) {
            // Single Video Mode
            try {
                let id = ''
                if (url.includes('youtu.be')) {
                    id = url.split('youtu.be/')[1]
                } else if (url.includes('v=')) {
                    id = url.split('v=')[1].split('&')[0]
                }
                if (id) {
                    setVideoList([id]) // Array of 1
                    setIsPlaying(true)
                    setStatusMsg('Single Video Mode')
                }
            } catch (e) { setStatusMsg('Invalid Video URL') }
        } else {
            // Channel Mode
            const videos = await fetchChannelVideos(url)
            if (videos.length > 0) {
                setVideoList(videos)
                setIsPlaying(true)
            }
        }
    }

    const handleStop = () => {
        setIsPlaying(false)
        setVideoList([])
        setStatusMsg('')
    }

    return (
        <div className="min-h-screen bg-neutral-900 text-white p-4 font-mono">
            <header className="mb-6 border-b border-neutral-800 pb-4">
                <div className="flex items-center justify-between mb-4">
                    <h1 className="text-2xl font-bold text-green-500 tracking-wider">MULTI-VIEW<span className="text-white">//BOT</span></h1>
                    <div className="flex items-center gap-2">
                        <div className="text-xs text-neutral-500">API STATUS:</div>
                        <div className={`w-2 h-2 rounded-full ${apiKey ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
                    </div>
                </div>

                <div className="flex flex-col gap-3 max-w-4xl mx-auto">
                    {/* API Key Input */}
                    <div className="flex items-center gap-2 bg-neutral-950 border border-neutral-800 rounded px-3 py-1">
                        <Key size={14} className="text-yellow-500" />
                        <input
                            type="password"
                            placeholder="Optional: Enter YouTube API Key (Faster/More Reliable)"
                            className="flex-1 bg-transparent border-none focus:outline-none text-xs text-neutral-400 font-mono"
                            value={apiKey}
                            onChange={(e) => setApiKey(e.target.value)}
                        />
                    </div>

                    {/* Node Count Slider */}
                    <div className="flex items-center gap-4 bg-neutral-950 border border-neutral-800 rounded px-4 py-2">
                        <div className="flex items-center gap-2 text-neutral-400 min-w-[120px]">
                            <Cpu size={14} />
                            <span className="text-xs">NODES: <span className="text-green-500 font-bold text-sm">{nodeCount}</span></span>
                        </div>
                        <input
                            type="range"
                            min="1"
                            max="50"
                            value={nodeCount}
                            onChange={(e) => setNodeCount(parseInt(e.target.value))}
                            className="flex-1 h-1 bg-neutral-700 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:bg-green-500 [&::-webkit-slider-thumb]:rounded-full"
                        />

                        <button
                            onClick={() => setDebugMode(!debugMode)}
                            className={`p-1 rounded ${debugMode ? 'bg-green-900 text-green-400' : 'bg-neutral-800 text-neutral-500'}`}
                            title="Toggle Debug View"
                        >
                            <Activity size={14} />
                        </button>

                        <span className="text-[10px] text-neutral-500 w-24 text-right">LOWER = FASTER</span>
                    </div>

                    <div className="flex gap-4 w-full">
                        <input
                            type="text"
                            placeholder="Enter YouTube Video URL OR Channel URL..."
                            className="flex-1 bg-neutral-800 border border-neutral-700 rounded px-4 py-2 focus:outline-none focus:border-green-500 text-sm"
                            value={url}
                            onChange={(e) => setUrl(e.target.value)}
                        />
                        {!isPlaying ? (
                            <button
                                onClick={handleStart}
                                className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded flex items-center gap-2 font-bold transition-all text-sm"
                            >
                                <Play size={16} /> START SWARM
                            </button>
                        ) : (
                            <button
                                onClick={handleStop}
                                className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded flex items-center gap-2 font-bold transition-all text-sm"
                            >
                                <Square size={16} /> TERMINATE
                            </button>
                        )}
                    </div>
                    {statusMsg && <div className="text-xs text-green-400 text-center animate-pulse">{'>'} {statusMsg}</div>}
                </div>

                <div className="mt-4 flex justify-between text-xs text-neutral-500 px-4">
                    <div>MODE: <span className="text-white">{videoList.length > 1 ? 'CHANNEL_ROTATION' : 'SINGLE_TARGET'}</span></div>
                    <div>POOL_SIZE: <span className="text-white">{videoList.length}</span></div>
                    <div>ACTIVE NODES: <span className={isPlaying ? "text-green-500" : "text-red-500"}>{isPlaying ? nodeCount.toString().padStart(2, '0') : "00"}</span></div>
                </div>
            </header>

            <main>
                {isPlaying && videoList.length > 0 && (
                    <VideoGrid videoList={videoList} count={nodeCount} debugMode={debugMode} />
                )}

                {!isPlaying && (
                    <div className="flex flex-col items-center justify-center h-[50vh] text-neutral-600">
                        <Radio size={48} className="mb-4 opacity-20" />
                        <div className="text-4xl mb-4 opacity-20">SYSTEM IDLE</div>
                        <p className="max-w-md text-center text-sm">
                            Enter a Channel URL to scrape uploads and distribute across the swarm,
                            or a single Video URL for focused viewing.
                        </p>
                    </div>
                )}
            </main>
        </div>
    )
}

export default App
