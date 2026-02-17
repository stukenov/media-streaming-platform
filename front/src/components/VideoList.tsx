import { useEffect, useState } from 'react'
import axios from 'axios'

interface Video {
  id: number
  filename: string
  url: string
  created_at: string
  size: number
  duration: number
  description: string
}

export function VideoList() {
  const [videos, setVideos] = useState<Video[]>([])

  const fetchVideos = async () => {
    try {
      const { data } = await axios.get('/api/videos')
      setVideos(data)
    } catch (error) {
      console.error('Failed to fetch videos:', error)
    }
  }

  useEffect(() => {
    fetchVideos()
  }, [])

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
  }

  const formatSize = (bytes: number) => {
    const mb = bytes / (1024 * 1024)
    return `${mb.toFixed(1)} MB`
  }

  return (
    <div className="space-y-4">
      {videos.map((video) => (
        <div key={video.id} className="border p-4 rounded-lg">
          <h3 className="font-medium">{video.filename}</h3>
          <video 
            controls 
            className="w-full mt-2"
            src={video.url}
          />
          <div className="mt-2 text-sm text-gray-500 space-y-1">
            <p>Размер: {formatSize(video.size)}</p>
            <p>Длительность: {formatDuration(video.duration)}</p>
            <p>Загружено: {new Date(video.created_at).toLocaleString()}</p>
            {video.description && <p>Описание: {video.description}</p>}
          </div>
        </div>
      ))}
    </div>
  )
} 