'use client'

import { useState, useEffect } from 'react'
import { Clock } from 'lucide-react'

interface LastUpdateTimeProps {
  lastUpdate: Date
}

export function LastUpdateTime({ lastUpdate }: LastUpdateTimeProps) {
  const [formattedTime, setFormattedTime] = useState<string>('')

  useEffect(() => {
    setFormattedTime(lastUpdate.toLocaleTimeString())
  }, [lastUpdate])

  return (
    <div className="flex items-center gap-2 px-3 py-1.5 bg-white rounded border text-sm">
      <Clock className="h-4 w-4 text-blue-500" />
      <span className="text-slate-600">
        Обновлено: <time className="font-medium">{formattedTime}</time>
      </span>
    </div>
  )
} 