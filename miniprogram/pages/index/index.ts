import { getTotalCount, modules } from '../../data/bank'

const weekdayLabels = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']

function getGreeting(): string {
  const hour = new Date().getHours()
  if (hour < 6) return '夜深了，还在坚持'
  if (hour < 12) return '早上好，开始今天的积累'
  if (hour < 14) return '中午好，复习一小会儿'
  if (hour < 18) return '下午好，把考点过一遍'
  return '晚上好，睡前再背几道'
}

function formatToday(): string {
  const now = new Date()
  return `${now.getMonth() + 1}月${now.getDate()}日 ${weekdayLabels[now.getDay()]}`
}

Component({
  data: {
    greeting: getGreeting(),
    today: formatToday(),
    modules,
    totalCount: getTotalCount(),
  },
  methods: {
    onTapModule(e: WechatMiniprogram.TouchEvent) {
      const { id, title } = e.currentTarget.dataset as { id: string; title: string }
      wx.vibrateShort({ type: 'light' })
      wx.navigateTo({
        url: `/pages/category/category?id=${id}&title=${encodeURIComponent(title)}`,
      })
    },
  },
})
