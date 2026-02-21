import { create } from 'zustand'
import { invoke } from '@tauri-apps/api/core'
import type { Idea, IdeaFilters, CreateIdeaDTO, UpdateIdeaDTO } from '../types'

interface IdeaState {
  // 数据
  ideas: Idea[]
  currentIdea: Idea | null
  isLoading: boolean
  error: string | null

  // 过滤器
  filters: IdeaFilters

  // Actions
  fetchIdeas: () => Promise<void>
  getIdea: (id: string) => Promise<Idea | null>
  createIdea: (data: CreateIdeaDTO) => Promise<Idea>
  updateIdea: (id: string, data: UpdateIdeaDTO) => Promise<void>
  deleteIdea: (id: string) => Promise<void>
  setCurrentIdea: (idea: Idea | null) => void
  setFilters: (filters: Partial<IdeaFilters>) => void
  clearError: () => void
}

export const useIdeaStore = create<IdeaState>((set, get) => ({
  // 初始状态
  ideas: [],
  currentIdea: null,
  isLoading: false,
  error: null,
  filters: {
    status: 'all',
    tagIds: [],
    search: '',
  },

  // 获取想法列表
  fetchIdeas: async () => {
    set({ isLoading: true, error: null })
    try {
      const ideas = await invoke<Idea[]>('get_ideas', { filters: get().filters })
      set({ ideas, isLoading: false })
    } catch (error) {
      set({ error: String(error), isLoading: false })
    }
  },

  // 获取单个想法
  getIdea: async (id: string) => {
    try {
      const idea = await invoke<Idea>('get_idea', { id })
      set({ currentIdea: idea })
      return idea
    } catch (error) {
      set({ error: String(error) })
      return null
    }
  },

  // 创建想法
  createIdea: async (data: CreateIdeaDTO) => {
    set({ isLoading: true, error: null })
    try {
      const newIdea = await invoke<Idea>('create_idea', { data })
      set((state) => ({
        ideas: [newIdea, ...state.ideas],
        currentIdea: newIdea,
        isLoading: false,
      }))
      return newIdea
    } catch (error) {
      set({ error: String(error), isLoading: false })
      throw error
    }
  },

  // 更新想法
  updateIdea: async (id: string, data: UpdateIdeaDTO) => {
    try {
      await invoke('update_idea', { id, data })
      set((state) => ({
        ideas: state.ideas.map((idea) =>
          idea.id === id ? { ...idea, ...data, updatedAt: new Date().toISOString() } : idea
        ),
        currentIdea:
          state.currentIdea?.id === id
            ? { ...state.currentIdea, ...data, updatedAt: new Date().toISOString() }
            : state.currentIdea,
      }))
    } catch (error) {
      set({ error: String(error) })
      throw error
    }
  },

  // 删除想法
  deleteIdea: async (id: string) => {
    try {
      await invoke('delete_idea', { id })
      set((state) => ({
        ideas: state.ideas.filter((idea) => idea.id !== id),
        currentIdea: state.currentIdea?.id === id ? null : state.currentIdea,
      }))
    } catch (error) {
      set({ error: String(error) })
      throw error
    }
  },

  // 设置当前想法
  setCurrentIdea: (idea: Idea | null) => {
    set({ currentIdea: idea })
  },

  // 设置过滤器
  setFilters: (filters: Partial<IdeaFilters>) => {
    set((state) => ({
      filters: { ...state.filters, ...filters },
    }))
  },

  // 清除错误
  clearError: () => {
    set({ error: null })
  },
}))
