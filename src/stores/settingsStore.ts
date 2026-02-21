import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Settings, AIProvider } from '../types'
import { defaultSettings } from '../types'

interface SettingsState extends Settings {
  // Actions
  setAIProvider: (provider: AIProvider) => void
  setGLMApiKey: (key: string | null) => void
  setDeepSeekApiKey: (key: string | null) => void
  setAIModel: (model: string) => void
  setAutoSaveInterval: (interval: number) => void
  setFontSize: (size: number) => void
  setTheme: (theme: 'light' | 'dark' | 'system') => void
  resetSettings: () => void
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      ...defaultSettings,

      setAIProvider: (provider: AIProvider) => {
        set((state) => ({
          ai: { ...state.ai, provider },
        }))
      },

      setGLMApiKey: (key: string | null) => {
        set((state) => ({
          ai: { ...state.ai, glmApiKey: key },
        }))
      },

      setDeepSeekApiKey: (key: string | null) => {
        set((state) => ({
          ai: { ...state.ai, deepseekApiKey: key },
        }))
      },

      setAIModel: (model: string) => {
        set((state) => ({
          ai: { ...state.ai, model },
        }))
      },

      setAutoSaveInterval: (interval: number) => {
        set((state) => ({
          editor: { ...state.editor, autoSaveInterval: interval },
        }))
      },

      setFontSize: (size: number) => {
        set((state) => ({
          editor: { ...state.editor, fontSize: size },
        }))
      },

      setTheme: (theme: 'light' | 'dark' | 'system') => {
        set({ theme })
      },

      resetSettings: () => {
        set(defaultSettings)
      },
    }),
    {
      name: 'content-studio-settings',
    }
  )
)
