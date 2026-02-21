import { useState } from 'react'
import { Sidebar } from './components/layout/Sidebar'
import { Header } from './components/layout/Header'
import { IdeaList } from './components/ideas/IdeaList'
import { AIPanel, AISettings } from './components/ai'
import { RichTextEditor } from './components/editor'
import { PublishPanel } from './components/publisher'
import { useIdeaStore } from './stores/ideaStore'

type ViewType = 'ideas' | 'editor' | 'ai' | 'publish' | 'settings'

const viewTitles: Record<ViewType, string> = {
  ideas: '想法收集箱',
  editor: '内容编辑器',
  ai: 'AI 助手',
  publish: '发布中心',
  settings: '设置',
}

function App() {
  const [activeView, setActiveView] = useState<ViewType>('ideas')
  const { setFilters, getIdea } = useIdeaStore()
  const [editorContent, setEditorContent] = useState<string>('')

  const handleSearch = (query: string) => {
    setFilters({ search: query })
  }

  const handleEditIdea = async (ideaId: string) => {
    await getIdea(ideaId)
    setActiveView('editor')
  }

  const handleAIContentReady = (content: string) => {
    setEditorContent(content)
    setActiveView('editor')
  }

  const renderContent = () => {
    switch (activeView) {
      case 'ideas':
        return <IdeaList onEditIdea={handleEditIdea} />
      case 'editor':
        return (
          <div className="h-full">
            <RichTextEditor
              content={editorContent}
              onChange={setEditorContent}
              placeholder="开始编辑你的内容..."
            />
          </div>
        )
      case 'ai':
        return <AIPanel onContentReady={handleAIContentReady} />
      case 'publish':
        return (
          <PublishPanel content={editorContent} />
        )
      case 'settings':
        return (
          <div className="max-w-2xl mx-auto">
            <AISettings />
          </div>
        )
      default:
        return null
    }
  }

  return (
    <div className="flex h-screen bg-slate-950">
      {/* Sidebar */}
      <Sidebar
        activeView={activeView}
        onViewChange={(view) => setActiveView(view as ViewType)}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header
          title={viewTitles[activeView]}
          onSearch={activeView === 'ideas' ? handleSearch : undefined}
        />
        <main className="flex-1 overflow-auto p-6">
          {renderContent()}
        </main>
      </div>
    </div>
  )
}

export default App
