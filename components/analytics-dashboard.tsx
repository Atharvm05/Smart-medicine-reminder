"use client"

import { useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, TrendingDown, Target, Award, AlertTriangle } from "lucide-react"
import type { Medication, MedicationLog } from "@/app/page"

interface AnalyticsDashboardProps {
  medications: Medication[]
  logs: MedicationLog[]
}

export function AnalyticsDashboard({ medications, logs }: AnalyticsDashboardProps) {
  const analytics = useMemo(() => {
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date()
      date.setDate(date.getDate() - i)
      return date.toISOString().split("T")[0]
    }).reverse()

    const adherenceByDay = last7Days.map((date) => {
      const dayMedications = medications.flatMap((med) => med.times.map(() => med.id))
      const takenCount = logs.filter((log) => log.date === date && log.taken).length
      const totalCount = dayMedications.length
      return {
        date,
        adherence: totalCount > 0 ? (takenCount / totalCount) * 100 : 0,
        taken: takenCount,
        total: totalCount,
      }
    })

    const overallAdherence = adherenceByDay.reduce((sum, day) => sum + day.adherence, 0) / 7

    const medicationStats = medications.map((med) => {
      const medLogs = logs.filter((log) => log.medicationId === med.id)
      const totalDoses = medLogs.length
      const takenDoses = medLogs.filter((log) => log.taken).length
      const adherence = totalDoses > 0 ? (takenDoses / totalDoses) * 100 : 0

      return {
        medication: med,
        adherence,
        totalDoses,
        takenDoses,
        missedDoses: totalDoses - takenDoses,
      }
    })

    const moodTrends = logs
      .filter((log) => log.mood)
      .reduce(
        (acc, log) => {
          const date = log.date
          if (!acc[date]) acc[date] = []
          acc[date].push(log.mood!)
          return acc
        },
        {} as Record<string, number[]>,
      )

    const avgMoodByDay = Object.entries(moodTrends).map(([date, moods]) => ({
      date,
      avgMood: moods.reduce((sum, mood) => sum + mood, 0) / moods.length,
    }))

    return {
      adherenceByDay,
      overallAdherence,
      medicationStats,
      avgMoodByDay,
    }
  }, [medications, logs])

  return (
    <div className="space-y-8">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 border-green-500/20 backdrop-blur-xl shadow-2xl hover:shadow-green-500/20 transition-all duration-500 hover:scale-105">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-green-400">
              <Target className="h-5 w-5" />
              Overall Adherence
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-white mb-2">{Math.round(analytics.overallAdherence)}%</div>
            <Progress value={analytics.overallAdherence} className="h-2 bg-slate-700" />
            <p className="text-sm text-gray-400 mt-2">Last 7 days average</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 border-blue-500/20 backdrop-blur-xl shadow-2xl hover:shadow-blue-500/20 transition-all duration-500 hover:scale-105">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-blue-400">
              <Award className="h-5 w-5" />
              Streak
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-white mb-2">5 days</div>
            <p className="text-sm text-gray-400">Current adherence streak</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 border-yellow-500/20 backdrop-blur-xl shadow-2xl hover:shadow-yellow-500/20 transition-all duration-500 hover:scale-105">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-yellow-400">
              <TrendingUp className="h-5 w-5" />
              Improvement
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-white mb-2">+12%</div>
            <p className="text-sm text-gray-400">vs. last week</p>
          </CardContent>
        </Card>
      </div>

      {/* Weekly Adherence Chart */}
      <Card className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 border-cyan-500/20 backdrop-blur-xl shadow-2xl">
        <CardHeader>
          <CardTitle className="text-cyan-400">Weekly Adherence Trend</CardTitle>
          <CardDescription className="text-gray-400">Your medication adherence over the last 7 days</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {analytics.adherenceByDay.map((day, index) => (
              <div key={day.date} className="flex items-center gap-4">
                <div className="w-20 text-sm text-gray-400">
                  {new Date(day.date).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-white">{Math.round(day.adherence)}%</span>
                    <span className="text-xs text-gray-500">
                      {day.taken}/{day.total}
                    </span>
                  </div>
                  <Progress value={day.adherence} className="h-2 bg-slate-700" />
                </div>
                {day.adherence >= 90 ? (
                  <TrendingUp className="h-4 w-4 text-green-400" />
                ) : day.adherence >= 70 ? (
                  <TrendingUp className="h-4 w-4 text-yellow-400" />
                ) : (
                  <TrendingDown className="h-4 w-4 text-red-400" />
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Medication Performance */}
      <Card className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 border-purple-500/20 backdrop-blur-xl shadow-2xl">
        <CardHeader>
          <CardTitle className="text-purple-400">Medication Performance</CardTitle>
          <CardDescription className="text-gray-400">Individual adherence rates for each medication</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {analytics.medicationStats.map((stat) => (
              <div key={stat.medication.id} className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-4 h-4 rounded-full" style={{ backgroundColor: stat.medication.color }} />
                    <div>
                      <h4 className="font-semibold text-white">{stat.medication.name}</h4>
                      <p className="text-sm text-gray-400">{stat.medication.dosage}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-white">{Math.round(stat.adherence)}%</div>
                    <div className="text-xs text-gray-500">
                      {stat.takenDoses}/{stat.totalDoses} doses
                    </div>
                  </div>
                </div>
                <Progress value={stat.adherence} className="h-2 bg-slate-700" />
                <div className="flex gap-2">
                  {stat.adherence >= 90 && (
                    <Badge className="bg-green-500/20 text-green-400 border-green-500/30">Excellent</Badge>
                  )}
                  {stat.adherence >= 70 && stat.adherence < 90 && (
                    <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">Good</Badge>
                  )}
                  {stat.adherence < 70 && (
                    <Badge className="bg-red-500/20 text-red-400 border-red-500/30">
                      <AlertTriangle className="h-3 w-3 mr-1" />
                      Needs Attention
                    </Badge>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
