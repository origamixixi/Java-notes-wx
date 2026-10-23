import { getQuestion, getQuestions } from '../../data/bank'
import { ContentBlock } from '../../data/types'
import { markRead } from '../../utils/progress'

interface RelatedItem {
  id: string
  title: string
}

Page({
  data: {
    moduleId: '',
    questionId: '',
    title: '面试题',
    levelText: '',
    isExtra: false,
    parentTitle: '',
    parentId: '',
    blocks: [] as ContentBlock[],
    related: [] as RelatedItem[],
    prevId: '',
    nextId: '',
    hasPrev: false,
    hasNext: false,
    scrollTop: 0,
    showAnswer: false,
  },
  onLoad(query: Record<string, string | undefined>) {
    const moduleId = query.module || ''
    const questionId = decodeURIComponent(query.id || '')
    this.openQuestion(moduleId, questionId)
  },
  openQuestion(moduleId: string, questionId: string) {
    const questions = getQuestions(moduleId)
    const index = questions.findIndex((item) => item.id === questionId)
    const question = index >= 0 ? questions[index] : getQuestion(moduleId, questionId)
    if (!question) {
      wx.showToast({ title: '题目不存在', icon: 'none' })
      return
    }

    const parent = question.parentId ? getQuestion(moduleId, question.parentId) : undefined
    const related = questions
      .filter((item) => item.parentId === question.id)
      .map((item) => ({ id: item.id, title: item.title }))
    const prev = index > 0 ? questions[index - 1] : undefined
    const next = index >= 0 && index < questions.length - 1 ? questions[index + 1] : undefined

    this.setData({
      moduleId,
      questionId: question.id,
      title: question.title,
      levelText: question.level === 'core' ? '核心' : '拓展',
      isExtra: question.level === 'extra',
      parentTitle: parent ? parent.title : '',
      parentId: parent ? parent.id : '',
      blocks: question.blocks,
      related,
      prevId: prev ? prev.id : '',
      nextId: next ? next.id : '',
      hasPrev: !!prev,
      hasNext: !!next,
      showAnswer: false,
      scrollTop: this.data.scrollTop === 0 ? 0.01 : 0,
    })
  },
  onRevealAnswer() {
    markRead(this.data.questionId)
    this.setData({ showAnswer: true })
  },
  onHideAnswer() {
    this.setData({
      showAnswer: false,
      scrollTop: this.data.scrollTop === 0 ? 0.01 : 0,
    })
  },
  openQuestionPage(questionId: string) {
    wx.navigateTo({
      url: `/pages/question/question?module=${this.data.moduleId}&id=${encodeURIComponent(questionId)}`,
      fail: () => {
        this.openQuestion(this.data.moduleId, questionId)
      },
    })
  },
  onTapRelated(e: WechatMiniprogram.TouchEvent) {
    const id = e.currentTarget.dataset.id as string
    this.openQuestionPage(id)
  },
  onTapParent() {
    if (!this.data.parentId) {
      return
    }
    const pages = getCurrentPages()
    const prev = pages[pages.length - 2] as { route?: string; data?: { questionId?: string } } | undefined
    if (prev && prev.route === 'pages/question/question' && prev.data && prev.data.questionId === this.data.parentId) {
      wx.navigateBack({ delta: 1 })
      return
    }
    this.openQuestionPage(this.data.parentId)
  },
  onTapPrev() {
    if (this.data.prevId) {
      this.openQuestion(this.data.moduleId, this.data.prevId)
    }
  },
  onTapNext() {
    if (this.data.nextId) {
      this.openQuestion(this.data.moduleId, this.data.nextId)
    }
  },
})
