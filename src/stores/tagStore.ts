import { create } from 'zustand'
import { invoke } from '@tauri-apps/api/core'
import type { Tag, CreateTagDTO } from '../types'

interface TagState {
  tags: Tag[]
  isLoading: boolean
  error: string | null

  fetchTags: () => Promise<void>
  createTag: (data: CreateTagDTO) => Promise<Tag>
  deleteTag: (id: string) => Promise<void>
  clearError: () => void
}

export const useTagStore = create<TagState>((set) => ({
  tags: [],
  isLoading: false,
  error: null,

  fetchTags: async () => {
    set({ isLoading: true, error: null })
    try {
      const tags = await invoke<Tag[]>('get_tags')
      set({ tags, isLoading: false })
    } catch (error) {
      set({ error: String(error), isLoading: false })
    }
  },

  createTag: async (data: CreateTagDTO) => {
    set({ isLoading: true, error: null })
    try {
      const newTag = await invoke<Tag>('create_tag', { data })
      set((state) => ({
        tags: [...state.tags, newTag].sort((a, b) => a.name.localeCompare(b.name)),
        isLoading: false,
      }))
      return newTag
    } catch (error) {
      set({ error: String(error), isLoading: false })
      throw error
    }
  },

  deleteTag: async (id: string) => {
    try {
      await invoke('delete_tag', { id })
      set((state) => ({
        tags: state.tags.filter((tag) => tag.id !== id),
      }))
    } catch (error) {
      set({ error: String(error) })
      throw error
    }
  },

  clearError: () => {
    set({ error: null })
  },
}))
