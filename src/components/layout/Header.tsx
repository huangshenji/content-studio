import { Search, Bell } from 'lucide-react'
import { cn } from '../../utils/cn'

interface HeaderProps {
  title: string
  onSearch?: (query: string) => void
}

export function Header({ title, onSearch }: HeaderProps) {
  return (
    <header className="h-14 bg-slate-900 border-b border-slate-800 flex items-center justify-between px-6">
      <h1 className="text-lg font-semibold text-white">{title}</h1>

      <div className="flex items-center gap-4">
        {/* Search */}
        {onSearch && (
          <div className="relative">
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              type="text"
              placeholder="搜索..."
              onChange={(e) => onSearch(e.target.value)}
              className={cn(
                'w-64 pl-10 pr-4 py-2 rounded-lg',
                'bg-slate-800 border border-slate-700',
                'text-sm text-white placeholder-slate-400',
                'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent',
                'transition-all'
              )}
            />
          </div>
        )}

        {/* Notifications */}
        <button className="p-2 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors">
          <Bell size={20} />
        </button>
      </div>
    </header>
  )
}
