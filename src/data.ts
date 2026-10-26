export type Role = 'admin' | 'coach' | 'member' | 'parent'
export type Page = 'overview' | 'training' | 'competition' | 'report' | 'community' | 'messages' | 'settings'
export type Training = { id: number; date: string; title: string; type: string; duration: number; rpe: number; note: string; done: boolean }
export type Bout = { opponent: string; score: string; result: '胜' | '负'; note: string }
export type Competition = { id: number; name: string; date: string; city: string; weapon: string; status: '待核验' | '已核验' | '需补充'; bouts: Bout[] }
export type Post = { id: number; author: string; role: string; date: string; title: string; body: string; replies: { author: string; body: string }[]; status: string }
export type Message = { id: number; title: string; body: string; time: string; read: boolean }
export type Store = { trainings: Training[]; competitions: Competition[]; posts: Post[]; messages: Message[]; goal: number; consent: boolean; comment: string }

export const members = [
  { id: 'm1', name: '林跃', weapon: '重剑', level: '进阶 · U14', initials: 'LY' },
  { id: 'm2', name: '林悦', weapon: '花剑', level: '基础 · U12', initials: 'LY' },
  { id: 'm3', name: '周然', weapon: '佩剑', level: '进阶 · U16', initials: 'ZR' },
]
export const roles: { id: Role; name: string; detail: string }[] = [
  { id: 'admin', name: '运营管理员', detail: '全部管理权限' },
  { id: 'coach', name: '陈教练', detail: '执教与成绩核验' },
  { id: 'member', name: '林跃', detail: '会员视角' },
  { id: 'parent', name: '林家长', detail: '监护人视角' },
]

export const initialStore: Store = {
  goal: 8,
  consent: true,
  comment: '本月步伐节奏更稳定了。接下来重点练习进攻前的距离判断，在对抗中保持耐心。',
  trainings: [
    { id: 1, date: '2026-10-24', title: '步法控制与距离感', type: '专项训练', duration: 75, rpe: 7, note: '后退衔接更稳定，注意最后一步的制动。', done: true },
    { id: 2, date: '2026-10-22', title: '进攻节奏与二次意图', type: '技术训练', duration: 60, rpe: 6, note: '假动作后启动更果断。', done: true },
    { id: 3, date: '2026-10-20', title: '实战对抗 · 15剑', type: '实战训练', duration: 90, rpe: 8, note: '领先时需要继续控制节奏。', done: true },
    { id: 4, date: '2026-10-17', title: '核心力量与灵活性', type: '体能训练', duration: 45, rpe: 5, note: '完成全部训练组。', done: true },
    { id: 5, date: '2026-10-15', title: '防守还击专项', type: '技术训练', duration: 60, rpe: 6, note: '第四防守位置更准确。', done: true },
    { id: 6, date: '2026-10-13', title: '脚步频率与反应', type: '专项训练', duration: 60, rpe: 7, note: '缩短动作准备时间。', done: true },
    { id: 7, date: '2026-10-27', title: '距离判断与主动进攻', type: '教练计划', duration: 75, rpe: 0, note: '热身 15 分钟；距离练习 30 分钟；条件实战 30 分钟。', done: false },
  ],
  competitions: [
    { id: 1, name: '秋季俱乐部交流赛', date: '2026-10-20', city: '上海', weapon: '重剑 · U14 个人', status: '待核验', bouts: [
      { opponent: '样本对手 A', score: '15 : 12', result: '胜', note: '左手 · 正式比赛' },
      { opponent: '样本对手 B', score: '14 : 15', result: '负', note: '决一剑 · 正式比赛' },
    ] },
    { id: 2, name: '夏季城市邀请赛', date: '2026-08-16', city: '杭州', weapon: '重剑 · U14 个人', status: '已核验', bouts: [
      { opponent: '样本对手 C', score: '15 : 9', result: '胜', note: '正式比赛' },
      { opponent: '样本对手 D', score: '15 : 11', result: '胜', note: '正式比赛' },
    ] },
  ],
  posts: [
    { id: 1, author: '陈教练', role: '教练', date: '2026-10-20', title: '训练结束后，你会怎样做复盘？', body: '可以从今天做得好的一点、想改进的一点开始记录。具体描述场景，比只写“发挥不好”更有帮助。', replies: [{ author: '林跃', body: '我会先记下关键比分时的选择，再对照教练的计划。' }], status: '已公开' },
    { id: 2, author: '林家长', role: '监护人', date: '2026-10-18', title: '第一次参加正式比赛需要准备什么？', body: '除了装备检查，赛前作息和到场时间有哪些建议？', replies: [], status: '已公开' },
  ],
  messages: [
    { id: 1, title: '今日训练计划已更新', body: '陈教练为你发布了「距离判断与主动进攻」，请提前 15 分钟到场热身。', time: '今天 09:30', read: false },
    { id: 2, title: '比赛成绩等待核验', body: '你提交的秋季俱乐部交流赛成绩已收到，教练核验后将计入正式统计。', time: '10 月 20 日', read: false },
    { id: 3, title: '十月成长月报已生成', body: '本月已完成 6 次有效训练，查看训练趋势与教练评语。', time: '10 月 18 日', read: true },
  ],
}
