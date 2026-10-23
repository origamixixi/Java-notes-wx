import { ModuleItem, Question } from './types'

const basic: Question[] = require('./basic.js')
const jvm: Question[] = require('./jvm.js')
const thread: Question[] = require('./thread.js')
const spring: Question[] = require('./spring.js')
const springboot: Question[] = require('./springboot.js')
const springcloud: Question[] = require('./springcloud.js')
const mysql: Question[] = require('./mysql.js')
const redis: Question[] = require('./redis.js')
const distributed: Question[] = require('./distributed.js')
const mq: Question[] = require('./mq.js')
const rocketmq: Question[] = require('./rocketmq.js')
const linux: Question[] = require('./linux.js')
const docker: Question[] = require('./docker.js')
const k8s: Question[] = require('./k8s.js')
const algo: Question[] = require('./algo.js')

const questionMap: Record<string, Question[]> = {
  basic,
  jvm,
  thread,
  spring,
  springboot,
  springcloud,
  mysql,
  redis,
  distributed,
  mq,
  rocketmq,
  linux,
  docker,
  k8s,
  algo,
}

function createModule(item: Omit<ModuleItem, 'count' | 'countText'>): ModuleItem {
  const questions = questionMap[item.id] || []
  const count = questions.length
  return {
    ...item,
    count,
    countText: item.comingSoon ? '待更新' : `${count}题`,
  }
}

export const modules: ModuleItem[] = [
  createModule({
    id: 'basic',
    title: '基础篇',
    subtitle: '面向对象 · 集合 · 异常',
    icon: '☕',
    theme: 'basic',
  }),
  createModule({
    id: 'jvm',
    title: 'JVM 篇',
    subtitle: '内存模型 · GC · 类加载',
    icon: '⚙️',
    theme: 'jvm',
  }),
  createModule({
    id: 'thread',
    title: '多线程',
    subtitle: '锁 · 并发 · 线程池',
    icon: '⚡',
    theme: 'thread',
  }),
  createModule({
    id: 'spring',
    title: 'Spring',
    subtitle: 'IOC · AOP · 事务',
    icon: '🍃',
    theme: 'spring',
  }),
  createModule({
    id: 'springboot',
    title: 'SpringBoot',
    subtitle: '自动装配 · 起步依赖',
    icon: '🚀',
    theme: 'boot',
  }),
  createModule({
    id: 'springcloud',
    title: 'SpringCloud',
    subtitle: '微服务 · 网关 · 注册中心',
    icon: '☁️',
    theme: 'cloud',
  }),
  createModule({
    id: 'mysql',
    title: 'MySQL',
    subtitle: '索引 · 事务 · 锁',
    icon: '🐬',
    theme: 'mysql',
  }),
  createModule({
    id: 'redis',
    title: 'Redis',
    subtitle: '缓存 · 持久化 · 高可用',
    icon: '🔴',
    theme: 'redis',
  }),
  createModule({
    id: 'distributed',
    title: '分布式',
    subtitle: '锁 · 一致性 · 限流',
    icon: '🔗',
    theme: 'distributed',
  }),
  createModule({
    id: 'mq',
    title: '消息队列',
    subtitle: '可靠性 · 顺序 · 积压',
    icon: '📨',
    theme: 'mq',
  }),
  createModule({
    id: 'rocketmq',
    title: 'RocketMQ',
    subtitle: '存储 · 事务消息 · 高可用',
    icon: '🔥',
    theme: 'rocket',
  }),
  createModule({
    id: 'linux',
    title: 'Linux',
    subtitle: '命令 · 权限 · 排障',
    icon: '🐧',
    theme: 'linux',
  }),
  createModule({
    id: 'docker',
    title: 'Docker',
    subtitle: '镜像 · 容器 · 网络',
    icon: '🐳',
    theme: 'docker',
  }),
  createModule({
    id: 'k8s',
    title: 'K8s',
    subtitle: 'Pod · 调度 · 发布',
    icon: '☸️',
    theme: 'k8s',
  }),
  createModule({
    id: 'algo',
    title: '算法',
    subtitle: '链表 · 树 · 动态规划',
    icon: '📐',
    theme: 'algo',
  }),
]

export function getModule(id: string): ModuleItem | undefined {
  return modules.find((item) => item.id === id)
}

export function getQuestions(moduleId: string): Question[] {
  return questionMap[moduleId] || []
}

export function getQuestion(moduleId: string, questionId: string): Question | undefined {
  return getQuestions(moduleId).find((item) => item.id === questionId)
}

export function getTotalCount(): number {
  return modules.reduce((sum, item) => sum + item.count, 0)
}
