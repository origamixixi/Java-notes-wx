const READ_KEY = 'read_question_ids'

function loadReadIds(): string[] {
  const stored = wx.getStorageSync(READ_KEY)
  return Array.isArray(stored) ? stored : []
}

export function getReadIds(): string[] {
  return loadReadIds()
}

export function isRead(id: string): boolean {
  return loadReadIds().indexOf(id) !== -1
}

export function markRead(id: string): string[] {
  const ids = loadReadIds()
  if (ids.indexOf(id) === -1) {
    ids.push(id)
    wx.setStorageSync(READ_KEY, ids)
  }
  return ids
}

export function countRead(ids: string[]): number {
  const readSet: Record<string, boolean> = {}
  loadReadIds().forEach((id) => {
    readSet[id] = true
  })
  return ids.reduce((sum, id) => (readSet[id] ? sum + 1 : sum), 0)
}
