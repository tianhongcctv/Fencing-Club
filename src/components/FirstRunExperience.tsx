import { useEffect, useState } from 'react'
import {
  ArrowLeft,
  ArrowRight,
  BarChart3,
  Check,
  ClipboardCheck,
  Flag,
  GraduationCap,
  ShieldCheck,
  Sparkles,
  Swords,
  Target,
  UserRound,
  UsersRound,
  X,
} from 'lucide-react'
import type { Page, Role } from '../data'
import type { EvaluationUser, TrainingPreferences } from '../lib/evaluation-auth'

const roleOptions: { id: Role; name: string; description: string; detail: string; icon: typeof UserRound }[] = [
  { id: 'member', name: '我是会员', description: '记录自己的训练与比赛', detail: '打卡、成绩、月报', icon: UserRound },
  { id: 'coach', name: '我是教练', description: '安排计划并核验成绩', detail: '计划、核验、评语', icon: GraduationCap },
  { id: 'parent', name: '我是家长', description: '关注孩子的训练成长', detail: '进度、消息、月报', icon: UsersRound },
  { id: 'admin', name: '俱乐部运营', description: '管理俱乐部日常协作', detail: '全部管理权限', icon: ShieldCheck },
]

export function Onboarding({ user, onComplete, onSkip }: {
  user: EvaluationUser
  onComplete: (role: Role, preferences: TrainingPreferences) => void
  onSkip: () => void
}) {
  const [step, setStep] = useState(0)
  const [role, setRole] = useState<Role>(user.role)
  const [weapon, setWeapon] = useState(user.preferences.weapon)
  const [frequency, setFrequency] = useState(user.preferences.frequency)
  const [focus, setFocus] = useState(user.preferences.focus)
  const [acknowledged, setAcknowledged] = useState(false)
  const selectedRole = roleOptions.find(option => option.id === role)!

  return <div className="onboarding-page">
    <aside className="onboarding-aside">
      <div className="auth-brand"><span className="brand-mark"><Swords size={25}/></span><span><strong>一剑击</strong><small>DEFENCING CLUB</small></span></div>
      <div className="onboarding-aside-copy"><span className="eyebrow">WELCOME, {user.name.toUpperCase()}</span><h1>让工作台，<br/>更贴近你的训练。</h1><p>只需三个小步骤。之后你可以在“资料与授权”中随时调整。</p></div>
      <ol className="onboarding-progress">
        {['选择身份', '训练偏好', '确认并开始'].map((label, index) => <li key={label} className={`${step === index ? 'current' : ''} ${step > index ? 'done' : ''}`}><span>{step > index ? <Check size={15}/> : index + 1}</span><div><strong>{label}</strong><small>{index === 0 ? '你如何使用一剑击' : index === 1 ? '生成适合你的起点' : '了解样本数据口径'}</small></div></li>)}
      </ol>
      <p className="onboarding-quote">“稳定投入，比偶尔的高光更重要。”</p>
    </aside>

    <main className="onboarding-main">
      <button className="onboarding-skip" onClick={onSkip}>跳过设置 <ArrowRight size={15}/></button>
      <section className="onboarding-content">
        <div className="mobile-onboarding-progress"><span>第 {step + 1} 步，共 3 步</span><div><i style={{ width: `${(step + 1) / 3 * 100}%` }}/></div></div>
        {step === 0 && <div className="onboarding-step">
          <span className="eyebrow">YOUR ROLE</span><h2>{user.name}，你将以什么身份开始？</h2><p>身份决定默认视角。评估版仍可通过顶部角色菜单体验其他工作方式。</p>
          <div className="role-options">{roleOptions.map(option => <button key={option.id} className={role === option.id ? 'selected' : ''} onClick={() => setRole(option.id)} aria-pressed={role === option.id}><option.icon size={23}/><span><strong>{option.name}</strong><small>{option.description}</small><em>{option.detail}</em></span><i>{role === option.id && <Check size={15}/>}</i></button>)}</div>
        </div>}

        {step === 1 && <div className="onboarding-step">
          <span className="eyebrow">YOUR PREFERENCES</span><h2>{role === 'member' || role === 'parent' ? '从适合的训练节奏开始。' : '设置你的执教与协作起点。'}</h2><p>{role === 'member' || role === 'parent' ? '我们会据此设置月度目标和默认关注内容。' : '这些偏好用于展示样本计划，不会限制其他剑种或功能。'}</p>
          <div className="preference-group"><label>{role === 'coach' || role === 'admin' ? '主要关注剑种' : '当前剑种'}</label><div className="segmented-options">{['重剑', '花剑', '佩剑'].map(item => <button key={item} className={weapon === item ? 'selected' : ''} onClick={() => setWeapon(item)} aria-pressed={weapon === item}>{item}</button>)}</div></div>
          <div className="preference-group"><label>{role === 'coach' || role === 'admin' ? '每周计划节数' : '每周目标训练次数'}</label><div className="frequency-options">{[1, 2, 3, 4].map(item => <button key={item} className={frequency === item ? 'selected' : ''} onClick={() => setFrequency(item)} aria-pressed={frequency === item}><strong>{item}</strong><span>次 / 周</span></button>)}</div><small>月度目标将按 {frequency * 4} 次设置，之后可随时调整。</small></div>
          <div className="preference-group"><label>现阶段最想关注</label><div className="focus-options">{['距离与步伐', '进攻节奏', '实战复盘'].map(item => <button key={item} className={focus === item ? 'selected' : ''} onClick={() => setFocus(item)} aria-pressed={focus === item}><Target size={17}/>{item}</button>)}</div></div>
        </div>}

        {step === 2 && <div className="onboarding-step">
          <span className="eyebrow">READY TO FENCE</span><h2>准备好了，{user.name}。</h2><p>确认以下设置，进入工作台后还有一份简短导览。</p>
          <dl className="onboarding-summary"><div><dt>默认身份</dt><dd>{selectedRole.name}</dd></div><div><dt>关注剑种</dt><dd>{weapon}</dd></div><div><dt>训练节奏</dt><dd>每周 {frequency} 次 · 每月 {frequency * 4} 次</dd></div><div><dt>当前重点</dt><dd>{focus}</dd></div></dl>
          <div className="first-week"><Sparkles size={21}/><div><strong>你的第一周，可以这样开始</strong><p>查看本周训练焦点，完成一次训练打卡，再到成长月报回顾记录。</p></div></div>
          <label className="check-label onboarding-consent"><input type="checkbox" checked={acknowledged} onChange={event => setAcknowledged(event.target.checked)}/><span>我了解当前为评估版，所有人物与成绩均为样本；账户和数据仅保存在当前浏览器。</span></label>
        </div>}

        <div className="onboarding-actions">{step > 0 ? <button className="secondary-btn" onClick={() => setStep(step => step - 1)}><ArrowLeft size={17}/> 上一步</button> : <span/>}{step < 2 ? <button className="primary-btn" onClick={() => setStep(step => step + 1)}>继续 <ArrowRight size={17}/></button> : <button className="primary-btn" disabled={!acknowledged} onClick={() => onComplete(role, { weapon, frequency, focus })}>进入工作台 <ArrowRight size={17}/></button>}</div>
      </section>
    </main>
  </div>
}

export const tourSteps: { page: Page; selector: string; eyebrow: string; title: string; body: string; icon: typeof Flag }[] = [
  { page: 'overview', selector: '.hero-panel', eyebrow: 'YOUR WEEK', title: '先看本周训练焦点', body: '总览把下一场安排和当前重点放在一起。点击“查看训练安排”，就能进入完整计划。', icon: Flag },
  { page: 'training', selector: '.training-list', eyebrow: 'TRAIN & REFLECT', title: '计划、打卡与反思在一起', body: '待完成计划可以直接打卡；已完成记录会保留时长、强度和训练反思。', icon: ClipboardCheck },
  { page: 'report', selector: '.report-banner', eyebrow: 'GROWTH REVIEW', title: '用月报看见持续进步', body: '训练投入、已核验比赛和教练评语会在这里汇总，适合每月复盘一次。', icon: BarChart3 },
]

export function ProductTour({ step, onNext, onClose }: { step: number; onNext: () => void; onClose: () => void }) {
  const current = tourSteps[step]
  useEffect(() => {
    const close = (event: KeyboardEvent) => event.key === 'Escape' && onClose()
    window.addEventListener('keydown', close)
    return () => window.removeEventListener('keydown', close)
  }, [onClose])
  if (!current) return null
  const Icon = current.icon
  return <div className="tour-layer">
    <div className="tour-backdrop" onMouseDown={event => event.target === event.currentTarget && onClose()}/>
    <section className="tour-popover" role="dialog" aria-modal="true" aria-labelledby="tour-title">
      <button className="icon-btn tour-close" onClick={onClose} aria-label="关闭新手导览"><X size={18}/></button>
      <div className="tour-heading"><span><Icon size={20}/></span><div><small>{current.eyebrow}</small><strong>新手导览 · {step + 1} / {tourSteps.length}</strong></div></div>
      <h2 id="tour-title">{current.title}</h2><p>{current.body}</p>
      <div className="tour-footer"><button className="text-btn" onClick={onClose}>跳过导览</button><div className="tour-dots" aria-hidden="true">{tourSteps.map((_, index) => <i key={index} className={index === step ? 'active' : ''}/>)}</div><button className="primary-btn" onClick={onNext}>{step === tourSteps.length - 1 ? '开始探索' : '下一步'} <ArrowRight size={16}/></button></div>
    </section>
  </div>
}
