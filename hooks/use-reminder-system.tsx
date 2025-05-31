"use client"

import { useState, useEffect, useCallback } from "react"

interface ReminderQuestion {
  question: string
  answer: string
  explanation: string
  topic: string
  timeEstimate: string
  encouragement: string
  mnemonic: string
}

export function useReminderSystem() {
  const [isReminderOpen, setIsReminderOpen] = useState(false)
  const [currentQuestion, setCurrentQuestion] = useState<ReminderQuestion | null>(null)
  const [isEnabled, setIsEnabled] = useState(true)
  const [lastReminderTime, setLastReminderTime] = useState<number>(0)

  // Minimum time between reminders (in milliseconds)
  const REMINDER_INTERVAL = 5 * 60 * 1000 // 5 minutes
  const REMINDER_CHANCE = 0.3 // 30% chance when interval is met

  const fetchReminderQuestion = useCallback(async () => {
    try {
      const response = await fetch("/api/reminder-question")
      if (response.ok) {
        const question = await response.json()
        setCurrentQuestion(question)
        return question
      }
    } catch (error) {
      console.error("Error fetching reminder question:", error)
    }
    return null
  }, [])

  const showReminder = useCallback(async () => {
    if (!isEnabled || isReminderOpen) return

    const now = Date.now()
    const timeSinceLastReminder = now - lastReminderTime

    // Check if enough time has passed and random chance
    if (timeSinceLastReminder >= REMINDER_INTERVAL && Math.random() < REMINDER_CHANCE) {
      const question = await fetchReminderQuestion()
      if (question) {
        setCurrentQuestion(question)
        setIsReminderOpen(true)
        setLastReminderTime(now)

        // Store in localStorage to persist across sessions
        localStorage.setItem("lastReminderTime", now.toString())
      }
    }
  }, [isEnabled, isReminderOpen, lastReminderTime, fetchReminderQuestion])

  const closeReminder = useCallback(() => {
    setIsReminderOpen(false)
  }, [])

  const toggleReminders = useCallback((enabled: boolean) => {
    setIsEnabled(enabled)
    localStorage.setItem("remindersEnabled", enabled.toString())
  }, [])

  // Initialize from localStorage
  useEffect(() => {
    const savedEnabled = localStorage.getItem("remindersEnabled")
    const savedLastTime = localStorage.getItem("lastReminderTime")

    if (savedEnabled !== null) {
      setIsEnabled(savedEnabled === "true")
    }

    if (savedLastTime) {
      setLastReminderTime(Number.parseInt(savedLastTime, 10))
    }
  }, [])

  // Set up reminder checking
  useEffect(() => {
    if (!isEnabled) return

    // Check for reminders on user activity
    const handleUserActivity = () => {
      showReminder()
    }

    // Check on page focus, scroll, and click
    window.addEventListener("focus", handleUserActivity)
    window.addEventListener("scroll", handleUserActivity)
    window.addEventListener("click", handleUserActivity)

    // Also check periodically
    const interval = setInterval(showReminder, 60000) // Check every minute

    return () => {
      window.removeEventListener("focus", handleUserActivity)
      window.removeEventListener("scroll", handleUserActivity)
      window.removeEventListener("click", handleUserActivity)
      clearInterval(interval)
    }
  }, [isEnabled, showReminder])

  return {
    isReminderOpen,
    currentQuestion,
    closeReminder,
    isEnabled,
    toggleReminders,
    triggerReminder: showReminder, // Manual trigger for testing
  }
}
