import { create } from 'zustand'
import { invoke } from '@tauri-apps/api/core'
import type { Content, Platform } from '../types'

interface EditorState {
  // 数据
  content: Content | null
  isDirty: boolean
  isSaving: boolean
  lastSavedAt: string | null

  // Actions
  loadContent: (ideaId: string, platform?: Platform) => Promise<void>
  saveContent: (ideaId: string, title: string, body: object, platform?: Platform) => Promise<void>
  setDirty: (dirty: boolean) => void
  clearContent: () => void
}

export const useEditorStore = create<EditorState>((set) => ({
  content: null,
  isDirty: false,
  isSaving: false,
  lastSavedAt: null,

  // 加载内容
  loadContent: async (ideaId: string, platform?: Platform) => {
    try {
      const content = await invoke<Content | null>('get_content', {
        ideaId,
        platform: platform || null,
      })
      set({ content, isDirty: false })
    } catch (error) {
      console.error('Failed to load content:', error)
    }
  },

  // 保存内容
  saveContent: async (ideaId: string, title: string, body: object, platform?: Platform) => {
    set({ isSaving: true })
    try {
      const content = await invoke<Content>('save_content', {
        ideaId,
        title,
        body,
        platform: platform || null,
      })
      set({
        content,
        isDirty: false,
        isSaving: false,
        lastSavedAt: new Date().toISOString(),
      })
    } catch (error) {
      set({ isSaving: false })
      console.error('Failed to save content:', error)
      throw error
    }
  },

  // 设置脏标记
  setDirty: (dirty: boolean) => {
    set({ isDirty: dirty })
  },

  // 清除内容
  clearContent: () => {
    set({ content: null, isDirty: false, lastSavedAt: null })
  },
}))
