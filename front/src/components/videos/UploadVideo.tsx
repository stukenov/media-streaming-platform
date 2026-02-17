import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Upload } from 'lucide-react'
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
import { Progress } from "@/components/ui/progress"
import { Textarea } from "@/components/ui/textarea"

interface UploadVideoProps {
  onUpload: (file: File, metadata: VideoMetadata) => void
  isUploading: boolean
}

interface VideoMetadata {
  title: string
  description: string
}

export function UploadVideo({ onUpload, isUploading }: UploadVideoProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [isOpen, setIsOpen] = useState(false)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setSelectedFile(file)
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    
    const file = e.dataTransfer.files[0]
    if (file && file.type.startsWith('video/')) {
      setSelectedFile(file)
    }
  }

  const handleSubmit = async () => {
    if (selectedFile && title.trim()) {
      try {
        const formData = new FormData()
        formData.append('file', selectedFile)
        formData.append('title', title.trim())
        formData.append('description', description.trim())

        const xhr = new XMLHttpRequest()
        xhr.upload.onprogress = (event) => {
          if (event.lengthComputable) {
            const progress = Math.round((event.loaded / event.total) * 100)
            setUploadProgress(progress)
          }
        }

        xhr.onload = () => {
          if (xhr.status === 200) {
            onUpload(selectedFile, {
              title: title.trim(),
              description: description.trim()
            })
            setSelectedFile(null)
            setTitle('')
            setDescription('')
            setIsOpen(false)
            setUploadProgress(0)
          }
        }

        xhr.onerror = () => {
          console.error('Upload failed')
        }

        xhr.open('POST', '/api/videos')
        xhr.send(formData)
      } catch (error) {
        console.error('Upload error:', error)
      }
    }
  }

  const handleCancel = () => {
    setSelectedFile(null)
    setTitle('')
    setDescription('')
    setIsOpen(false)
    setUploadProgress(0)
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button>
          <Upload className="h-4 w-4 mr-2" />
          Загрузить видео
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Загрузка видео</DialogTitle>
          <DialogDescription>
            Перетащите видеофайл или выберите его с компьютера
          </DialogDescription>
        </DialogHeader>
        <div 
          className={`grid gap-4 py-4 ${isDragging ? 'bg-gray-100' : ''}`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <div className="grid gap-2">
            <Label htmlFor="video">Выберите видеофайл</Label>
            <Input 
              id="video" 
              type="file" 
              accept="video/*"
              onChange={handleFileChange}
              disabled={isUploading}
            />
            {selectedFile && (
              <div className="text-sm text-gray-500">
                Выбран файл: {selectedFile.name} ({(selectedFile.size / (1024 * 1024)).toFixed(2)} MB)
              </div>
            )}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="title">Название видео</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Введите название видео"
              disabled={isUploading}
              required
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="description">Описание</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Введите описание видео"
              disabled={isUploading}
            />
          </div>

          {isUploading && (
            <div className="space-y-2">
              <Progress value={uploadProgress} />
              <p className="text-sm text-center text-gray-500">
                Загрузка... {uploadProgress}%
              </p>
            </div>
          )}
        </div>
        <DialogFooter>
          <Button 
            variant="outline" 
            onClick={handleCancel}
            disabled={isUploading}
          >
            Отмена
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isUploading || !selectedFile || !title.trim()}
          >
            Загрузить
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}