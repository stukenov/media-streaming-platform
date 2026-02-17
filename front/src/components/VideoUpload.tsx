import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import axios from 'axios'

interface VideoUploadProps {
  onUploadComplete: () => void;
  onError: (message: string) => void;
}

export function VideoUpload({ onUploadComplete, onError }: VideoUploadProps) {
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const videoRef = useRef<HTMLVideoElement>(null)

  const getDuration = (file: File): Promise<number> => {
    return new Promise((resolve) => {
      const video = document.createElement('video')
      video.preload = 'metadata'
      video.onloadedmetadata = () => {
        window.URL.revokeObjectURL(video.src)
        resolve(video.duration)
      }
      video.src = URL.createObjectURL(file)
    })
  }

  const handleUpload = async () => {
    if (!file) return

    try {
      setUploading(true)
      setProgress(0)
      
      // Получаем длительность видео
      const duration = await getDuration(file)
      
      // Получаем URL для загрузки
      const { data } = await axios.post('/api/videos/upload-url', {
        filename: file.name,
        contentType: file.type,
        fileSize: file.size
      })

      // Загружаем файл с отслеживанием прогресса
      await axios.put(data.uploadUrl, file, {
        headers: {
          'Content-Type': file.type
        },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total!)
          setProgress(percentCompleted)
        }
      })

      // Обновляем информацию о видео
      await axios.patch(`/api/videos/${data.videoId}`, {
        duration: Math.round(duration),
        description: 'Загруженное видео'
      })

      setFile(null)
      setUploading(false)
      setProgress(0)
      onUploadComplete()
    } catch (error) {
      console.error('Upload failed:', error)
      onError('Ошибка при загрузке видео')
      setUploading(false)
      setProgress(0)
    }
  }

  const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()

    const droppedFile = e.dataTransfer.files[0]
    if (droppedFile && droppedFile.type.startsWith('video/')) {
      setFile(droppedFile)
    }
  }

  return (
    <div 
      className="space-y-4"
      onDrop={handleDrop}
      onDragOver={(e) => e.preventDefault()}
    >
      <Input
        type="file"
        accept="video/*"
        onChange={(e) => setFile(e.target.files?.[0] || null)}
      />
      {file && (
        <div className="text-sm text-gray-500">
          Выбран файл: {file.name} ({(file.size / (1024 * 1024)).toFixed(2)} MB)
        </div>
      )}
      {progress > 0 && (
        <div className="w-full bg-gray-200 rounded-full h-2.5">
          <div 
            className="bg-blue-600 h-2.5 rounded-full" 
            style={{ width: `${progress}%` }}
          />
        </div>
      )}
      <Button 
        onClick={handleUpload}
        disabled={!file || uploading}
      >
        {uploading ? `Загрузка... ${progress}%` : 'Загрузить видео'}
      </Button>
    </div>
  )
} 