import { useState, type FormEvent, type ReactNode } from 'react'
import {
  AlertCircle,
  ArrowRight,
  BarChart3,
  Check,
  ChevronLeft,
  ClipboardCheck,
  Eye,
  EyeOff,
  KeyRound,
  LoaderCircle,
  LockKeyhole,
  Mail,
  ShieldCheck,
  Sparkles,
  Swords,
  UserRound,
} from 'lucide-react'

type AuthMode = 'login' | 'register' | 'reset'

type AuthPageProps = {
  onSignIn: (input: { email: string; password: string; remember: boolean }) => Promise<unknown>
  onSignUp: (input: { name: string; email: string; password: string }) => Promise<unknown>
  onReset: (input: { email: string; password: string }) => Promise<void>
  onDemo: () => void
}

function validEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())
}

function validPassword(password: string) {
  return password.length >= 8 && /[A-Za-z]/.test(password) && /\d/.test(password)
}

function AuthField({ label, icon, children }: { label: string; icon: ReactNode; children: ReactNode }) {
  return <label className="auth-field"><span>{label}</span><div className="auth-input-wrap">{icon}{children}</div></label>
}

function PasswordInput({ id, value, onChange, placeholder, autoComplete }: {
  id: string
  value: string
  onChange: (value: string) => void
  placeholder: string
  autoComplete: string
}) {
  const [visible, setVisible] = useState(false)
  return <div className="password-wrap">
    <input id={id} type={visible ? 'text' : 'password'} value={value} onChange={event => onChange(event.target.value)} placeholder={placeholder} autoComplete={autoComplete} required />
    <button type="button" onClick={() => setVisible(value => !value)} aria-label={visible ? '隐藏密码' : '显示密码'}>{visible ? <EyeOff size={18}/> : <Eye size={18}/>}</button>
  </div>
}

export default function AuthPage({ onSignIn, onSignUp, onReset, onDemo }: AuthPageProps) {
  const [mode, setMode] = useState<AuthMode>('login')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [remember, setRemember] = useState(true)
  const [accepted, setAccepted] = useState(false)
  const [pending, setPending] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const changeMode = (nextMode: AuthMode) => {
    setMode(nextMode)
    setPassword('')
    setConfirmPassword('')
    setError('')
    setSuccess('')
  }

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError('')
    setSuccess('')
    if (!validEmail(email)) {
      setError('请输入有效的邮箱地址。')
      return
    }
    if (mode === 'register' && name.trim().length < 2) {
      setError('请填写至少 2 个字的称呼。')
      return
    }
    if (!validPassword(password)) {
      setError('密码至少 8 位，并同时包含字母和数字。')
      return
    }
    if (mode !== 'login' && password !== confirmPassword) {
      setError('两次输入的密码不一致。')
      return
    }
    if (mode === 'register' && !accepted) {
      setError('请先同意评估版使用说明。')
      return
    }
    setPending(true)
    try {
      if (mode === 'login') await onSignIn({ email, password, remember })
      if (mode === 'register') await onSignUp({ name, email, password })
      if (mode === 'reset') {
        await onReset({ email, password })
        setMode('login')
        setPassword('')
        setConfirmPassword('')
        setSuccess('密码已重置，请使用新密码登录。')
      }
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : '操作未完成，请稍后重试。')
    } finally {
      setPending(false)
    }
  }

  const runDemo = async () => {
    setPending(true)
    setError('')
    try {
      await Promise.resolve(onDemo())
    } finally {
      setPending(false)
    }
  }

  const title = mode === 'login' ? '欢迎回到训练场' : mode === 'register' ? '创建你的俱乐部账户' : '重新设置密码'
  const subtitle = mode === 'login' ? '登录后继续今天的训练与成长记录。' : mode === 'register' ? '注册后，我们会用三步帮你设置好工作台。' : '仅可重置保存在当前浏览器中的评估账户。'

  return <div className="auth-page">
    <section className="auth-story" aria-label="一剑击产品介绍">
      <div className="auth-brand"><span className="brand-mark"><Swords size={25}/></span><span><strong>一剑击</strong><small>DEFENCING CLUB</small></span></div>
      <div className="auth-story-copy">
        <span className="eyebrow">EVERY TOUCH COUNTS</span>
        <h1>每一剑，<br/>都有成长的路径。</h1>
        <p>从训练计划到比赛核验，再到每月复盘。把俱乐部里的每一次投入，连成清晰可见的进步。</p>
      </div>
      <div className="auth-session-preview">
        <div className="preview-top"><span><Sparkles size={14}/> 下一场训练</span><small>10 月 27 日 · 18:30</small></div>
        <h2>距离判断与主动进攻</h2>
        <p>陈教练 · 重剑训练馆 · 75 分钟</p>
        <div className="preview-tags"><span><Check size={14}/> 动态热身</span><span><Check size={14}/> 距离练习</span><span><Check size={14}/> 条件实战</span></div>
      </div>
      <div className="auth-capabilities">
        <span><ClipboardCheck size={18}/> 训练有计划</span>
        <span><ShieldCheck size={18}/> 成绩有核验</span>
        <span><BarChart3 size={18}/> 成长有回响</span>
      </div>
      <div className="auth-lines" aria-hidden="true"><i/><i/><i/></div>
    </section>

    <main className="auth-main">
      <div className="auth-mobile-brand"><span className="brand-mark"><Swords size={22}/></span><strong>一剑击</strong><span>俱乐部工作台</span></div>
      <section className="auth-panel">
        <div className="evaluation-badge"><span/> 产品评估版</div>
        {mode !== 'reset' ? <div className="auth-tabs" role="tablist" aria-label="账户操作">
          <button role="tab" aria-selected={mode === 'login'} className={mode === 'login' ? 'active' : ''} onClick={() => changeMode('login')} disabled={pending}>登录</button>
          <button role="tab" aria-selected={mode === 'register'} className={mode === 'register' ? 'active' : ''} onClick={() => changeMode('register')} disabled={pending}>注册</button>
        </div> : <button className="auth-back" onClick={() => changeMode('login')}><ChevronLeft size={17}/> 返回登录</button>}
        <div className="auth-title"><span className="eyebrow">{mode === 'reset' ? 'ACCOUNT RECOVERY' : 'CLUB WORKSPACE'}</span><h2>{title}</h2><p>{subtitle}</p></div>

        <form className="auth-form" onSubmit={submit} noValidate>
          {mode === 'register' && <AuthField label="你的称呼" icon={<UserRound size={18}/>}><input id="name" value={name} onChange={event => setName(event.target.value)} placeholder="例如：林跃" autoComplete="name" maxLength={20} required/></AuthField>}
          <AuthField label="邮箱" icon={<Mail size={18}/>}><input id="email" type="email" value={email} onChange={event => setEmail(event.target.value)} placeholder="name@example.com" autoComplete="email" required/></AuthField>
          <AuthField label={mode === 'reset' ? '新密码' : '密码'} icon={<LockKeyhole size={18}/>}><PasswordInput id="password" value={password} onChange={setPassword} placeholder="至少 8 位，含字母和数字" autoComplete={mode === 'login' ? 'current-password' : 'new-password'}/></AuthField>
          {mode === 'register' && <div className="password-hint"><i className={password.length >= 8 ? 'met' : ''}/><span>8 位以上</span><i className={/[A-Za-z]/.test(password) && /\d/.test(password) ? 'met' : ''}/><span>字母 + 数字</span></div>}
          {mode !== 'login' && <AuthField label="确认密码" icon={<KeyRound size={18}/>}><PasswordInput id="confirm-password" value={confirmPassword} onChange={setConfirmPassword} placeholder="再次输入密码" autoComplete="new-password"/></AuthField>}

          {mode === 'login' && <div className="auth-form-meta"><label className="check-label"><input type="checkbox" checked={remember} onChange={event => setRemember(event.target.checked)}/><span>保持登录</span></label><button type="button" className="inline-link" onClick={() => changeMode('reset')}>忘记密码？</button></div>}
          {mode === 'register' && <label className="check-label consent-check"><input type="checkbox" checked={accepted} onChange={event => setAccepted(event.target.checked)}/><span>我同意仅使用样本数据进行产品评估，不填写真实健康或敏感信息。</span></label>}

          {error && <div className="auth-message error" role="alert"><AlertCircle size={17}/><span>{error}</span></div>}
          {success && <div className="auth-message success" role="status"><Check size={17}/><span>{success}</span></div>}

          <button className="primary-btn full auth-submit" type="submit" disabled={pending}>{pending ? <LoaderCircle className="spin" size={18}/> : mode === 'reset' ? <KeyRound size={18}/> : <ArrowRight size={18}/>}<span>{pending ? '正在处理…' : mode === 'login' ? '登录工作台' : mode === 'register' ? '注册并开始设置' : '保存新密码'}</span></button>
        </form>

        {mode === 'login' && <>
          <div className="auth-divider"><span>或</span></div>
          <button className="secondary-btn full demo-btn" onClick={runDemo} disabled={pending}><Swords size={17}/> 使用样本账号体验</button>
        </>}

        <details className="evaluation-details"><summary>评估版账户与数据说明</summary><p>账户、登录状态、训练记录和引导进度仅保存在当前浏览器，不会跨设备同步。清除浏览器数据会移除这些内容；样本体验账号无需密码。</p></details>
      </section>
      <footer className="auth-footer"><span>一剑击击剑俱乐部</span><span>DEFENCING BETA 0.4</span></footer>
    </main>
  </div>
}
