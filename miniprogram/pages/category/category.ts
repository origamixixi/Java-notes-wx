import { getModule, getQuestions } from '../../data/bank'
import { Question } from '../../data/types'
import { countRead, getReadIds } from '../../utils/progress'

interface QuestionView {
  id: string
  title: string
  summary: string
  levelText: string
  read: boolean
}

function toView(item: Question, readSet: Record<string, boolean>): QuestionView {
  return {
    id: item.id,
    title: item.title,
    summary: item.summary,
    levelText: item.level === 'core' ? '核心' : '拓展',
    read: !!readSet[item.id],
  }
}

Page({
  data: {
    id: '',
    title: '知识模块',
    empty: false,
    readCount: 0,
    totalCount: 0,
    progressPercent: 0,
    coreQuestions: [] as QuestionView[],
    extraQuestions: [] as QuestionView[],
  },
  onLoad(query: Record<string, string | undefined>) {
    const id = query.id || ''
    const fallbackTitle = decodeURIComponent(query.title || '知识模块')
    const moduleItem = getModule(id)
    this.setData({
      id,
      title: moduleItem ? moduleItem.title : fallbackTitle,
    })
    this.refreshList()
  },
  onShow() {
    if (this.data.id) {
      this.refreshList()
    }
  },
  refreshList() {
    const moduleId = this.data.id
    const questions = getQuestions(moduleId)
    const readSet: Record<string, boolean> = {}
    getReadIds().forEach((item) => {
      readSet[item] = true
    })

    const coreQuestions = questions.filter((item) => item.level === 'core').map((item) => toView(item, readSet))
    const extraQuestions = questions.filter((item) => item.level === 'extra').map((item) => toView(item, readSet))

    const totalCount = questions.length
    const readCount = countRead(questions.map((item) => item.id))
    this.setData({
      empty: totalCount === 0,
      totalCount,
      readCount,
      progressPercent: totalCount ? Math.round((readCount * 100) / totalCount) : 0,
      coreQuestions,
      extraQuestions,
    })
  },
  onTapQuestion(e: WechatMiniprogram.TouchEvent) {
    const questionId = e.currentTarget.dataset.id as string
    wx.navigateTo({
      url: `/pages/question/question?module=${this.data.id}&id=${encodeURIComponent(questionId)}`,
    })
  },
  onBackHome() {
    wx.navigateBack({ delta: 1 })
  },
})
