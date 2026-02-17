'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertCircle, Activity, Server, Database } from 'lucide-react'
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"

export default function Home() {
  const [error, setError] = useState('')
  const [status, setStatus] = useState<{
    uptime: string,
    connections: number,
    cpu: number,
    memory: number
  }>({
    uptime: '0s',
    connections: 0,
    cpu: 0,
    memory: 0
  })

  useEffect(() => {
    checkStatus()
    const interval = setInterval(checkStatus, 5000)
    return () => clearInterval(interval)
  }, [])

  const checkStatus = async () => {
    try {
      const res = await fetch('/api/status')
      if (!res.ok) throw new Error('Сервер недоступен')
      const data = await res.json()
      setStatus(data)
      setError('')
    } catch (err) {
      setError('Не удалось получить статус сервера')
    }
  }

  return (
    <main className="container mx-auto p-8 max-w-7xl min-h-screen bg-gradient-to-b from-slate-50">
      {error && (
        <Alert variant="destructive" className="mb-8 animate-in fade-in slide-in-from-top-4">
          <AlertCircle className="h-5 w-5" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="space-y-3 mb-10">
        <h2 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-blue-600 to-blue-400 bg-clip-text text-transparent">
          Статус системы
        </h2>
        <p className="text-slate-600">Мониторинг состояния медиа-сервера</p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-blue-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg text-blue-900">
              <Activity className="h-5 w-5 text-blue-500" />
              Время работы
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-blue-900">{status.uptime}</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg text-green-900">
              <Database className="h-5 w-5 text-green-500" />
              Подключения
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-green-900">{status.connections}</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg text-purple-900">
              <Server className="h-5 w-5 text-purple-500" />
              Загрузка CPU
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-purple-900">{status.cpu}%</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg text-orange-900">
              <Server className="h-5 w-5 text-orange-500" />
              Память
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-orange-900">{status.memory}%</p>
          </CardContent>
        </Card>
      </div>
    </main>
  )
}
