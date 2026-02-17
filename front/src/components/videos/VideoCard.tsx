import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Clock, Trash2, Play, Download } from 'lucide-react'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

interface Video {
  id: string
  name: string
  size: number
  duration: number
  createdAt: string
  status: string
  url: string
}

interface VideoCardProps {
  video: Video
  onDelete: (id: string) => void
  formatBytes: (bytes: number) => string
  formatDuration: (seconds: number) => string
  formatDate: (date: string) => string
}

export function VideoCard({ 
  video, 
  onDelete, 
  formatBytes, 
  formatDuration, 
  formatDate 
}: VideoCardProps) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-semibold">{video.name}</h3>
            <Badge variant={video.status === 'ready' ? "default" : "secondary"}>
              {video.status === 'ready' ? 'Готово' : 'В обработке'}
            </Badge>
          </div>
          
          <div className="flex items-center gap-2">
            {video.status === 'ready' && (
              <>
                <Button variant="outline" asChild>
                  <a href={video.url} target="_blank" rel="noopener noreferrer">
                    <Play className="h-4 w-4 mr-2" />
                    Смотреть
                  </a>
                </Button>
                <Button variant="outline" asChild>
                  <a href={`${video.url}?download=1`} download>
                    <Download className="h-4 w-4 mr-2" />
                    Скачать
                  </a>
                </Button>
              </>
            )}
            
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline" className="text-red-500 hover:text-red-600">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Удалить видео?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Это действие нельзя отменить. Видео будет удалено навсегда.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Отмена</AlertDialogCancel>
                  <AlertDialogAction 
                    onClick={() => onDelete(video.id)}
                    className="bg-red-500 hover:bg-red-600"
                  >
                    Удалить
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 text-sm">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-blue-500" />
            <span className="text-slate-600">Длительность:</span>
            <span className="font-medium">{formatDuration(video.duration)}</span>
          </div>

          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-blue-500" />
            <span className="text-slate-600">Размер:</span>
            <span className="font-medium">{formatBytes(video.size)}</span>
          </div>

          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-blue-500" />
            <span className="text-slate-600">Загружено:</span>
            <span className="font-medium">{formatDate(video.createdAt)}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
} 