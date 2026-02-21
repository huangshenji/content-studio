import { useState } from 'react'
import {
  Lightbulb,
  FileEdit,
  Send,
  Settings,
  ChevronLeft,
  ChevronRight,
  Sparkles,
} from 'lucide-react'
import { cn } from '../../utils/cn'

interface SidebarProps {
  activeView: string
  onViewChange: (view: string) => void
}

const navItems = [
  { id: 'ideas', label: '想法', icon: Lightbulb },
  { id: 'editor', label: '编辑', icon: FileEdit },
  { id: 'ai', label: 'AI助手', icon: Sparkles },
  { id: 'publish', label: '发布', icon: Send },
]

export function Sidebar({ activeView, onViewChange }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false)

  return (
    <aside
      className={cn(
        'h-screen bg-slate-900 border-r border-slate-800 flex flex-col transition-all duration-300',
        collapsed ? 'w-16' : 'w-56'
      )}
    >
      {/* Logo */}
      <div className="h-14 flex items-center justify-between px-4 border-b border-slate-800">
        {!collapsed && (
          <span className="font-semibold text-lg text-white">Content Studio</span>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
        >
          {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-2 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = activeView === item.id
          return (
            <button
              key={item.id}
              onClick={() => onViewChange(item.id)}
              className={cn(
                'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors',
                isActive
                  ? 'bg-primary-600 text-white'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              )}
            >
              <Icon size={20} />
              {!collapsed && <span>{item.label}</span>}
            </button>
          )
        })}
      </nav>

      {/* Settings */}
      <div className="p-2 border-t border-slate-800">
        <button
          onClick={() => onViewChange('settings')}
          className={cn(
            'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors',
            activeView === 'settings'
              ? 'bg-primary-600 text-white'
              : 'text-slate-400 hover:bg-slate-800 hover:text-white'
          )}
        >
          <Settings size={20} />
          {!collapsed && <span>设置</span>}
        </button>
      </div>
    </aside>
  )
}
