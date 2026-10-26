import { useCallback, useEffect, useState } from 'react'
import type { Role } from '../data'
import {
  authenticateAccount,
  clearStoredSession,
  enterDemoAccount,
  getStoredUser,
  registerAccount,
  resetAccountPassword,
  updateAccount,
  type EvaluationUser,
  type TrainingPreferences,
} from '../lib/evaluation-auth'

export function useEvaluationAuth() {
  const [user, setUser] = useState<EvaluationUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    setUser(getStoredUser())
    setIsLoading(false)
  }, [])

  const signIn = useCallback(async (input: { email: string; password: string; remember: boolean }) => {
    const nextUser = await authenticateAccount(input)
    setUser(nextUser)
    return nextUser
  }, [])

  const signUp = useCallback(async (input: { name: string; email: string; password: string }) => {
    const nextUser = await registerAccount(input)
    setUser(nextUser)
    return nextUser
  }, [])

  const resetPassword = useCallback(async (input: { email: string; password: string }) => {
    await resetAccountPassword(input)
  }, [])

  const enterDemo = useCallback(() => {
    setUser(enterDemoAccount())
  }, [])

  const signOut = useCallback(() => {
    clearStoredSession()
    setUser(null)
  }, [])

  const completeOnboarding = useCallback((role: Role, preferences: TrainingPreferences) => {
    if (!user) return
    setUser(updateAccount(user.id, { role, preferences, onboarded: true, tourPending: true }))
  }, [user])

  const skipOnboarding = useCallback(() => {
    if (!user) return
    setUser(updateAccount(user.id, { onboarded: true, tourPending: false }))
  }, [user])

  const finishTour = useCallback(() => {
    if (!user || !user.tourPending) return
    setUser(updateAccount(user.id, { tourPending: false }))
  }, [user])

  return {
    user,
    isLoading,
    signIn,
    signUp,
    signOut,
    resetPassword,
    enterDemo,
    completeOnboarding,
    skipOnboarding,
    finishTour,
  }
}
