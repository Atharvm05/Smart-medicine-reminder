"use client"

import { useState, useEffect } from "react"
import { Plus, Clock, Pill, Brain, Shield, Activity } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { AddMedicationDialog } from "@/components/add-medication-dialog"
import { MedicationList } from "@/components/medication-list"
import { TodaySchedule } from "@/components/today-schedule"
import { AnalyticsDashboard } from "@/components/analytics-dashboard"
import { HealthInsights } from "@/components/health-insights"
import { VoiceReminder } from "@/components/voice-reminder"
import { InteractionChecker } from "@/components/interaction-checker"

export interface Medication {
  id: string
  name: string
  dosage: string
  frequency: string
  times: string[]
  startDate: string
  endDate?: string
  instructions?: string
  color: string
  category: string
  sideEffects?: string[]
  refillDate?: string
}

export interface MedicationLog {
  medicationId: string
  date: string
  time: string
  taken: boolean
  takenAt?: string
  mood?: number
  sideEffects?: string[]
}

export default function MedicineReminderApp() {
  const [medications, setMedications] = useState<Medication[]>([])
  const [logs, setLogs] = useState<MedicationLog[]>([])
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [activeTab, setActiveTab] = useState<"today" | "medications" | "analytics" | "insights">("today")
  const [isLoading, setIsLoading] = useState(true)

  // Load data from localStorage on mount
  useEffect(() => {
    const savedMedications = localStorage.getItem("medications")
    const savedLogs = localStorage.getItem("medicationLogs")

    if (savedMedications) {
      setMedications(JSON.parse(savedMedications))
    }
    if (savedLogs) {
      setLogs(JSON.parse(savedLogs))
    }

    // Request notification permission
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission()
    }

    // Simulate loading
    setTimeout(() => setIsLoading(false), 1500)
  }, [])

  // Save to localStorage whenever data changes
  useEffect(() => {
    localStorage.setItem("medications", JSON.stringify(medications))
  }, [medications])

  useEffect(() => {
    localStorage.setItem("medicationLogs", JSON.stringify(logs))
  }, [logs])

  const addMedication = (medication: Omit<Medication, "id">) => {
    const newMedication: Medication = {
      ...medication,
      id: Date.now().toString(),
    }
    setMedications((prev) => [...prev, newMedication])
  }

  const updateMedication = (id: string, updates: Partial<Medication>) => {
    setMedications((prev) => prev.map((med) => (med.id === id ? { ...med, ...updates } : med)))
  }

  const deleteMedication = (id: string) => {
    setMedications((prev) => prev.filter((med) => med.id !== id))
    setLogs((prev) => prev.filter((log) => log.medicationId !== id))
  }

  const markAsTaken = (medicationId: string, date: string, time: string, mood?: number, sideEffects?: string[]) => {
    const logEntry: MedicationLog = {
      medicationId,
      date,
      time,
      taken: true,
      takenAt: new Date().toISOString(),
      mood,
      sideEffects,
    }

    setLogs((prev) => {
      const existing = prev.find((log) => log.medicationId === medicationId && log.date === date && log.time === time)

      if (existing) {
        return prev.map((log) =>
          log.medicationId === medicationId && log.date === date && log.time === time
            ? { ...log, taken: true, takenAt: new Date().toISOString(), mood, sideEffects }
            : log,
        )
      } else {
        return [...prev, logEntry]
      }
    })
  }

  const getTodayStats = () => {
    const today = new Date().toISOString().split("T")[0]
    const todayMedications = medications.flatMap((med) => med.times.map((time) => ({ ...med, scheduledTime: time })))

    const taken = logs.filter((log) => log.date === today && log.taken).length
    const total = todayMedications.length
    const percentage = total > 0 ? (taken / total) * 100 : 0

    return { taken, total, percentage }
  }

  const stats = getTodayStats()

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center space-y-6">
          <div className="relative">
            <div className="w-20 h-20 border-4 border-cyan-400/30 rounded-full animate-spin border-t-cyan-400"></div>
            <div className="absolute inset-0 w-20 h-20 border-4 border-purple-400/30 rounded-full blur-3xl animate-ping"></div>
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-white">Initializing MediCore AI</h2>
            <p className="text-cyan-400">Loading your health data...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>

      <div className="relative z-10 p-4">
        <div className="max-w-6xl mx-auto space-y-8">
          {/* Header */}
          <div className="text-center space-y-4 animate-fade-in">
            <div className="flex items-center justify-center gap-3 mb-6">
              <div className="relative p-4 bg-gradient-to-r from-cyan-500 to-purple-600 rounded-2xl shadow-2xl transform hover:scale-110 transition-all duration-300">
                <Pill className="h-10 w-10 text-white" />
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-purple-600 rounded-2xl blur opacity-50 animate-pulse"></div>
              </div>
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
                  MediCore AI
                </h1>
                <p className="text-cyan-300 text-sm">Next-Gen Health Management</p>
              </div>
            </div>
            <p className="text-gray-300 max-w-2xl mx-auto">
              Advanced AI-powered medication management with real-time health insights and predictive analytics
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 border-cyan-500/20 backdrop-blur-xl shadow-2xl hover:shadow-cyan-500/20 transition-all duration-500 hover:scale-105 group">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-cyan-400 text-sm font-medium">Today's Progress</p>
                    <p className="text-3xl font-bold text-white">{Math.round(stats.percentage)}%</p>
                  </div>
                  <Activity className="h-8 w-8 text-cyan-400 group-hover:animate-pulse" />
                </div>
                <Progress value={stats.percentage} className="mt-3 h-2 bg-slate-700" />
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 border-purple-500/20 backdrop-blur-xl shadow-2xl hover:shadow-purple-500/20 transition-all duration-500 hover:scale-105 group">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-purple-400 text-sm font-medium">Medications</p>
                    <p className="text-3xl font-bold text-white">{medications.length}</p>
                  </div>
                  <Pill className="h-8 w-8 text-purple-400 group-hover:animate-bounce" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 border-green-500/20 backdrop-blur-xl shadow-2xl hover:shadow-green-500/20 transition-all duration-500 hover:scale-105 group">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-green-400 text-sm font-medium">Adherence Rate</p>
                    <p className="text-3xl font-bold text-white">94%</p>
                  </div>
                  <Shield className="h-8 w-8 text-green-400 group-hover:animate-spin" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 border-yellow-500/20 backdrop-blur-xl shadow-2xl hover:shadow-yellow-500/20 transition-all duration-500 hover:scale-105 group">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-yellow-400 text-sm font-medium">AI Insights</p>
                    <p className="text-3xl font-bold text-white">12</p>
                  </div>
                  <Brain className="h-8 w-8 text-yellow-400 group-hover:animate-pulse" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Navigation */}
          <div className="flex flex-wrap gap-3 justify-center">
            {[
              { key: "today", label: "Today's Schedule", icon: Clock, color: "cyan" },
              { key: "medications", label: "My Medications", icon: Pill, color: "purple" },
              { key: "analytics", label: "Analytics", icon: Activity, color: "green" },
              { key: "insights", label: "AI Insights", icon: Brain, color: "yellow" },
            ].map((tab) => (
              <Button
                key={tab.key}
                variant={activeTab === tab.key ? "default" : "outline"}
                onClick={() => setActiveTab(tab.key as any)}
                className={`
                  relative overflow-hidden group transition-all duration-300 hover:scale-105
                  ${
                    activeTab === tab.key
                      ? `bg-gradient-to-r from-${tab.color}-500 to-${tab.color}-600 text-white shadow-lg shadow-${tab.color}-500/25`
                      : `border-${tab.color}-500/30 text-${tab.color}-400 hover:bg-${tab.color}-500/10`
                  }
                `}
              >
                <tab.icon className="h-4 w-4 mr-2 group-hover:animate-pulse" />
                {tab.label}
                {activeTab === tab.key && (
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer"></div>
                )}
              </Button>
            ))}
          </div>

          {/* Content */}
          <div className="animate-slide-in">
            {activeTab === "today" && (
              <TodaySchedule medications={medications} logs={logs} onMarkAsTaken={markAsTaken} />
            )}
            {activeTab === "medications" && (
              <MedicationList medications={medications} onUpdate={updateMedication} onDelete={deleteMedication} />
            )}
            {activeTab === "analytics" && <AnalyticsDashboard medications={medications} logs={logs} />}
            {activeTab === "insights" && <HealthInsights medications={medications} logs={logs} />}
          </div>

          {/* Floating Action Button */}
          <div className="fixed bottom-8 right-8 z-50">
            <Button
              onClick={() => setShowAddDialog(true)}
              size="lg"
              className="rounded-full w-16 h-16 bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700 shadow-2xl hover:shadow-cyan-500/25 transition-all duration-300 hover:scale-110 group"
            >
              <Plus className="h-6 w-6 group-hover:rotate-180 transition-transform duration-300" />
              <div className="absolute inset-0 rounded-full bg-gradient-to-r from-cyan-500 to-purple-600 blur opacity-50 animate-pulse"></div>
            </Button>
          </div>

          {/* Voice Reminder Component */}
          <VoiceReminder medications={medications} />

          {/* Interaction Checker */}
          <InteractionChecker medications={medications} />

          {/* Add Medication Dialog */}
          <AddMedicationDialog open={showAddDialog} onOpenChange={setShowAddDialog} onAdd={addMedication} />
        </div>
      </div>
    </div>
  )
}
