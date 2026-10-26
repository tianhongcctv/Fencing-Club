import { useEffect, useMemo, useState, type FormEvent, type ReactNode } from 'react'
import { Activity, ArrowRight, BarChart3, Bell, BookOpen, Check, CheckCircle2, ChevronDown, CircleHelp, ClipboardCheck, Download, Flag, LayoutDashboard, LogOut, Menu, MessageCircle, Plus, Send, Settings2, ShieldCheck, Sparkles, Swords, Target, X } from 'lucide-react'
import { initialStore, members, roles, type Page, type Role, type Store } from './data'
import { useEvaluationAuth } from './hooks/useEvaluationAuth'
import type { EvaluationUser } from './lib/evaluation-auth'
import AuthPage from './pages/AuthPage'
import { Onboarding, ProductTour, tourSteps } from './components/FirstRunExperience'

const nav: { id: Page; label: string; en: string; icon: typeof Activity }[] = [
  { id: 'overview', label: '训练总览', en: 'OVERVIEW', icon: LayoutDashboard },
  { id: 'training', label: '训练计划', en: 'TRAINING', icon: ClipboardCheck },
  { id: 'competition', label: '比赛与核验', en: 'COMPETITION', icon: Flag },
  { id: 'report', label: '成长月报', en: 'REPORT', icon: BarChart3 },
  { id: 'community', label: '问答社区', en: 'COMMUNITY', icon: CircleHelp },
  { id: 'messages', label: '站内消息', en: 'INBOX', icon: Bell },
  { id: 'settings', label: '资料与授权', en: 'SETTINGS', icon: Settings2 },
]
const pageCopy: Record<Page, [string, string]> = {
  overview: ['把每一次练习，变成看得见的进步。', '今日状态、训练节奏与下一步安排，都在这里。'],
  training: ['记录有据，成长有迹。', '计划、完成与反思连成一条清晰的训练路径。'],
  competition: ['每一剑，都有回响。', '保存交锋细节，核验后沉淀为正式成绩。'],
  report: ['看见数据背后的成长。', '从训练投入到比赛表现，回顾这个月的进步。'],
  community: ['好问题，让经验流动。', '在俱乐部内交流训练心得，尊重每一种经验。'],
  messages: ['重要的事，不错过。', '训练调整、成绩核验与月报动态集中查看。'],
  settings: ['你的资料，由你掌握。', '管理会员档案、数据导出与隐私授权。'],
}

function useStore(user: EvaluationUser) {
  const storageKey = `defencing-workspace-v1:${user.id}`
  const [store, setStore] = useState<Store>(() => {
    const starter = { ...initialStore, goal: user.preferences.frequency * 4 }
    try {
      const saved = localStorage.getItem(storageKey) || localStorage.getItem('defencing-workspace-v1')
      return saved ? { ...starter, ...JSON.parse(saved) } : starter
    } catch { return starter }
  })
  useEffect(() => { localStorage.setItem(storageKey, JSON.stringify(store)) }, [store, storageKey])
  return [store, setStore] as const
}

function Modal({ title, eyebrow, children, onClose }: { title: string; eyebrow: string; children: ReactNode; onClose: () => void }) {
  useEffect(() => { const fn = (e: KeyboardEvent) => e.key === 'Escape' && onClose(); window.addEventListener('keydown', fn); return () => window.removeEventListener('keydown', fn) }, [onClose])
  return <div className="modal-backdrop" onMouseDown={e => e.target === e.currentTarget && onClose()}><section className="modal" role="dialog" aria-modal="true" aria-label={title}><div className="modal-head"><div><span className="eyebrow">{eyebrow}</span><h2>{title}</h2></div><button className="icon-btn" onClick={onClose} aria-label="关闭"><X size={20}/></button></div>{children}</section></div>
}
function Field({ label, children }: { label: string; children: ReactNode }) { return <label className="field"><span>{label}</span>{children}</label> }
function Empty({ title, text }: { title: string; text: string }) { return <div className="empty"><Swords size={28}/><h3>{title}</h3><p>{text}</p></div> }

function Workspace({ user, onLogout, onTourFinished }: { user: EvaluationUser; onLogout: () => void; onTourFinished: () => void }) {
  const [page, setPage] = useState<Page>('overview')
  const [role, setRole] = useState<Role>(user.role)
  const [member, setMember] = useState('m1')
  const [store, setStore] = useStore(user)
  const [guideStep, setGuideStep] = useState<number | null>(user.tourPending ? 0 : null)
  const [modal, setModal] = useState<string | null>(null)
  const [menu, setMenu] = useState(false)
  const [toast, setToast] = useState('')
  const [source, setSource] = useState('全部来源')
  const [weapon, setWeapon] = useState('全部剑种')
  const current = members.find(m => m.id === member)!
  const canManage = role === 'admin' || role === 'coach'
  const done = store.trainings.filter(t => t.done)
  const minutes = done.reduce((n, t) => n + t.duration, 0)
  const bouts = store.competitions.filter(c => c.status === '已核验' && source !== '训练测试' && (weapon === '全部剑种' || c.weapon.startsWith(weapon))).flatMap(c => c.bouts)
  const wins = bouts.filter(b => b.result === '胜').length
  const unread = store.messages.filter(m => !m.read).length
  const currentRole = roles.find(r => r.id === role)!
  const displayRole = { ...currentRole, name: role === 'admin' || role === 'coach' ? currentRole.name : user.name }
  const nextTraining = store.trainings.find(t => !t.done)
  const notify = (text: string) => { setToast(text); window.setTimeout(() => setToast(''), 2600) }
  const go = (id: Page) => { setPage(id); setMenu(false); window.scrollTo({ top: 0, behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' }) }
  const update = <K extends keyof Store>(key: K, value: Store[K]) => setStore(s => ({ ...s, [key]: value }))
  const formData = (e: FormEvent<HTMLFormElement>) => { e.preventDefault(); return new FormData(e.currentTarget) }
  const exportData = () => {
    const blob = new Blob([JSON.stringify({ member: current, exportedAt: new Date().toISOString(), ...store }, null, 2)], { type: 'application/json' })
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = `${current.name}-会员数据.json`; a.click(); URL.revokeObjectURL(a.href); notify('会员数据已导出')
  }
  const metrics = useMemo(() => store.trainings.filter(t => t.done).slice(-10).map(t => t.duration), [store.trainings])
  const closeGuide = () => { setGuideStep(null); onTourFinished() }
  const nextGuide = () => {
    if (guideStep === null) return
    if (guideStep === tourSteps.length - 1) { closeGuide(); notify('导览完成，开始你的下一次训练吧') }
    else setGuideStep(guideStep + 1)
  }
  useEffect(() => {
    if (guideStep === null) return
    const currentStep = tourSteps[guideStep]
    setPage(currentStep.page)
    setMenu(false)
    const timer = window.setTimeout(() => {
      const target = document.querySelector(currentStep.selector)
      if (!target) return
      target.classList.add('tour-highlight')
      target.scrollIntoView({ block: 'center', behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' })
    }, 100)
    return () => {
      window.clearTimeout(timer)
      document.querySelector(currentStep.selector)?.classList.remove('tour-highlight')
    }
  }, [guideStep])

  return <div className="app-shell">
    <aside className={`sidebar ${menu ? 'open' : ''}`}>
      <button className="brand" onClick={() => go('overview')} aria-label="一剑击首页"><span className="brand-mark"><Swords size={25}/></span><span><strong>一剑击</strong><small>DEFENCING CLUB</small></span></button>
      <div className="workspace-label">CLUB WORKSPACE <span>BETA</span></div>
      <nav className="main-nav" aria-label="主要导航">{nav.map(item => <button key={item.id} className={page === item.id ? 'active' : ''} onClick={() => go(item.id)}><item.icon size={18}/><span>{item.label}</span>{item.id === 'messages' && unread > 0 && <b>{unread}</b>}</button>)}</nav>
      <div className="sidebar-bottom"><div className="season"><span>2026 秋季训练周期</span><strong>第 08 周</strong><div><i/></div><small>保持节奏，专注下一剑</small></div><div className="privacy-note"><ShieldCheck size={15}/><span>内部评估 · 全部人物均为样本</span></div></div>
    </aside>
    {menu && <button className="menu-scrim" onClick={() => setMenu(false)} aria-label="关闭导航"/>}
    <div className="main-column">
      <header className="topbar"><button className="icon-btn mobile-menu" onClick={() => setMenu(true)} aria-label="打开导航"><Menu size={21}/></button><div className="crumb">俱乐部工作台 <span>/</span> {nav.find(n => n.id === page)?.label}</div><div className="top-actions"><button className="icon-btn guide-button" onClick={() => setGuideStep(0)} aria-label="打开新手导览" title="新手导览"><BookOpen size={18}/></button><button className="text-btn feedback" onClick={() => setModal('feedback')}>提交意见 <ArrowRight size={14}/></button><button className="icon-btn notification" onClick={() => go('messages')} aria-label={`消息，${unread}条未读`}><Bell size={19}/>{unread > 0 && <i/>}</button><label className="role-select"><span className="avatar">{displayRole.name.slice(0, 1)}</span><span className="role-name"><strong>{displayRole.name}</strong><small>{currentRole.detail}</small></span><select aria-label="切换体验角色" value={role} onChange={e => setRole(e.target.value as Role)}>{roles.map(r => <option value={r.id} key={r.id}>{r.name} · {r.detail}</option>)}</select><ChevronDown size={14}/></label><button className="icon-btn logout-button" onClick={onLogout} aria-label="退出登录" title="退出登录"><LogOut size={18}/></button></div></header>
      <main>
        <section className="page-heading"><div><span className="eyebrow">EVERY TOUCH COUNTS</span><h1>{nav.find(n => n.id === page)?.label}</h1><p>{pageCopy[page][0]}</p></div><label className="member-select"><span>当前操作对象</span><div><strong>{current.name}</strong><span>{current.weapon} · {current.level}</span><select value={member} onChange={e => setMember(e.target.value)} aria-label="切换会员">{members.map(m => <option key={m.id} value={m.id}>{m.name} · {m.weapon}</option>)}</select><ChevronDown size={15}/></div></label></section>

        {page === 'overview' && <>
          <section className="hero-panel"><div className="hero-copy"><span className="section-tag"><Sparkles size={14}/> 本周训练焦点</span><h2>控制距离，<br/>掌握进攻的主动权。</h2><p>{nextTraining?.note}</p><button className="light-btn" onClick={() => go('training')}>查看训练安排 <ArrowRight size={16}/></button></div><div className="hero-art" aria-hidden="true"><div className="fencing-lines"><i/><i/><i/></div><Swords size={150} strokeWidth={.65}/><span>01<br/>FOOTWORK<br/>02<br/>DISTANCE<br/>03<br/>TEMPO</span></div></section>
          <section className="stat-grid"><article><span>本月有效训练</span><strong>{done.length}<small> 天</small></strong><em>目标 {store.goal} 天 · 已完成 {Math.round(done.length / store.goal * 100)}%</em></article><article><span>累计训练时长</span><strong>{Math.floor(minutes / 60)}<small> 小时 </small>{minutes % 60}<small> 分</small></strong><em>较上月同期 +12%</em></article><article><span>正式交锋胜率</span><strong>{bouts.length ? Math.round(wins / bouts.length * 100) : 0}<small>%</small></strong><em>{wins} 胜 / {bouts.length} 场有效交锋</em></article><article><span>下一场训练</span><strong className="date-stat">27<small> OCT</small></strong><em>{nextTraining?.title || '暂无待完成计划'}</em></article></section>
          <div className="dashboard-grid"><section className="panel rhythm"><div className="panel-head"><div><span className="eyebrow">TRAINING RHYTHM</span><h2>训练节奏</h2></div><button className="text-btn" onClick={() => go('report')}>完整月报 <ArrowRight size={15}/></button></div><div className="chart-wrap"><div className="chart-y"><span>90</span><span>60</span><span>30</span><span>0</span></div><div className="bar-chart">{metrics.map((v, i) => <div key={i}><i style={{ height: `${v}%` }} className={i === 9 ? 'current' : ''}/><span>{i + 1}</span></div>)}</div></div><div className="chart-caption"><span><i/> 每次训练时长（分钟）</span><span>近 10 次训练</span></div></section><section className="panel next-panel"><div className="panel-head"><div><span className="eyebrow">UP NEXT</span><h2>接下来</h2></div></div><div className="next-date"><strong>27</strong><span>十月<br/>星期二</span><em>18:30 — 19:45</em></div><h3>{nextTraining?.title}</h3><p>陈教练 · 重剑训练馆</p><ul><li><Check size={15}/> 动态热身与步伐激活</li><li><Check size={15}/> 距离判断分组练习</li><li><Check size={15}/> 条件实战与复盘</li></ul><button className="primary-btn full" onClick={() => { if (nextTraining) { update('trainings', store.trainings.map(t => t.id === nextTraining.id ? { ...t, done: true } : t)); notify('训练打卡已完成') } }} disabled={!nextTraining}><CheckCircle2 size={17}/>{nextTraining ? '完成训练打卡' : '已完成全部计划'}</button></section></div>
        </>}

        {page === 'training' && <>
          <div className="toolbar"><p>计划修订保留旧版本；补录训练不会产生历史打卡。</p>{canManage && <div><button className="secondary-btn" onClick={() => setModal('record')}><Plus size={16}/> 记录训练</button><button className="primary-btn" onClick={() => setModal('plan')}><Plus size={16}/> 发布计划</button></div>}</div>
          <section className="panel"><div className="panel-head"><div><span className="eyebrow">TRAINING LOG</span><h2>训练记录 <small>{store.trainings.length} 条</small></h2></div><span className="subtle">{done.length} 次已完成</span></div><div className="training-list">{store.trainings.slice().reverse().map(t => <article className={`training-row ${!t.done ? 'planned' : ''}`} key={t.id}><time><strong>{t.date.slice(8)}</strong><span>{t.date.slice(5, 7)} 月</span></time><div className="training-main"><div><span className="pill">{t.type}</span>{!t.done && <span className="pill green">待完成</span>}</div><h3>{t.title}</h3><p>{t.note}</p></div><div className="training-numbers"><span><strong>{t.duration}</strong> 分钟</span><span>RPE <strong>{t.rpe || '—'}</strong></span></div>{!t.done ? <button className="secondary-btn" onClick={() => { update('trainings', store.trainings.map(x => x.id === t.id ? { ...x, done: true, rpe: 7 } : x)); notify('训练打卡已完成') }}>打卡</button> : <span className="done-check"><Check size={17}/></span>}</article>)}</div></section>
        </>}

        {page === 'competition' && <>
          <div className="toolbar"><p>自录成绩保存为草稿，核验通过后进入正式统计。</p><button className="primary-btn" onClick={() => setModal('competition')}><Plus size={16}/> 录入成绩</button></div>
          <div className="competition-list">{store.competitions.map(c => <section className="panel competition" key={c.id}><div className="competition-top"><div><span className="subtle">{c.date} / {c.city}</span><h2>{c.name}</h2><p>{c.weapon} · 15 剑淘汰赛</p></div><span className={`status ${c.status === '已核验' ? 'verified' : ''}`}>{c.status}</span></div><div className="bout-head"><span>交锋明细</span><span>{c.bouts.length} 场 · {c.bouts.filter(b => b.result === '胜').length} 胜</span></div>{c.bouts.map((b, i) => <div className="bout" key={i}><span className={`result ${b.result === '负' ? 'loss' : ''}`}>{b.result}</span><strong>{b.opponent}</strong><b>{b.score}</b><small>{b.note}</small></div>)}<div className="competition-foot"><span>记录编号 DC-{String(c.id).padStart(4, '0')}</span>{canManage && c.status !== '已核验' && <div><button className="text-btn" onClick={() => { update('competitions', store.competitions.map(x => x.id === c.id ? { ...x, status: '需补充' } : x)); notify('已退回补充材料') }}>退回补充</button><button className="secondary-btn" onClick={() => { update('competitions', store.competitions.map(x => x.id === c.id ? { ...x, status: '已核验' } : x)); notify('成绩核验通过，已计入正式统计') }}><ShieldCheck size={16}/> 核验通过</button></div>}</div></section>)}</div>
        </>}

        {page === 'report' && <>
          <div className="toolbar filters"><div><label>交锋来源<select value={source} onChange={e => setSource(e.target.value)}><option>全部来源</option><option>正式比赛</option><option>训练测试</option></select></label><label>剑种<select value={weapon} onChange={e => setWeapon(e.target.value)}><option>全部剑种</option><option>重剑</option><option>花剑</option><option>佩剑</option></select></label></div>{canManage && <button className="secondary-btn" onClick={() => setModal('comment')}>编辑月度评语</button>}</div>
          <section className="report-banner"><div><span className="eyebrow">OCTOBER / 2026</span><h2>{current.name}的十月成长报告</h2><p>稳定投入，比偶尔的高光更重要。</p></div><div className="report-score"><strong>{Math.min(100, Math.round(done.length / store.goal * 100))}</strong><span>月度目标<br/>完成度</span></div></section>
          <section className="stat-grid report-stats"><article><span>训练天数 / 目标</span><strong>{done.length}<small> / {store.goal} 天</small></strong><button className="inline-link" onClick={() => setModal('goal')}>调整目标</button></article><article><span>训练总时长</span><strong>{minutes}<small> 分钟</small></strong><em>{done.length} 条有效训练记录</em></article><article><span>交锋胜率</span><strong>{bouts.length ? Math.round(wins / bouts.length * 100) : 0}<small>%</small></strong><em>{wins} 胜 / {bouts.length} 场有效交锋</em></article><article><span>平均主观强度</span><strong>{(done.reduce((n, t) => n + t.rpe, 0) / done.length).toFixed(1)}<small> RPE</small></strong><em>强度适中，注意恢复</em></article></section>
          <div className="dashboard-grid report-grid"><section className="panel"><div className="panel-head"><div><span className="eyebrow">CONSISTENCY</span><h2>训练日历</h2></div><span className="subtle">2026 年 10 月</span></div><div className="calendar week">{['一','二','三','四','五','六','日'].map(d => <span key={d}>{d}</span>)}</div><div className="calendar days">{[...Array(3)].map((_,i)=><i key={`e${i}`}/>)}{[...Array(31)].map((_, i) => { const day = i + 1; const trained = done.some(t => Number(t.date.slice(8)) === day); return <span key={day} className={`${trained ? 'trained' : ''} ${day === 26 ? 'today' : ''}`}>{day}{trained && <i/>}</span> })}</div><div className="calendar-note"><i/> 已完成训练 <span>本月 {done.length} 天有效训练</span></div></section><section className="panel coach-note"><div className="panel-head"><div><span className="eyebrow">COACH'S NOTE</span><h2>教练评语</h2></div><span className="avatar">陈</span></div><blockquote>“{store.comment}”</blockquote><div className="coach-sign"><strong>陈教练</strong><span>2026 年 10 月 · 第 1 版</span></div><div className="focus-box"><Target size={20}/><div><strong>下月训练重点</strong><p>进攻前的距离判断<br/>对抗中的节奏耐心</p></div></div></section></div>
          <p className="method-note">统计口径：仅已核验成绩进入正式统计；胜率仅纳入明确胜负，弃权与退赛不计入。当前筛选：{source} / {weapon}。</p>
        </>}

        {page === 'community' && <div className="community-layout"><div><div className="toolbar"><p>俱乐部内文字交流 · 人工审核后公开</p><button className="primary-btn" onClick={() => setModal('question')}><Plus size={16}/> 提一个问题</button></div>{store.posts.length === 0 ? <Empty title="还没有问题" text="发布第一个训练问题，和大家一起交流。"/> : store.posts.map(p => <article className="panel post" key={p.id}><div className="post-meta"><span className="avatar">{p.author.slice(0,1)}</span><div><strong>{p.author}</strong><span>{p.role} · {p.date}</span></div><span className="pill green">{p.status}</span></div><h2>{p.title}</h2><p>{p.body}</p>{p.replies.map((r, i) => <div className="reply" key={i}><strong>{r.author}</strong><p>{r.body}</p></div>)}<button className="text-btn" onClick={() => setModal(`reply-${p.id}`)}><MessageCircle size={16}/> 回复 <span>{p.replies.length}</span></button></article>)}</div><aside className="community-aside"><span className="eyebrow">COMMUNITY NOTES</span><h2>让交流更有价值。</h2><p>描述具体场景，尊重不同经验。请勿发布联系方式、健康资料或他人隐私。</p><div><ShieldCheck size={20}/><span>内容提交和编辑后进入待审核，由管理员处理后公开。</span></div></aside></div>}

        {page === 'messages' && <section className="panel messages-panel"><div className="panel-head"><div><span className="eyebrow">NOTIFICATIONS</span><h2>站内消息 <small>{unread} 条未读</small></h2></div><button className="text-btn" onClick={() => { update('messages', store.messages.map(m => ({ ...m, read: true }))); notify('已全部标为已读') }}>全部已读 <Check size={15}/></button></div>{store.messages.map(m => <button className={`message ${!m.read ? 'unread' : ''}`} key={m.id} onClick={() => update('messages', store.messages.map(x => x.id === m.id ? { ...x, read: true } : x))}><span className="message-dot"/><div><strong>{m.title}</strong><p>{m.body}</p><time>{m.time}{!m.read && ' · 未读'}</time></div><ArrowRight size={18}/></button>)}<p className="method-note">仅应用内查看，不提供关闭应用后的推送。</p></section>}

        {page === 'settings' && <div className="settings-grid"><section className="panel settings-main"><div className="panel-head"><div><span className="eyebrow">MEMBER PROFILE</span><h2>账号与会员资料</h2></div></div><div className="profile-identity"><span className="profile-avatar">{current.name.slice(0,1)}</span><div><h3>{current.name}</h3><p>{current.weapon} · {current.level}</p></div><span className="pill green">会籍有效</span></div><dl><div><dt>当前体验账号</dt><dd>{user.name}</dd></div><div><dt>登录邮箱</dt><dd>{user.email}</dd></div><div><dt>账号角色</dt><dd>{currentRole.detail}</dd></div><div><dt>会员编号</dt><dd>DC-2026-{current.id.slice(1).padStart(3,'0')}</dd></div><div><dt>会籍截止</dt><dd>2027 年 01 月 31 日</dd></div></dl><div className="settings-actions"><button className="secondary-btn" onClick={exportData}><Download size={17}/> 导出当前会员数据</button><button className="text-btn" onClick={() => setGuideStep(0)}><BookOpen size={17}/> 重新观看新手导览</button></div></section><section className="panel consent"><div className="panel-head"><div><span className="eyebrow">PRIVACY & CONSENT</span><h2>隐私与授权</h2></div><ShieldCheck size={24}/></div><p>评估版仅用于测试。请使用样本数据，不填写真实健康信息。手动心率仅本人、已绑定监护人和有独立授权的岗位可读取。</p><div className="consent-row"><div><strong>健康信息录入授权</strong><span>{store.consent ? '已同意 · 可随时撤回' : '已撤回 · 相关录入已停用'}</span></div><button role="switch" aria-checked={store.consent} className={`switch ${store.consent ? 'on' : ''}`} onClick={() => { update('consent', !store.consent); notify(store.consent ? '健康信息授权已撤回' : '健康信息授权已开启') }}><i/></button></div><div className="storage-note"><strong>评估数据保存在哪里？</strong><p>此版本的操作记录仅保存在当前浏览器，不会跨设备同步；清除浏览器数据会移除这些记录。</p></div></section></div>}
        <footer><span>一剑击击剑俱乐部</span><span>DEFENCING BETA 0.4 · 合成评估样本</span></footer>
      </main>
    </div>

    {modal === 'record' && <Modal title="记录一次训练" eyebrow="TRAINING LOG" onClose={() => setModal(null)}><form onSubmit={e => { const d = formData(e); update('trainings', [...store.trainings, { id: Date.now(), date: String(d.get('date')), title: String(d.get('title')), type: String(d.get('type')), duration: Number(d.get('duration')), rpe: Number(d.get('rpe')), note: String(d.get('note')), done: true }]); setModal(null); notify('训练记录已保存') }}><div className="form-grid"><Field label="训练日期"><input name="date" type="date" defaultValue="2026-10-26" required/></Field><Field label="训练类型"><select name="type"><option>技术训练</option><option>专项训练</option><option>实战训练</option><option>体能训练</option></select></Field></div><Field label="训练主题"><input name="title" placeholder="例如：步法控制与距离感" required maxLength={40}/></Field><div className="form-grid"><Field label="时长（分钟）"><input name="duration" type="number" min="1" max="600" defaultValue="60" required/></Field><Field label="主观强度 RPE（1–10）"><input name="rpe" type="number" min="1" max="10" defaultValue="6" required/></Field></div><Field label="训练反思"><textarea name="note" placeholder="记录一个做得好的地方，以及下一步想改进的地方" required/></Field><button className="primary-btn full" type="submit">保存训练记录 <ArrowRight size={16}/></button></form></Modal>}
    {modal === 'plan' && <Modal title="发布训练计划" eyebrow="NEW TRAINING PLAN" onClose={() => setModal(null)}><form onSubmit={e => { const d = formData(e); update('trainings', [...store.trainings, { id: Date.now(), date: String(d.get('date')), title: String(d.get('title')), type: '教练计划', duration: Number(d.get('duration')), rpe: 0, note: String(d.get('note')), done: false }]); update('messages', [{ id: Date.now() + 1, title: '新的训练计划已发布', body: `陈教练为你发布了「${String(d.get('title'))}」，请提前到场热身。`, time: '刚刚', read: false }, ...store.messages]); setModal(null); notify('训练计划已发布，会员已收到站内消息') }}><Field label="计划日期"><input name="date" type="date" defaultValue="2026-10-28" required/></Field><Field label="训练主题"><input name="title" placeholder="输入清晰的训练目标" required/></Field><Field label="预计时长（分钟）"><input name="duration" type="number" min="15" max="300" defaultValue="75" required/></Field><Field label="训练安排"><textarea name="note" placeholder="热身、专项练习与实战安排" required/></Field><button className="primary-btn full" type="submit">发布计划 <Send size={16}/></button></form></Modal>}
    {modal === 'competition' && <Modal title="录入比赛成绩" eyebrow="COMPETITION RECORD" onClose={() => setModal(null)}><form onSubmit={e => { const d = formData(e); update('competitions', [{ id: Date.now(), name: String(d.get('name')), date: String(d.get('date')), city: String(d.get('city')), weapon: String(d.get('weapon')), status: '待核验', bouts: [{ opponent: String(d.get('opponent')), score: `${d.get('myScore')} : ${d.get('opScore')}`, result: Number(d.get('myScore')) > Number(d.get('opScore')) ? '胜' : '负', note: '正式比赛' }] }, ...store.competitions]); setModal(null); notify('成绩已保存，等待教练核验') }}><Field label="赛事名称"><input name="name" required placeholder="例如：秋季俱乐部交流赛"/></Field><div className="form-grid"><Field label="比赛日期"><input name="date" type="date" defaultValue="2026-10-26" required/></Field><Field label="城市"><input name="city" defaultValue="上海" required/></Field></div><Field label="参赛项目"><select name="weapon"><option>重剑 · U14 个人</option><option>花剑 · U14 个人</option><option>佩剑 · U14 个人</option></select></Field><Field label="对手昵称"><input name="opponent" required placeholder="请勿填写真实个人资料"/></Field><div className="form-grid"><Field label="本方得分"><input name="myScore" type="number" min="0" max="45" defaultValue="15" required/></Field><Field label="对手得分"><input name="opScore" type="number" min="0" max="45" defaultValue="12" required/></Field></div><button className="primary-btn full" type="submit">保存并提交核验 <ShieldCheck size={16}/></button></form></Modal>}
    {modal === 'goal' && <Modal title="调整月度训练目标" eyebrow="MONTHLY GOAL" onClose={() => setModal(null)}><form onSubmit={e => { const d = formData(e); update('goal', Number(d.get('goal'))); setModal(null); notify('月度训练目标已更新') }}><Field label="每月目标训练天数"><input name="goal" type="number" min="1" max="31" defaultValue={store.goal} required/></Field><p className="form-help">建议根据训练周期与恢复情况设置可完成的目标。</p><button className="primary-btn full" type="submit">保存目标</button></form></Modal>}
    {modal === 'comment' && <Modal title="编辑月度评语" eyebrow="COACH'S NOTE" onClose={() => setModal(null)}><form onSubmit={e => { const d = formData(e); update('comment', String(d.get('comment'))); setModal(null); notify('月度评语已更新') }}><Field label="本月评语"><textarea name="comment" defaultValue={store.comment} required/></Field><button className="primary-btn full" type="submit">保存评语</button></form></Modal>}
    {modal === 'question' && <Modal title="向俱乐部提问" eyebrow="COMMUNITY QUESTION" onClose={() => setModal(null)}><form onSubmit={e => { const d = formData(e); update('posts', [{ id: Date.now(), author: displayRole.name, role: currentRole.detail, date: '2026-10-26', title: String(d.get('title')), body: String(d.get('body')), replies: [], status: canManage ? '已公开' : '待审核' }, ...store.posts]); setModal(null); notify(canManage ? '问题已发布' : '问题已提交审核') }}><Field label="问题标题"><input name="title" required placeholder="用一句话说明你的问题"/></Field><Field label="具体场景"><textarea name="body" required placeholder="补充训练或比赛中的具体情况，请勿填写隐私信息"/></Field><button className="primary-btn full" type="submit">提交问题 <Send size={16}/></button></form></Modal>}
    {modal?.startsWith('reply-') && <Modal title="回复问题" eyebrow="COMMUNITY REPLY" onClose={() => setModal(null)}><form onSubmit={e => { const d = formData(e); const id = Number(modal.split('-')[1]); update('posts', store.posts.map(p => p.id === id ? { ...p, replies: [...p.replies, { author: currentRole.name, body: String(d.get('body')) }] } : p)); setModal(null); notify('回复已发布') }}><Field label="你的回复"><textarea name="body" required autoFocus placeholder="分享你的经验或建议"/></Field><button className="primary-btn full" type="submit">发布回复 <Send size={16}/></button></form></Modal>}
    {modal === 'feedback' && <Modal title="提交评估意见" eyebrow="BETA FEEDBACK" onClose={() => setModal(null)}><form onSubmit={e => { const d = formData(e); const previous = JSON.parse(localStorage.getItem('defencing-feedback') || '[]'); localStorage.setItem('defencing-feedback', JSON.stringify([...previous, { type: d.get('type'), feedback: d.get('feedback'), page, createdAt: new Date().toISOString() }])); setModal(null); notify('感谢反馈，意见已保存在本次评估记录中') }}><Field label="意见类型"><select name="type"><option>功能建议</option><option>体验问题</option><option>数据与统计</option><option>其他</option></select></Field><Field label="详细说明"><textarea name="feedback" required placeholder="请描述你所在的页面、操作和期待的结果"/></Field><button className="primary-btn full" type="submit">提交意见 <Send size={16}/></button></form></Modal>}
    {guideStep !== null && <ProductTour step={guideStep} onNext={nextGuide} onClose={closeGuide}/>}
    {toast && <div className="toast" role="status"><CheckCircle2 size={18}/>{toast}</div>}
  </div>
}

export default function App() {
  const auth = useEvaluationAuth()
  if (auth.isLoading) return <div className="app-loading" role="status"><span className="brand-mark"><Swords size={25}/></span><strong>一剑击</strong><span>正在准备工作台…</span></div>
  if (!auth.user) return <AuthPage onSignIn={auth.signIn} onSignUp={auth.signUp} onReset={auth.resetPassword} onDemo={auth.enterDemo}/>
  if (!auth.user.onboarded) return <Onboarding user={auth.user} onComplete={auth.completeOnboarding} onSkip={auth.skipOnboarding}/>
  return <Workspace key={auth.user.id} user={auth.user} onLogout={auth.signOut} onTourFinished={auth.finishTour}/>
}
