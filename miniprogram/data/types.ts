export interface InlineSpan {
  t: 'text' | 'code'
  v: string
}

export interface ContentBlock {
  type: 'p' | 'code' | 'li'
  inlines?: InlineSpan[]
  text?: string
}

export interface Question {
  id: string
  module: string
  title: string
  level: 'core' | 'extra'
  parentId?: string
  summary: string
  blocks: ContentBlock[]
}

export interface ModuleItem {
  id: string
  title: string
  subtitle: string
  icon: string
  theme: string
  count: number
  countText: string
  comingSoon?: boolean
}
