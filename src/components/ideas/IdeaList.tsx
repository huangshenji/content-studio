import { useEffect, useState } from 'react'
import { Plus } from 'lucide-react'
import { useIdeaStore } from '../../stores/ideaStore'
import { IdeaCard } from './IdeaCard'
import { IdeaForm } from './IdeaForm'
import { cn } from '../../utils/cn'
import type { IdeaStatus } from '../../types'

interface IdeaListProps {
  onEditIdea: (ideaId: string) => void
}

const statusFilters: { value: IdeaStatus | 'all'; label: string }[] = [
  { value: 'all', label: '全部' },
  { value: 'draft', label: '草稿' },
  { value: 'writing', label: '写作中' },
  { value: 'review', label: '待发布' },
  { value: 'published', label: '已发布' },
]

export function IdeaList({ onEditIdea }: IdeaListProps) {
  const { ideas, currentIdea, filters, isLoading, fetchIdeas, setCurrentIdea, setFilters, deleteIdea } = useIdeaStore()
  const [showForm, setShowForm] = useState(false)

  useEffect(() => {
    fetchIdeas()
  }, [filters, fetchIdeas])

  const handleDelete = async (id: string) => {
    if (confirm('确定要删除这个想法吗？')) {
      await deleteIdea(id)
    }
  }

  return (
    <div className="h-full flex flex-col">
      {/* Toolbar */}
      <div className="flex items-center justify-between gap-4 mb-4">
        <div className="flex items-center gap-2">
          {statusFilters.map((status) => (
            <button
              key={status.value}
              onClick={() => setFilters({ status: status.value })}
              className={cn(
                'px-3 py-1.5 rounded-lg text-sm transition-colors',
                filters.status === status.value
                  ? 'bg-primary-600 text-white'
                  : 'bg-slate-800 text-slate-400 hover:text-white'
              )}
            >
              {status.label}
            </button>
          ))}
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary-600 hover:bg-primary-500 text-white transition-colors"
        >
          <Plus size={18} />
          <span>新想法</span>
        </button>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="flex items-center justify-center h-40">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500" />
          </div>
        ) : ideas.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-40 text-slate-400">
            <p>暂无想法</p>
            <button
              onClick={() => setShowForm(true)}
              className="mt-2 text-primary-500 hover:underline"
            >
              创建第一个想法
            </button>
          </div>
        ) : (
          <div className="grid gap-3">
            {ideas.map((idea) => (
              <IdeaCard
                key={idea.id}
                idea={idea}
                isSelected={currentIdea?.id === idea.id}
                onSelect={() => setCurrentIdea(idea)}
                onEdit={() => onEditIdea(idea.id)}
                onDelete={() => handleDelete(idea.id)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Form Modal */}
      {showForm && (
        <IdeaForm onClose={() => setShowForm(false)} />
      )}
    </div>
  )
}
