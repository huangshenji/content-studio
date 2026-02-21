import { useState, useEffect } from 'react'
import { X, Plus, Tag as TagIcon } from 'lucide-react'
import { useIdeaStore } from '../../stores/ideaStore'
import { useTagStore } from '../../stores/tagStore'
import { cn } from '../../utils/cn'

interface IdeaFormProps {
  onClose: () => void
}

export function IdeaForm({ onClose }: IdeaFormProps) {
  const { createIdea, isLoading } = useIdeaStore()
  const { tags, fetchTags, createTag } = useTagStore()
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([])
  const [newTagName, setNewTagName] = useState('')
  const [showTagInput, setShowTagInput] = useState(false)

  useEffect(() => {
    fetchTags()
  }, [fetchTags])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) return

    try {
      await createIdea({
        title: title.trim(),
        content: content.trim() || undefined,
        tagIds: selectedTagIds.length > 0 ? selectedTagIds : undefined,
      })
      onClose()
    } catch (error) {
      console.error('Failed to create idea:', error)
    }
  }

  const toggleTag = (tagId: string) => {
    setSelectedTagIds((prev) =>
      prev.includes(tagId) ? prev.filter((id) => id !== tagId) : [...prev, tagId]
    )
  }

  const handleCreateTag = async () => {
    if (!newTagName.trim()) return
    try {
      const newTag = await createTag({ name: newTagName.trim() })
      setSelectedTagIds((prev) => [...prev, newTag.id])
      setNewTagName('')
      setShowTagInput(false)
    } catch (error) {
      console.error('Failed to create tag:', error)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-slate-900 rounded-xl border border-slate-800 w-full max-w-lg mx-4">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
          <h2 className="text-lg font-semibold text-white">新建想法</h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              标题 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="一句话描述你的想法..."
              autoFocus
              className={cn(
                'w-full px-4 py-3 rounded-lg',
                'bg-slate-800 border border-slate-700',
                'text-white placeholder-slate-500',
                'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent'
              )}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              详细描述（可选）
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="补充更多细节..."
              rows={4}
              className={cn(
                'w-full px-4 py-3 rounded-lg resize-none',
                'bg-slate-800 border border-slate-700',
                'text-white placeholder-slate-500',
                'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent'
              )}
            />
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              标签（可选）
            </label>
            <div className="flex flex-wrap gap-2">
              {tags.map((tag) => (
                <button
                  key={tag.id}
                  type="button"
                  onClick={() => toggleTag(tag.id)}
                  className={cn(
                    'px-3 py-1 rounded-full text-sm transition-colors',
                    selectedTagIds.includes(tag.id)
                      ? 'text-white'
                      : 'bg-slate-800 text-slate-400 hover:text-white'
                  )}
                  style={{
                    backgroundColor: selectedTagIds.includes(tag.id) ? tag.color : undefined,
                  }}
                >
                  {tag.name}
                </button>
              ))}
              {showTagInput ? (
                <div className="flex items-center gap-1">
                  <input
                    type="text"
                    value={newTagName}
                    onChange={(e) => setNewTagName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault()
                        handleCreateTag()
                      } else if (e.key === 'Escape') {
                        setShowTagInput(false)
                        setNewTagName('')
                      }
                    }}
                    placeholder="标签名..."
                    autoFocus
                    className="w-24 px-2 py-1 rounded-lg text-sm bg-slate-800 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                  />
                  <button
                    type="button"
                    onClick={handleCreateTag}
                    className="p-1 rounded hover:bg-slate-700 text-primary-500"
                  >
                    <Plus size={16} />
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setShowTagInput(true)}
                  className="flex items-center gap-1 px-3 py-1 rounded-full text-sm bg-slate-800 text-slate-400 hover:text-white transition-colors"
                >
                  <TagIcon size={14} />
                  <span>新建</span>
                </button>
              )}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              取消
            </button>
            <button
              type="submit"
              disabled={!title.trim() || isLoading}
              className={cn(
                'px-4 py-2 rounded-lg transition-colors',
                'bg-primary-600 hover:bg-primary-500 text-white',
                'disabled:opacity-50 disabled:cursor-not-allowed'
              )}
            >
              {isLoading ? '创建中...' : '创建'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
