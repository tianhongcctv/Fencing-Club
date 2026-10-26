import type { Role } from '../data'

export type TrainingPreferences = {
  weapon: string
  frequency: number
  focus: string
}

export type EvaluationUser = {
  id: string
  name: string
  email: string
  role: Role
  onboarded: boolean
  tourPending: boolean
  preferences: TrainingPreferences
  createdAt: string
}

type Account = EvaluationUser & {
  salt: string
  passwordHash: string
}

const ACCOUNTS_KEY = 'defencing-evaluation-accounts-v1'
const SESSION_KEY = 'defencing-evaluation-session-v1'

export const defaultPreferences: TrainingPreferences = {
  weapon: '重剑',
  frequency: 2,
  focus: '距离与步伐',
}

function readAccounts(): Account[] {
  try {
    const value = localStorage.getItem(ACCOUNTS_KEY)
    return value ? JSON.parse(value) : []
  } catch {
    return []
  }
}

function writeAccounts(accounts: Account[]) {
  localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accounts))
}

function toPublicUser(account: Account): EvaluationUser {
  const { salt: _salt, passwordHash: _passwordHash, ...user } = account
  return user
}

function normalizeEmail(email: string) {
  return email.trim().toLowerCase()
}

function randomSalt() {
  const bytes = crypto.getRandomValues(new Uint8Array(16))
  return Array.from(bytes, byte => byte.toString(16).padStart(2, '0')).join('')
}

async function hashPassword(password: string, salt: string) {
  const data = new TextEncoder().encode(`${salt}:${password}`)
  const digest = await crypto.subtle.digest('SHA-256', data)
  return Array.from(new Uint8Array(digest), byte => byte.toString(16).padStart(2, '0')).join('')
}

function saveSession(id: string, remember: boolean) {
  localStorage.removeItem(SESSION_KEY)
  sessionStorage.removeItem(SESSION_KEY)
  const storage = remember ? localStorage : sessionStorage
  storage.setItem(SESSION_KEY, id)
}

export function getStoredUser(): EvaluationUser | null {
  const id = localStorage.getItem(SESSION_KEY) || sessionStorage.getItem(SESSION_KEY)
  if (!id) return null
  const account = readAccounts().find(item => item.id === id)
  if (!account) {
    clearStoredSession()
    return null
  }
  return toPublicUser(account)
}

export function clearStoredSession() {
  localStorage.removeItem(SESSION_KEY)
  sessionStorage.removeItem(SESSION_KEY)
}

export async function registerAccount(input: {
  name: string
  email: string
  password: string
}): Promise<EvaluationUser> {
  const accounts = readAccounts()
  const email = normalizeEmail(input.email)
  if (accounts.some(account => account.email === email)) {
    throw new Error('这个邮箱已注册，请直接登录或重置密码。')
  }
  const salt = randomSalt()
  const account: Account = {
    id: crypto.randomUUID(),
    name: input.name.trim(),
    email,
    role: 'member',
    onboarded: false,
    tourPending: false,
    preferences: { ...defaultPreferences },
    createdAt: new Date().toISOString(),
    salt,
    passwordHash: await hashPassword(input.password, salt),
  }
  writeAccounts([...accounts, account])
  saveSession(account.id, true)
  return toPublicUser(account)
}

export async function authenticateAccount(input: {
  email: string
  password: string
  remember: boolean
}): Promise<EvaluationUser> {
  const email = normalizeEmail(input.email)
  const account = readAccounts().find(item => item.email === email)
  if (!account) throw new Error('邮箱或密码不正确，请检查后重试。')
  const passwordHash = await hashPassword(input.password, account.salt)
  if (passwordHash !== account.passwordHash) {
    throw new Error('邮箱或密码不正确，请检查后重试。')
  }
  saveSession(account.id, input.remember)
  return toPublicUser(account)
}

export async function resetAccountPassword(input: {
  email: string
  password: string
}) {
  const accounts = readAccounts()
  const email = normalizeEmail(input.email)
  const index = accounts.findIndex(account => account.email === email)
  if (index < 0) throw new Error('当前浏览器中没有找到这个账户，请检查邮箱或先注册。')
  const salt = randomSalt()
  accounts[index] = {
    ...accounts[index],
    salt,
    passwordHash: await hashPassword(input.password, salt),
  }
  writeAccounts(accounts)
}

export function updateAccount(id: string, changes: Partial<EvaluationUser>): EvaluationUser {
  const accounts = readAccounts()
  const index = accounts.findIndex(account => account.id === id)
  if (index < 0) throw new Error('账户状态已失效，请重新登录。')
  accounts[index] = { ...accounts[index], ...changes, id, email: accounts[index].email }
  writeAccounts(accounts)
  return toPublicUser(accounts[index])
}

export function enterDemoAccount(): EvaluationUser {
  const accounts = readAccounts()
  let account = accounts.find(item => item.id === 'demo-member')
  if (!account) {
    account = {
      id: 'demo-member',
      name: '林跃',
      email: 'demo@yijianji.club',
      role: 'member',
      onboarded: true,
      tourPending: true,
      preferences: { ...defaultPreferences },
      createdAt: new Date().toISOString(),
      salt: 'demo',
      passwordHash: 'demo-only',
    }
    writeAccounts([...accounts, account])
  }
  saveSession(account.id, true)
  return toPublicUser(account)
}
