import { useState, useEffect } from 'react'
import { Sparkles, FileText, Wand2, Loader2, AlertCircle } from 'lucide-react'
import { useAIStore } from '../../stores/aiStore'
import { useIdeaStore } from '../../stores/ideaStore'
import { cn } from '../../utils/cn'
import type { Platform } from '../../types'

const platforms: { value: Platform; label: string }[] = [
  { value: 'wechat', label: '微信公众号' },
  { value: 'xiaohongshu', label: '小红书' },
  { value: 'zhihu', label: '知乎' },
]

interface AIPanelProps {
  onContentReady?: (content: string) => void
}

export function AIPanel({ onContentReady }: AIPanelProps) {
  const { currentIdea } = useIdeaStore()
  const {
    isGenerating,
    error,
    outline,
    expandedContent,
    adaptedContent,
    generateOutline,
    expandContent,
    adaptForPlatform,
    clearError,
    clearResults,
  } = useAIStore()

  const [selectedPlatform, setSelectedPlatform] = useState<Platform>('wechat')
  const [step, setStep] = useState<'outline' | 'expand' | 'adapt'>('outline')

  useEffect(() => {
    clearResults()
    setStep('outline')
  }, [currentIdea?.id, clearResults])

  const handleGenerateOutline = async () => {
    if (!currentIdea) return
    try {
      await generateOutline(currentIdea.title, currentIdea.content || '')
      setStep('expand')
    } catch (e) {
      // error is already set in store
    }
  }

  const handleExpandContent = async () => {
    if (!outline) return
    try {
      await expandContent(JSON.stringify(outline))
      setStep('adapt')
    } catch (e) {
      // error is already set in store
    }
  }

  const handleAdaptPlatform = async () => {
    if (!expandedContent) return
    try {
      const adapted = await adaptForPlatform(expandedContent, selectedPlatform)
      onContentReady?.(adapted)
    } catch (e) {
      // error is already set in store
    }
  }

  if (!currentIdea) {
    return (
      <div className="h-full flex items-center justify-center text-slate-400">
        <div className="text-center">
          <Sparkles size={48} className="mx-auto mb-4 opacity-50" />
          <p>请先在想法列表中选择一个想法</p>
          <p className="text-sm mt-1">AI 将帮助你生成大纲和内容</p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-white mb-1">
          AI 内容生成
        </h3>
        <p className="text-sm text-slate-400">
          基于想法「{currentIdea.title}」生成内容
        </p>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="mb-4 p-3 rounded-lg bg-red-900/30 border border-red-800 flex items-start gap-2">
          <AlertCircle size={18} className="text-red-400 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm text-red-300">{error}</p>
            <button
              onClick={clearError}
              className="text-xs text-red-400 hover:text-red-300 mt-1"
            >
              关闭
            </button>
          </div>
        </div>
      )}

      {/* Steps */}
      <div className="flex-1 overflow-y-auto space-y-4">
        {/* Step 1: Generate Outline */}
        <div className={cn(
          'p-4 rounded-lg border transition-colors',
          step === 'outline' ? 'bg-slate-800 border-primary-500' : 'bg-slate-900 border-slate-800'
        )}>
          <div className="flex items-center gap-2 mb-3">
            <div className={cn(
              'w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium',
              outline ? 'bg-green-600 text-white' : 'bg-primary-600 text-white'
            )}>
              1
            </div>
            <h4 className="font-medium text-white">生成大纲</h4>
          </div>

          {outline ? (
            <div className="space-y-2">
              <p className="text-sm font-medium text-white">{outline.title}</p>
              <ul className="space-y-1">
                {outline.sections?.map((section, i) => (
                  <li key={i} className="text-sm text-slate-400">
                    • {section.heading}
                  </li>
                ))}
              </ul>
              <button
                onClick={handleGenerateOutline}
                disabled={isGenerating}
                className="mt-2 text-sm text-primary-400 hover:text-primary-300"
              >
                重新生成
              </button>
            </div>
          ) : (
            <button
              onClick={handleGenerateOutline}
              disabled={isGenerating}
              className={cn(
                'w-full py-2.5 rounded-lg flex items-center justify-center gap-2 transition-colors',
                'bg-primary-600 hover:bg-primary-500 text-white',
                'disabled:opacity-50 disabled:cursor-not-allowed'
              )}
            >
              {isGenerating ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  <span>生成中...</span>
                </>
              ) : (
                <>
                  <FileText size={18} />
                  <span>生成大纲</span>
                </>
              )}
            </button>
          )}
        </div>

        {/* Step 2: Expand Content */}
        <div className={cn(
          'p-4 rounded-lg border transition-colors',
          step === 'expand' ? 'bg-slate-800 border-primary-500' : 'bg-slate-900 border-slate-800',
          !outline && 'opacity-50'
        )}>
          <div className="flex items-center gap-2 mb-3">
            <div className={cn(
              'w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium',
              expandedContent ? 'bg-green-600 text-white' : outline ? 'bg-primary-600 text-white' : 'bg-slate-700 text-slate-400'
            )}>
              2
            </div>
            <h4 className="font-medium text-white">扩写内容</h4>
          </div>

          {expandedContent ? (
            <div className="space-y-2">
              <p className="text-sm text-slate-400 line-clamp-4">
                {expandedContent.slice(0, 200)}...
              </p>
              <button
                onClick={handleExpandContent}
                disabled={isGenerating || !outline}
                className="text-sm text-primary-400 hover:text-primary-300"
              >
                重新扩写
              </button>
            </div>
          ) : (
            <button
              onClick={handleExpandContent}
              disabled={isGenerating || !outline}
              className={cn(
                'w-full py-2.5 rounded-lg flex items-center justify-center gap-2 transition-colors',
                'bg-primary-600 hover:bg-primary-500 text-white',
                'disabled:opacity-50 disabled:cursor-not-allowed'
              )}
            >
              {isGenerating && step === 'expand' ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  <span>扩写中...</span>
                </>
              ) : (
                <>
                  <Wand2 size={18} />
                  <span>开始扩写</span>
                </>
              )}
            </button>
          )}
        </div>

        {/* Step 3: Platform Adaptation */}
        <div className={cn(
          'p-4 rounded-lg border transition-colors',
          step === 'adapt' ? 'bg-slate-800 border-primary-500' : 'bg-slate-900 border-slate-800',
          !expandedContent && 'opacity-50'
        )}>
          <div className="flex items-center gap-2 mb-3">
            <div className={cn(
              'w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium',
              adaptedContent ? 'bg-green-600 text-white' : expandedContent ? 'bg-primary-600 text-white' : 'bg-slate-700 text-slate-400'
            )}>
              3
            </div>
            <h4 className="font-medium text-white">平台适配</h4>
          </div>

          <div className="space-y-3">
            <div className="flex gap-2">
              {platforms.map((p) => (
                <button
                  key={p.value}
                  onClick={() => setSelectedPlatform(p.value)}
                  disabled={!expandedContent}
                  className={cn(
                    'px-3 py-1.5 rounded-lg text-sm transition-colors',
                    selectedPlatform === p.value
                      ? 'bg-primary-600 text-white'
                      : 'bg-slate-800 text-slate-400 hover:text-white',
                    'disabled:opacity-50 disabled:cursor-not-allowed'
                  )}
                >
                  {p.label}
                </button>
              ))}
            </div>

            {adaptedContent ? (
              <div className="space-y-2">
                <p className="text-sm text-slate-400 line-clamp-4">
                  {adaptedContent.slice(0, 200)}...
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={handleAdaptPlatform}
                    disabled={isGenerating || !expandedContent}
                    className="text-sm text-primary-400 hover:text-primary-300"
                  >
                    重新适配
                  </button>
                  <button
                    onClick={() => onContentReady?.(adaptedContent)}
                    className="text-sm text-green-400 hover:text-green-300"
                  >
                    使用此内容
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={handleAdaptPlatform}
                disabled={isGenerating || !expandedContent}
                className={cn(
                  'w-full py-2.5 rounded-lg flex items-center justify-center gap-2 transition-colors',
                  'bg-primary-600 hover:bg-primary-500 text-white',
                  'disabled:opacity-50 disabled:cursor-not-allowed'
                )}
              >
                {isGenerating && step === 'adapt' ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    <span>适配中...</span>
                  </>
                ) : (
                  <>
                    <Sparkles size={18} />
                    <span>开始适配</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
