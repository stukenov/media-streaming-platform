'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Video, Upload, Trash2, AlertCircle, Download, Eye, Info, Search, Filter, SortAsc, MoreVertical, X } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Textarea } from "@/components/ui/textarea"
import axios from 'axios'

interface Video {
  id: number
  filename: string
  url: string
  created_at: string
  name: string
  size: number
  date: string
  duration: number
  description: string
}

export default function VideosPage() {
  const [error, setError] = useState('')
  const [videos, setVideos] = useState<Video[]>([])
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [dragActive, setDragActive] = useState(false)
  const [selectedVideo, setSelectedVideo] = useState<number | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState<'date' | 'name' | 'size'>('date')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [editingVideo, setEditingVideo] = useState<{
    id: number;
    name: string;
    description: string;
  } | null>(null)

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault()
    const fileInput = document.querySelector<HTMLInputElement>('#file')
    const file = fileInput?.files?.[0]
    
    if (!file) return

    try {
      setUploading(true)
      setError('')

      if (file.size > 2 * 1024 * 1024 * 1024) {
        throw new Error('Файл слишком большой (максимум 2GB)')
      }

      if (!['video/mp4', 'video/webm', 'video/ogg', 'video/quicktime'].includes(file.type)) {
        throw new Error('Неподдерживаемый формат файла')
      }

      const formData = new FormData()
      formData.append('file', file, file.name)

      const { data } = await axios.post('/api/videos/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total) {
            const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total)
            setUploadProgress(percentCompleted)
          }
        },
        timeout: 30 * 60 * 1000,
        maxContentLength: Infinity,
        maxBodyLength: Infinity
      })

      await axios.patch(`/api/videos/${data.id}`, {
        duration: 0,
        description: editingVideo?.description || 'Загруженное видео'
      })

      setUploading(false)
      setUploadProgress(0)
      if (fileInput) fileInput.value = ''
      fetchVideos()

    } catch (error: any) {
      console.error('Upload failed:', error)
      const errorMessage = error.response?.data?.error || error.message || 'Ошибка при загрузке видео'
      setError(errorMessage)
      setUploading(false)
      setUploadProgress(0)
    }
  }

  const fetchVideos = async () => {
    try {
      const { data } = await axios.get('/api/videos')
      const formattedVideos = data.map((video: any) => ({
        id: video.id,
        name: video.filename,
        filename: video.filename,
        url: video.url,
        size: video.size || 0,
        date: video.created_at,
        duration: video.duration || 0,
        description: video.description || 'Описание видео',
        created_at: video.created_at
      }))
      setVideos(formattedVideos)
    } catch (error) {
      console.error('Failed to fetch videos:', error)
      setError('Ошибка при загрузке списка видео')
    }
  }

  useEffect(() => {
    fetchVideos()
  }, [])

  const handleDelete = async (id: number) => {
    try {
      await axios.delete(`/api/videos/${id}`)
      setVideos(videos.filter(video => video.id !== id))
    } catch (error) {
      console.error('Delete failed:', error)
      setError('Ошибка при удалении видео')
    }
  }

  const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    const droppedFile = e.dataTransfer.files[0]
    if (droppedFile && droppedFile.type.startsWith('video/')) {
      const input = document.querySelector<HTMLInputElement>('#file')
      if (input) {
        const dataTransfer = new DataTransfer()
        dataTransfer.items.add(droppedFile)
        input.files = dataTransfer.files
      }
    }
  }

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setDragActive(true)
  }

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setDragActive(false)
  }

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

  const formatSize = (bytes: number) => {
    if (!bytes || bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`
  }

  const formatDuration = (seconds: number) => {
    if (!seconds || seconds === 0) return '00:00'
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = Math.floor(seconds % 60)
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`
  }

  const handleViewVideo = (video: any) => {
    setEditingVideo({
      id: video.id,
      name: video.name,
      description: video.description
    })
    setIsViewDialogOpen(true)
  }

  const handleSaveVideo = (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingVideo) return

    setVideos(videos.map(video => 
      video.id === editingVideo.id 
        ? { ...video, ...editingVideo }
        : video
    ))
    setIsViewDialogOpen(false)
    setEditingVideo(null)
  }

  const filteredVideos = videos
    .filter(video => 
      video.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      video.description.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => {
      if (sortBy === 'date') {
        return sortOrder === 'asc' 
          ? new Date(a.date).getTime() - new Date(b.date).getTime()
          : new Date(b.date).getTime() - new Date(a.date).getTime()
      }
      if (sortBy === 'name') {
        return sortOrder === 'asc'
          ? a.name.localeCompare(b.name)
          : b.name.localeCompare(a.name)
      }
      if (sortBy === 'size') {
        const aSize = typeof a.size === 'number' ? a.size : 0
        const bSize = typeof b.size === 'number' ? b.size : 0
        return sortOrder === 'asc' ? aSize - bSize : bSize - aSize
      }
      return 0
    })

  return (
    <TooltipProvider>
      <main className="container mx-auto p-4 max-w-full min-h-screen">
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-5 w-5" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-3xl font-bold">Видеозаписи</h2>
            <p className="text-slate-600">Всего: {videos.length}</p>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                type="search"
                placeholder="Поиск..."
                className="pl-10 w-[200px]"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon">
                  <Filter className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setSortBy('date')}>
                  По дате {sortBy === 'date' && '✓'}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSortBy('name')}>
                  По имени {sortBy === 'name' && '✓'}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSortBy('size')}>
                  По размеру {sortBy === 'size' && '✓'}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <Button
              variant="outline"
              size="icon"
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
            >
              <SortAsc className={`h-4 w-4 transition-transform ${sortOrder === 'desc' ? 'rotate-180' : ''}`} />
            </Button>

            <Dialog>
              <DialogTrigger asChild>
                <Button className="flex items-center gap-2">
                  <Upload className="h-5 w-5" />
                  Загрузить
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Загрузка видео</DialogTitle>
                  <DialogDescription>
                    Выберите видеофайл для загрузки или перетащите его в область ниже
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleUpload} className="space-y-4">
                  <div 
                    className={`border-2 border-dashed rounded-lg p-6 transition-colors
                      ${dragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300'}
                      ${uploading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                  >
                    <Input 
                      id="file" 
                      type="file" 
                      accept="video/*" 
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0]
                        if (file) {
                          setEditingVideo({
                            id: 0,
                            name: file.name,
                            description: ''
                          })
                        }
                      }}
                    />
                    <label 
                      htmlFor="file" 
                      className="flex flex-col items-center justify-center h-full"
                    >
                      <Upload className="h-8 w-8 text-gray-400 mb-2" />
                      <p className="text-sm text-gray-600">
                        {uploading ? 'Загрузка...' : 'Нажмите или перетащите файл сюда'}
                      </p>
                    </label>
                  </div>

                  {uploadProgress > 0 && (
                    <div className="space-y-2">
                      <Progress value={uploadProgress} className="w-full" />
                      <p className="text-sm text-slate-600 text-center">
                        Загрузка... {uploadProgress}%
                      </p>
                    </div>
                  )}

                  <DialogFooter>
                    <Button 
                      type="submit" 
                      disabled={uploading}
                      className="w-full"
                    >
                      {uploading ? 'Загрузка...' : 'Загрузить видео'}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {filteredVideos.length === 0 ? (
          <Card className="py-12 border-dashed bg-slate-50/50">
            <CardContent className="flex flex-col items-center text-center">
              <Video className="h-16 w-16 mb-4 text-slate-300" />
              <h3 className="text-xl font-semibold mb-2 text-slate-900">
                {searchQuery ? 'Ничего не найдено' : 'Нет загруженных видео'}
              </h3>
              <p className="text-slate-600">
                {searchQuery 
                  ? 'Попробуйте изменить параметры поиска'
                  : 'Загрузите свой первый видеофайл'
                }
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4">
            {filteredVideos.map(video => (
              <Card 
                key={video.id} 
                className={`group hover:shadow-lg border-slate-200
                  ${selectedVideo === video.id ? 'ring-2 ring-blue-500' : ''}`}
                onClick={() => setSelectedVideo(video.id)}
              >
                <div className="aspect-video bg-slate-100 flex items-center justify-center relative">
                  <Video className="h-12 w-12 text-slate-400" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Button 
                      variant="secondary" 
                      size="sm" 
                      className="bg-white/90 hover:bg-white"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleViewVideo(video)
                      }}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <CardContent className="p-3">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-medium text-sm text-slate-900 truncate flex-1" title={video.name}>
                      {video.name}
                    </h3>
                  </div>
                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <span>{formatSize(video.size)}</span>
                    <span>{formatDuration(video.duration)}</span>
                  </div>
                  <div className="flex items-center justify-end gap-1 mt-2">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleViewVideo(video)
                      }}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <Download className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8 text-red-500"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleDelete(video.id)
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center justify-between">
                <span>Просмотр видео</span>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsViewDialogOpen(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </DialogTitle>
            </DialogHeader>

            {editingVideo && (
              <form onSubmit={handleSaveVideo} className="space-y-4">
                <div className="aspect-video bg-slate-100 rounded-lg flex items-center justify-center">
                  <Video className="h-16 w-16 text-slate-300" />
                </div>

                <div className="space-y-3">
                  <div>
                    <Label htmlFor="name">Название</Label>
                    <Input
                      id="name"
                      value={editingVideo.name}
                      onChange={(e) => setEditingVideo({...editingVideo, name: e.target.value})}
                    />
                  </div>

                  <div>
                    <Label htmlFor="description">Описание</Label>
                    <Textarea
                      id="description"
                      value={editingVideo.description}
                      onChange={(e) => setEditingVideo({...editingVideo, description: e.target.value})}
                      rows={3}
                    />
                  </div>
                </div>

                <DialogFooter>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsViewDialogOpen(false)}
                  >
                    Отмена
                  </Button>
                  <Button type="submit">
                    Сохранить
                  </Button>
                </DialogFooter>
              </form>
            )}
          </DialogContent>
        </Dialog>
      </main>
    </TooltipProvider>
  )
}
