import { useState } from 'react'
import { Copy, Check, ExternalLink, Smartphone, Monitor } from 'lucide-react'
import { invoke } from '@tauri-apps/api/core'
import { cn } from '../../utils/cn'
import type { Platform } from '../../types'

interface PublishPanelProps {
  content: string
}

const platforms: {
  value: Platform
  label: string
  icon: string
  tips: string[]
}[] = [
  {
    value: 'wechat',
    label: '微信公众号',
    icon: '📱',
    tips: [
      '建议在电脑端打开公众号后台',
      '使用富文本粘贴效果最佳',
      '注意检查图片是否正常显示',
    ],
  },
  {
    value: 'xiaohongshu',
    label: '小红书',
    icon: '📕',
    tips: [
      '标题控制在20字以内',
      '适当使用emoji增加亲和力',
      '配图要吸引眼球',
    ],
  },
  {
    value: 'zhihu',
    label: '知乎',
    icon: '💡',
    tips: [
      '回答问题时先理解问题本质',
      '内容要有干货和深度',
      '适当引用数据增加可信度',
    ],
  },
]

export function PublishPanel({ content }: PublishPanelProps) {
  const [selectedPlatform, setSelectedPlatform] = useState<Platform>('wechat')
  const [copySuccess, setCopySuccess] = useState(false)
  const [previewMode, setPreviewMode] = useState<'desktop' | 'mobile'>('desktop')

  const handleCopyRichText = async () => {
    try {
      await invoke('copy_rich_text', { html: content })
      setCopySuccess(true)
      setTimeout(() => setCopySuccess(false), 2000)
    } catch (error) {
      console.error('Failed to copy:', error)
      // Fallback to plain text
      await handleCopyPlainText()
    }
  }

  const handleCopyPlainText = async () => {
    try {
      // Convert HTML to plain text
      const tempDiv = document.createElement('div')
      tempDiv.innerHTML = content
      const plainText = tempDiv.textContent || tempDiv.innerText || ''
      await invoke('copy_text', { text: plainText })
      setCopySuccess(true)
      setTimeout(() => setCopySuccess(false), 2000)
    } catch (error) {
      console.error('Failed to copy plain text:', error)
    }
  }

  const platform = platforms.find((p) => p.value === selectedPlatform)!

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-white mb-1">发布中心</h3>
        <p className="text-sm text-slate-400">
          选择目标平台，复制内容后粘贴到对应平台
        </p>
      </div>

      {/* Platform Selector */}
      <div className="flex gap-2 mb-6">
        {platforms.map((p) => (
          <button
            key={p.value}
            onClick={() => setSelectedPlatform(p.value)}
            className={cn(
              'flex-1 p-3 rounded-lg border text-center transition-colors',
              selectedPlatform === p.value
                ? 'bg-primary-900/30 border-primary-500'
                : 'bg-slate-900 border-slate-800 hover:border-slate-700'
            )}
          >
            <span className="text-2xl mb-1 block">{p.icon}</span>
            <span className="text-sm text-white">{p.label}</span>
          </button>
        ))}
      </div>

      {/* Preview Section */}
      <div className="flex-1 flex flex-col min-h-0">
        {/* Preview Controls */}
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm text-slate-400">内容预览</span>
          <div className="flex items-center gap-1 bg-slate-800 rounded-lg p-1">
            <button
              onClick={() => setPreviewMode('desktop')}
              className={cn(
                'p-1.5 rounded transition-colors',
                previewMode === 'desktop'
                  ? 'bg-slate-700 text-white'
                  : 'text-slate-400 hover:text-white'
              )}
              title="桌面预览"
            >
              <Monitor size={16} />
            </button>
            <button
              onClick={() => setPreviewMode('mobile')}
              className={cn(
                'p-1.5 rounded transition-colors',
                previewMode === 'mobile'
                  ? 'bg-slate-700 text-white'
                  : 'text-slate-400 hover:text-white'
              )}
              title="移动端预览"
            >
              <Smartphone size={16} />
            </button>
          </div>
        </div>

        {/* Preview */}
        <div
          className={cn(
            'flex-1 bg-white rounded-lg overflow-auto',
            previewMode === 'mobile' ? 'max-w-sm mx-auto' : ''
          )}
        >
          <div
            className={cn(
              'prose prose-slate max-w-none p-4',
              previewMode === 'mobile' ? 'text-sm' : ''
            )}
            dangerouslySetInnerHTML={{ __html: content }}
          />
        </div>
      </div>

      {/* Tips */}
      <div className="mt-4 p-3 bg-slate-900 rounded-lg border border-slate-800">
        <h4 className="text-sm font-medium text-white mb-2">
          {platform.label} 发布技巧
        </h4>
        <ul className="space-y-1">
          {platform.tips.map((tip, i) => (
            <li key={i} className="text-sm text-slate-400 flex items-start gap-2">
              <span className="text-primary-500">•</span>
              {tip}
            </li>
          ))}
        </ul>
      </div>

      {/* Actions */}
      <div className="mt-4 flex gap-3">
        <button
          onClick={handleCopyRichText}
          className={cn(
            'flex-1 py-3 rounded-lg flex items-center justify-center gap-2 transition-colors',
            copySuccess
              ? 'bg-green-600 text-white'
              : 'bg-primary-600 hover:bg-primary-500 text-white'
          )}
        >
          {copySuccess ? (
            <>
              <Check size={18} />
              <span>已复制</span>
            </>
          ) : (
            <>
              <Copy size={18} />
              <span>复制富文本</span>
            </>
          )}
        </button>
        <button
          onClick={handleCopyPlainText}
          className="px-4 py-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-white transition-colors"
        >
          纯文本
        </button>
      </div>

      {/* Platform Links */}
      <div className="mt-3 flex justify-center">
        <a
          href={
            selectedPlatform === 'wechat'
              ? 'https://mp.weixin.qq.com'
              : selectedPlatform === 'xiaohongshu'
              ? 'https://www.xiaohongshu.com/explore'
              : 'https://www.zhihu.com'
          }
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1 text-sm text-primary-400 hover:text-primary-300"
        >
          <ExternalLink size={14} />
          <span>前往{platform.label}</span>
        </a>
      </div>
    </div>
  )
}
