import { format } from 'date-fns'
import { FileEdit, Trash2 } from 'lucide-react'
import { cn } from '../../utils/cn'
import type { Idea, IdeaStatus } from '../../types'

interface IdeaCardProps {
  idea: Idea
  isSelected: boolean
  onSelect: () => void
  onEdit: () => void
  onDelete: () => void
}

const statusConfig: Record<IdeaStatus, { label: string; color: string }> = {
  draft: { label: '草稿', color: 'bg-slate-500' },
  writing: { label: '写作中', color: 'bg-amber-500' },
  review: { label: '待发布', color: 'bg-blue-500' },
  published: { label: '已发布', color: 'bg-green-500' },
}

export function IdeaCard({ idea, isSelected, onSelect, onEdit, onDelete }: IdeaCardProps) {
  const status = statusConfig[idea.status]

  return (
    <div
      onClick={onSelect}
      className={cn(
        'p-4 rounded-lg border cursor-pointer transition-all',
        isSelected
          ? 'bg-slate-800 border-primary-500'
          : 'bg-slate-900 border-slate-800 hover:border-slate-700'
      )}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-2 mb-2">
        <h3 className="font-medium text-white line-clamp-2">{idea.title}</h3>
        <div className="flex items-center gap-1">
          <span
            className={cn(
              'px-2 py-0.5 rounded text-xs font-medium text-white',
              status.color
            )}
          >
            {status.label}
          </span>
        </div>
      </div>

      {/* Content preview */}
      {idea.content && (
        <p className="text-sm text-slate-400 line-clamp-2 mb-3">{idea.content}</p>
      )}

      {/* Tags */}
      {idea.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-3">
          {idea.tags.map((tag) => (
            <span
              key={tag.id}
              className="px-2 py-0.5 rounded text-xs"
              style={{ backgroundColor: tag.color + '20', color: tag.color }}
            >
              {tag.name}
            </span>
          ))}
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between">
        <span className="text-xs text-slate-500">
          {format(new Date(idea.updatedAt), 'MM/dd HH:mm')}
        </span>
        <div className="flex items-center gap-1">
          <button
            onClick={(e) => {
              e.stopPropagation()
              onEdit()
            }}
            className="p-1.5 rounded hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
          >
            <FileEdit size={16} />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation()
              onDelete()
            }}
            className="p-1.5 rounded hover:bg-red-900/50 text-slate-400 hover:text-red-400 transition-colors"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>
    </div>
  )
}
