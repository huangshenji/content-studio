import { create } from 'zustand'
import { invoke } from '@tauri-apps/api/core'
import type { AIProvider, Outline } from '../types'

interface AIConfig {
  provider: AIProvider
  glmApiKey: string | null
  deepseekApiKey: string | null
  model: string
}

interface AIState {
  config: AIConfig
  isGenerating: boolean
  error: string | null

  // 生成的内容
  outline: Outline | null
  expandedContent: string | null
  adaptedContent: string | null
  imageSuggestions: ImageSuggestion[] | null

  // Actions
  fetchConfig: () => Promise<void>
  saveConfig: (config: Partial<AIConfig>) => Promise<void>
  generateOutline: (title: string, description: string) => Promise<Outline>
  expandContent: (outline: string) => Promise<string>
  adaptForPlatform: (content: string, platform: string) => Promise<string>
  suggestImages: (content: string) => Promise<ImageSuggestion[]>
  clearError: () => void
  clearResults: () => void
}

interface ImageSuggestion {
  position: string
  keyword: string
  description: string
  style: string
}

export const useAIStore = create<AIState>((set, get) => ({
  config: {
    provider: 'deepseek',
    glmApiKey: null,
    deepseekApiKey: null,
    model: 'deepseek-chat',
  },
  isGenerating: false,
  error: null,
  outline: null,
  expandedContent: null,
  adaptedContent: null,
  imageSuggestions: null,

  fetchConfig: async () => {
    try {
      const config = await invoke<AIConfig>('get_ai_config')
      set({ config })
    } catch (error) {
      set({ error: String(error) })
    }
  },

  saveConfig: async (newConfig: Partial<AIConfig>) => {
    const currentConfig = get().config
    const mergedConfig = { ...currentConfig, ...newConfig }

    try {
      await invoke('set_ai_config', { config: mergedConfig })
      set({ config: mergedConfig })
    } catch (error) {
      set({ error: String(error) })
      throw error
    }
  },

  generateOutline: async (title: string, description: string) => {
    set({ isGenerating: true, error: null })
    try {
      const result = await invoke<string>('generate_outline', {
        request: { title, description },
      })

      // 尝试解析 JSON
      const jsonMatch = result.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        const outline = JSON.parse(jsonMatch[0]) as Outline
        set({ outline, isGenerating: false })
        return outline
      }

      throw new Error('无法解析大纲结果')
    } catch (error) {
      set({ error: String(error), isGenerating: false })
      throw error
    }
  },

  expandContent: async (outline: string) => {
    set({ isGenerating: true, error: null })
    try {
      const content = await invoke<string>('expand_content', {
        request: { outline },
      })
      set({ expandedContent: content, isGenerating: false })
      return content
    } catch (error) {
      set({ error: String(error), isGenerating: false })
      throw error
    }
  },

  adaptForPlatform: async (content: string, platform: string) => {
    set({ isGenerating: true, error: null })
    try {
      const adapted = await invoke<string>('adapt_for_platform', {
        request: { content, platform },
      })
      set({ adaptedContent: adapted, isGenerating: false })
      return adapted
    } catch (error) {
      set({ error: String(error), isGenerating: false })
      throw error
    }
  },

  suggestImages: async (content: string) => {
    set({ isGenerating: true, error: null })
    try {
      const result = await invoke<string>('suggest_images', { content })

      // 尝试解析 JSON
      const jsonMatch = result.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0])
        const suggestions = parsed.suggestions as ImageSuggestion[]
        set({ imageSuggestions: suggestions, isGenerating: false })
        return suggestions
      }

      throw new Error('无法解析配图建议')
    } catch (error) {
      set({ error: String(error), isGenerating: false })
      throw error
    }
  },

  clearError: () => set({ error: null }),

  clearResults: () => set({
    outline: null,
    expandedContent: null,
    adaptedContent: null,
    imageSuggestions: null,
  }),
}))
