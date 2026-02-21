import { useState, useEffect } from 'react'
import { Key, Check, AlertCircle } from 'lucide-react'
import { useAIStore } from '../../stores/aiStore'
import { cn } from '../../utils/cn'
import type { AIProvider } from '../../types'

const providers: { value: AIProvider; label: string; description: string }[] = [
  { value: 'deepseek', label: 'DeepSeek', description: '性价比高，中文能力强' },
  { value: 'glm', label: '智谱 GLM', description: '国产大模型，稳定可靠' },
]

export function AISettings() {
  const { config, fetchConfig, saveConfig, error, clearError } = useAIStore()
  const [localConfig, setLocalConfig] = useState(config)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    fetchConfig()
  }, [fetchConfig])

  useEffect(() => {
    setLocalConfig(config)
  }, [config])

  const handleSave = async () => {
    try {
      await saveConfig(localConfig)
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } catch (e) {
      // error is already set in store
    }
  }

  const hasChanges =
    localConfig.provider !== config.provider ||
    localConfig.glmApiKey !== config.glmApiKey ||
    localConfig.deepseekApiKey !== config.deepseekApiKey ||
    localConfig.model !== config.model

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-white mb-1">AI 服务配置</h3>
        <p className="text-sm text-slate-400">
          配置 AI 服务提供商和 API 密钥
        </p>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="p-3 rounded-lg bg-red-900/30 border border-red-800 flex items-start gap-2">
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

      {/* Provider Selection */}
      <div>
        <label className="block text-sm font-medium text-slate-300 mb-3">
          AI 服务提供商
        </label>
        <div className="grid grid-cols-2 gap-3">
          {providers.map((p) => (
            <button
              key={p.value}
              onClick={() => setLocalConfig({ ...localConfig, provider: p.value })}
              className={cn(
                'p-4 rounded-lg border text-left transition-colors',
                localConfig.provider === p.value
                  ? 'bg-primary-900/30 border-primary-500'
                  : 'bg-slate-900 border-slate-800 hover:border-slate-700'
              )}
            >
              <div className="font-medium text-white">{p.label}</div>
              <div className="text-sm text-slate-400 mt-1">{p.description}</div>
            </button>
          ))}
        </div>
      </div>

      {/* DeepSeek API Key */}
      <div>
        <label className="block text-sm font-medium text-slate-300 mb-2">
          <span className="flex items-center gap-2">
            <Key size={16} />
            DeepSeek API Key
          </span>
        </label>
        <input
          type="password"
          value={localConfig.deepseekApiKey || ''}
          onChange={(e) =>
            setLocalConfig({ ...localConfig, deepseekApiKey: e.target.value || null })
          }
          placeholder="sk-..."
          className={cn(
            'w-full px-4 py-3 rounded-lg',
            'bg-slate-800 border border-slate-700',
            'text-white placeholder-slate-500',
            'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent'
          )}
        />
        <p className="text-xs text-slate-500 mt-1">
          从 <a href="https://platform.deepseek.com" target="_blank" rel="noopener noreferrer" className="text-primary-400 hover:underline">platform.deepseek.com</a> 获取
        </p>
      </div>

      {/* GLM API Key */}
      <div>
        <label className="block text-sm font-medium text-slate-300 mb-2">
          <span className="flex items-center gap-2">
            <Key size={16} />
            智谱 GLM API Key
          </span>
        </label>
        <input
          type="password"
          value={localConfig.glmApiKey || ''}
          onChange={(e) =>
            setLocalConfig({ ...localConfig, glmApiKey: e.target.value || null })
          }
          placeholder="..."
          className={cn(
            'w-full px-4 py-3 rounded-lg',
            'bg-slate-800 border border-slate-700',
            'text-white placeholder-slate-500',
            'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent'
          )}
        />
        <p className="text-xs text-slate-500 mt-1">
          从 <a href="https://open.bigmodel.cn" target="_blank" rel="noopener noreferrer" className="text-primary-400 hover:underline">open.bigmodel.cn</a> 获取
        </p>
      </div>

      {/* Model Selection */}
      <div>
        <label className="block text-sm font-medium text-slate-300 mb-2">
          模型
        </label>
        <select
          value={localConfig.model}
          onChange={(e) => setLocalConfig({ ...localConfig, model: e.target.value })}
          className={cn(
            'w-full px-4 py-3 rounded-lg',
            'bg-slate-800 border border-slate-700',
            'text-white',
            'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent'
          )}
        >
          <optgroup label="DeepSeek">
            <option value="deepseek-chat">DeepSeek Chat</option>
            <option value="deepseek-coder">DeepSeek Coder</option>
          </optgroup>
          <optgroup label="GLM">
            <option value="glm-4">GLM-4</option>
            <option value="glm-4-flash">GLM-4 Flash</option>
          </optgroup>
        </select>
      </div>

      {/* Save Button */}
      <button
        onClick={handleSave}
        disabled={!hasChanges}
        className={cn(
          'w-full py-3 rounded-lg flex items-center justify-center gap-2 transition-colors',
          hasChanges
            ? 'bg-primary-600 hover:bg-primary-500 text-white'
            : 'bg-slate-800 text-slate-500 cursor-not-allowed'
        )}
      >
        {saved ? (
          <>
            <Check size={18} />
            <span>已保存</span>
          </>
        ) : (
          <span>保存配置</span>
        )}
      </button>
    </div>
  )
}
