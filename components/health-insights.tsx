"use client"

import { useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Brain, TrendingUp, AlertTriangle, Lightbulb, Heart, Shield, Clock, Target, Zap, Activity } from "lucide-react"
import type { Medication, MedicationLog } from "@/app/page"

interface HealthInsightsProps {
  medications: Medication[]
  logs: MedicationLog[]
}

export function HealthInsights({ medications, logs }: HealthInsightsProps) {
  const insights = useMemo(() => {
    const adherenceRate = logs.length > 0 ? (logs.filter((log) => log.taken).length / logs.length) * 100 : 0

    const moodData = logs.filter((log) => log.mood).map((log) => log.mood!)
    const avgMood = moodData.length > 0 ? moodData.reduce((sum, mood) => sum + mood, 0) / moodData.length : 0

    const sideEffectsFrequency = logs
      .flatMap((log) => log.sideEffects || [])
      .reduce(
        (acc, effect) => {
          acc[effect] = (acc[effect] || 0) + 1
          return acc
        },
        {} as Record<string, number>,
      )

    const mostCommonSideEffect = Object.entries(sideEffectsFrequency).sort(([, a], [, b]) => b - a)[0]

    const medicationsByCategory = medications.reduce(
      (acc, med) => {
        acc[med.category] = (acc[med.category] || 0) + 1
        return acc
      },
      {} as Record<string, number>,
    )

    const upcomingRefills = medications
      .filter((med) => med.refillDate)
      .map((med) => ({
        medication: med,
        daysUntilRefill: Math.ceil(
          (new Date(med.refillDate!).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24),
        ),
      }))
      .filter((item) => item.daysUntilRefill <= 7)
      .sort((a, b) => a.daysUntilRefill - b.daysUntilRefill)

    return {
      adherenceRate,
      avgMood,
      mostCommonSideEffect,
      medicationsByCategory,
      upcomingRefills,
      totalMedications: medications.length,
      activeMedications: medications.filter((med) => !med.endDate || new Date(med.endDate) > new Date()).length,
    }
  }, [medications, logs])

  const aiRecommendations = [
    {
      type: "optimization",
      icon: Target,
      title: "Optimize Timing",
      description: "Consider taking your morning medications 30 minutes earlier for better absorption.",
      priority: "medium",
    },
    {
      type: "interaction",
      icon: Shield,
      title: "Drug Interaction Alert",
      description: "Monitor for potential interactions between Aspirin and Warfarin. Consult your doctor.",
      priority: "high",
    },
    {
      type: "adherence",
      icon: TrendingUp,
      title: "Adherence Improvement",
      description: "Your evening medication adherence has improved by 15% this week. Keep it up!",
      priority: "low",
    },
    {
      type: "refill",
      icon: Clock,
      title: "Refill Reminder",
      description: "You have 2 medications that need refilling within the next week.",
      priority: "medium",
    },
  ]

  return (
    <div className="space-y-8">
      {/* AI Health Score */}
      <Card className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 border-cyan-500/20 backdrop-blur-xl shadow-2xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-cyan-400">
            <Brain className="h-6 w-6" />
            AI Health Score
          </CardTitle>
          <CardDescription className="text-gray-400">
            Comprehensive analysis of your medication management
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-6 bg-gradient-to-br from-green-900/20 to-emerald-900/20 rounded-xl border border-green-500/20">
              <Activity className="h-8 w-8 text-green-400 mx-auto mb-3" />
              <div className="text-3xl font-bold text-white mb-1">{Math.round(insights.adherenceRate)}%</div>
              <p className="text-green-400 text-sm">Adherence Rate</p>
            </div>
            <div className="text-center p-6 bg-gradient-to-br from-blue-900/20 to-cyan-900/20 rounded-xl border border-blue-500/20">
              <Heart className="h-8 w-8 text-blue-400 mx-auto mb-3" />
              <div className="text-3xl font-bold text-white mb-1">{insights.avgMood.toFixed(1)}/3</div>
              <p className="text-blue-400 text-sm">Avg Mood</p>
            </div>
            <div className="text-center p-6 bg-gradient-to-br from-purple-900/20 to-pink-900/20 rounded-xl border border-purple-500/20">
              <Zap className="h-8 w-8 text-purple-400 mx-auto mb-3" />
              <div className="text-3xl font-bold text-white mb-1">92</div>
              <p className="text-purple-400 text-sm">Health Score</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* AI Recommendations */}
      <Card className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 border-yellow-500/20 backdrop-blur-xl shadow-2xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-yellow-400">
            <Lightbulb className="h-6 w-6" />
            AI Recommendations
          </CardTitle>
          <CardDescription className="text-gray-400">
            Personalized insights to improve your health outcomes
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {aiRecommendations.map((rec, index) => (
              <Alert
                key={index}
                className={`
                  border-l-4 transition-all duration-300 hover:scale-[1.02]
                  ${
                    rec.priority === "high"
                      ? "border-l-red-500 bg-red-900/10 border-red-500/20"
                      : rec.priority === "medium"
                        ? "border-l-yellow-500 bg-yellow-900/10 border-yellow-500/20"
                        : "border-l-green-500 bg-green-900/10 border-green-500/20"
                  }
                `}
              >
                <div className="flex items-start gap-3">
                  <rec.icon
                    className={`h-5 w-5 mt-0.5 ${
                      rec.priority === "high"
                        ? "text-red-400"
                        : rec.priority === "medium"
                          ? "text-yellow-400"
                          : "text-green-400"
                    }`}
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-semibold text-white">{rec.title}</h4>
                      <Badge
                        variant="secondary"
                        className={`
                          ${
                            rec.priority === "high"
                              ? "bg-red-500/20 text-red-400 border-red-500/30"
                              : rec.priority === "medium"
                                ? "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
                                : "bg-green-500/20 text-green-400 border-green-500/30"
                          }
                        `}
                      >
                        {rec.priority}
                      </Badge>
                    </div>
                    <AlertDescription className="text-gray-300">{rec.description}</AlertDescription>
                  </div>
                </div>
              </Alert>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Medication Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 border-purple-500/20 backdrop-blur-xl shadow-2xl">
          <CardHeader>
            <CardTitle className="text-purple-400">Medication Categories</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(insights.medicationsByCategory).map(([category, count]) => (
                <div key={category} className="flex items-center justify-between">
                  <span className="text-gray-300">{category}</span>
                  <Badge variant="secondary" className="bg-purple-500/20 text-purple-400">
                    {count}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 border-orange-500/20 backdrop-blur-xl shadow-2xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-orange-400">
              <Clock className="h-5 w-5" />
              Upcoming Refills
            </CardTitle>
          </CardHeader>
          <CardContent>
            {insights.upcomingRefills.length > 0 ? (
              <div className="space-y-3">
                {insights.upcomingRefills.map((item) => (
                  <div key={item.medication.id} className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-white">{item.medication.name}</p>
                      <p className="text-sm text-gray-400">{item.medication.dosage}</p>
                    </div>
                    <Badge
                      className={`
                        ${
                          item.daysUntilRefill <= 2
                            ? "bg-red-500/20 text-red-400 border-red-500/30"
                            : "bg-orange-500/20 text-orange-400 border-orange-500/30"
                        }
                      `}
                    >
                      {item.daysUntilRefill} days
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-400 text-center py-4">No upcoming refills</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Side Effects Analysis */}
      {insights.mostCommonSideEffect && (
        <Card className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 border-red-500/20 backdrop-blur-xl shadow-2xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-400">
              <AlertTriangle className="h-6 w-6" />
              Side Effects Analysis
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Alert className="border-red-500/20 bg-red-900/10">
              <AlertTriangle className="h-4 w-4 text-red-400" />
              <AlertDescription className="text-gray-300">
                Most reported side effect: <strong className="text-red-400">{insights.mostCommonSideEffect[0]}</strong>{" "}
                ({insights.mostCommonSideEffect[1]} times). Consider discussing this with your healthcare provider.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
