'use client'

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Activity, Radio, Video } from "lucide-react"

export function Navigation() {
  const pathname = usePathname()

  return (
    <nav className="fixed left-0 top-0 h-screen w-16 bg-white border-r shadow-sm flex flex-col items-center py-4 gap-8">
      <Link 
        href="/" 
        className={`flex flex-col items-center gap-1 p-2 rounded-lg transition-colors hover:bg-slate-50 ${
          pathname === "/" 
            ? "text-primary bg-primary/5" 
            : "text-muted-foreground hover:text-primary"
        }`}
      >
        <Activity className="h-5 w-5" />
        <span className="text-xs">Статус</span>
      </Link>
      <Link 
        href="/live" 
        className={`flex flex-col items-center gap-1 p-2 rounded-lg transition-colors hover:bg-slate-50 ${
          pathname === "/live"
            ? "text-primary bg-primary/5"
            : "text-muted-foreground hover:text-primary" 
        }`}
      >
        <Radio className="h-5 w-5" />
        <span className="text-xs">Эфир</span>
      </Link>
      <Link 
        href="/videos" 
        className={`flex flex-col items-center gap-1 p-2 rounded-lg transition-colors hover:bg-slate-50 ${
          pathname === "/videos"
            ? "text-primary bg-primary/5"
            : "text-muted-foreground hover:text-primary" 
        }`}
      >
        <Video className="h-5 w-5" />
        <span className="text-xs">Видео</span>
      </Link>
    </nav>
  )
}