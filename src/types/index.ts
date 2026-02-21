// ============================================
// 基础类型定义
// ============================================

// 想法状态
export type IdeaStatus = 'draft' | 'writing' | 'review' | 'published'

// 平台类型
export type Platform = 'wechat' | 'xiaohongshu' | 'zhihu'

// AI服务提供商
export type AIProvider = 'glm' | 'deepseek'

// ============================================
// 实体类型
// ============================================

// 标签
export interface Tag {
  id: string
  name: string
  color: string
  createdAt: string
}

// 想法
export interface Idea {
  id: string
  title: string
  content: string | null
  status: IdeaStatus
  tags: Tag[]
  createdAt: string
  updatedAt: string
}

// 内容
export interface Content {
  id: string
  ideaId: string
  version: number
  title: string
  body: object  // Tiptap JSON
  platform: Platform | null
  createdAt: string
  updatedAt: string
}

// 大纲
export interface Outline {
  title: string
  sections: OutlineSection[]
}

export interface OutlineSection {
  heading: string
  points: string[]
}

// 配图建议
export interface ImageSuggestion {
  keyword: string
  description: string
  prompt: string
}

// ============================================
// DTO类型
// ============================================

// 创建想法
export interface CreateIdeaDTO {
  title: string
  content?: string
  tagIds?: string[]
}

// 更新想法
export interface UpdateIdeaDTO {
  title?: string
  content?: string
  status?: IdeaStatus
  tagIds?: string[]
}

// 想法过滤器
export interface IdeaFilters {
  status?: IdeaStatus | 'all'
  tagIds?: string[]
  search?: string
  limit?: number
  offset?: number
}

// 创建标签
export interface CreateTagDTO {
  name: string
  color?: string
}

// ============================================
// 设置类型
// ============================================

export interface Settings {
  ai: {
    provider: AIProvider
    glmApiKey: string | null
    deepseekApiKey: string | null
    model: string
  }
  editor: {
    autoSaveInterval: number
    fontSize: number
  }
  theme: 'light' | 'dark' | 'system'
}

// 默认设置
export const defaultSettings: Settings = {
  ai: {
    provider: 'deepseek',
    glmApiKey: null,
    deepseekApiKey: null,
    model: 'deepseek-chat',
  },
  editor: {
    autoSaveInterval: 30,
    fontSize: 16,
  },
  theme: 'system',
}
