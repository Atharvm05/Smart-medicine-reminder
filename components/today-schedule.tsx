"use client"

import { useState, useEffect } from "react"
import { Clock, Check, AlertCircle, Pill, Heart, Frown, Meh, Smile } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import type { Medication, MedicationLog } from "@/app/page"

interface TodayScheduleProps {
  medications: Medication[]
  logs: MedicationLog[]
  onMarkAsTaken: (medicationId: string, date: string, time: string, mood?: number, sideEffects?: string[]) => void
}

interface ScheduleItem {
  medication: Medication
  time: string
  taken: boolean
  overdue: boolean
}

const moodOptions = [
  { value: 1, icon: Frown, label: "Poor", color: "text-red-400" },
  { value: 2, icon: Meh, label: "Okay", color: "text-yellow-400" },
  { value: 3, icon: Smile, label: "Good", color: "text-green-400" },
]

const commonSideEffects = ["Nausea", "Dizziness", "Headache", "Fatigue", "Stomach upset", "Drowsiness"]

export function TodaySchedule({ medications, logs, onMarkAsTaken }: TodayScheduleProps) {
  const [currentTime, setCurrentTime] = useState(new Date())
  const [selectedItem, setSelectedItem] = useState<ScheduleItem | null>(null)
  const [mood, setMood] = useState<number>(3)
  const [sideEffects, setSideEffects] = useState<string[]>([])

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 60000)

    return () => clearInterval(timer)
  }, [])

  const today = new Date().toISOString().split("T")[0]

  const todaySchedule: ScheduleItem[] = medications
    .flatMap((medication) =>
      medication.times.map((time) => {
        const log = logs.find((log) => log.medicationId === medication.id && log.date === today && log.time === time)

        const [hours, minutes] = time.split(":").map(Number)
        const scheduledTime = new Date()
        scheduledTime.setHours(hours, minutes, 0, 0)

        return {
          medication,
          time,
          taken: log?.taken || false,
          overdue: currentTime > scheduledTime && !log?.taken,
        }
      }),
    )
    .sort((a, b) => a.time.localeCompare(b.time))

  const handleMarkAsTaken = (item: ScheduleItem) => {
    setSelectedItem(item)
  }

  const confirmTaken = () => {
    if (selectedItem) {
      onMarkAsTaken(selectedItem.medication.id, today, selectedItem.time, mood, sideEffects)

      // Show notification
      if ("Notification" in window && Notification.permission === "granted") {
        new Notification(`${selectedItem.medication.name} logged successfully!`, {
          body: `${selectedItem.medication.dosage} taken at ${selectedItem.time}`,
          icon: "/pill-icon.png",
        })
      }

      setSelectedItem(null)
      setMood(3)
      setSideEffects([])
    }
  }

  if (todaySchedule.length === 0) {
    return (
      <Card className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 border-cyan-500/20 backdrop-blur-xl">
        <CardContent className="flex flex-col items-center justify-center py-16">
          <div className="relative mb-6">
            <Pill className="h-16 w-16 text-cyan-400 animate-pulse" />
            <div className="absolute inset-0 h-16 w-16 bg-cyan-400/20 rounded-full blur-xl animate-ping"></div>
          </div>
          <h3 className="text-2xl font-bold text-white mb-2">No medications scheduled</h3>
          <p className="text-gray-400 text-center max-w-md">
            Add your first medication to get started with AI-powered reminders and health tracking
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {todaySchedule.map((item, index) => (
        <Card
          key={`${item.medication.id}-${item.time}`}
          className={`
            relative overflow-hidden transition-all duration-500 hover:scale-[1.02] group
            ${
              item.taken
                ? "bg-gradient-to-br from-green-900/30 to-emerald-900/30 border-green-500/30 shadow-green-500/10"
                : item.overdue
                  ? "bg-gradient-to-br from-red-900/30 to-pink-900/30 border-red-500/30 shadow-red-500/10 animate-pulse"
                  : "bg-gradient-to-br from-slate-800/50 to-slate-900/50 border-cyan-500/20 backdrop-blur-xl"
            }
            shadow-2xl hover:shadow-xl
          `}
          style={{
            animationDelay: `${index * 100}ms`,
          }}
        >
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-6">
                <div className="relative">
                  <div
                    className="w-6 h-6 rounded-full shadow-lg animate-pulse"
                    style={{ backgroundColor: item.medication.color }}
                  />
                  <div
                    className="absolute inset-0 w-6 h-6 rounded-full blur opacity-50"
                    style={{ backgroundColor: item.medication.color }}
                  />
                </div>
                <div>
                  <h3 className="font-bold text-xl text-white group-hover:text-cyan-400 transition-colors">
                    {item.medication.name}
                  </h3>
                  <p className="text-gray-400 text-lg">{item.medication.dosage}</p>
                  <Badge variant="secondary" className="mt-2 bg-slate-700/50 text-cyan-400">
                    {item.medication.category}
                  </Badge>
                  {item.medication.instructions && (
                    <p className="text-sm text-gray-500 mt-2 max-w-md">{item.medication.instructions}</p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-6">
                <div className="text-right">
                  <div className="flex items-center gap-3 mb-2">
                    <Clock className="h-5 w-5 text-cyan-400" />
                    <span className="font-mono text-2xl text-white">{item.time}</span>
                  </div>
                  {item.taken && (
                    <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                      <Check className="h-3 w-3 mr-1" />
                      Completed
                    </Badge>
                  )}
                  {item.overdue && !item.taken && (
                    <Badge className="bg-red-500/20 text-red-400 border-red-500/30 animate-pulse">
                      <AlertCircle className="h-3 w-3 mr-1" />
                      Overdue
                    </Badge>
                  )}
                </div>

                {!item.taken && (
                  <Button
                    onClick={() => handleMarkAsTaken(item)}
                    className={`
                      relative overflow-hidden group/btn transition-all duration-300 hover:scale-105
                      ${
                        item.overdue
                          ? "bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700"
                          : "bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700"
                      }
                      shadow-lg
                    `}
                  >
                    <Check className="h-4 w-4 mr-2 group-hover/btn:animate-bounce" />
                    Mark as Taken
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer"></div>
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}

      {/* Enhanced Medication Logging Dialog */}
      <Dialog open={!!selectedItem} onOpenChange={() => setSelectedItem(null)}>
        <DialogContent className="bg-gradient-to-br from-slate-800 to-slate-900 border-cyan-500/20 text-white">
          <DialogHeader>
            <DialogTitle className="text-xl text-cyan-400">Log Medication</DialogTitle>
          </DialogHeader>
          {selectedItem && (
            <div className="space-y-6">
              <div className="text-center p-4 bg-slate-700/30 rounded-lg">
                <h3 className="text-lg font-semibold">{selectedItem.medication.name}</h3>
                <p className="text-gray-400">{selectedItem.medication.dosage}</p>
              </div>

              <div className="space-y-4">
                <Label className="text-cyan-400">How are you feeling?</Label>
                <div className="flex gap-4 justify-center">
                  {moodOptions.map((option) => (
                    <Button
                      key={option.value}
                      variant={mood === option.value ? "default" : "outline"}
                      onClick={() => setMood(option.value)}
                      className={`flex-col h-20 w-20 ${
                        mood === option.value
                          ? "bg-gradient-to-r from-cyan-500 to-purple-600"
                          : "border-slate-600 hover:border-cyan-500"
                      }`}
                    >
                      <option.icon className={`h-6 w-6 ${option.color}`} />
                      <span className="text-xs mt-1">{option.label}</span>
                    </Button>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <Label className="text-cyan-400">Any side effects? (Optional)</Label>
                <div className="grid grid-cols-2 gap-2">
                  {commonSideEffects.map((effect) => (
                    <div key={effect} className="flex items-center space-x-2">
                      <Checkbox
                        id={effect}
                        checked={sideEffects.includes(effect)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setSideEffects([...sideEffects, effect])
                          } else {
                            setSideEffects(sideEffects.filter((e) => e !== effect))
                          }
                        }}
                      />
                      <Label htmlFor={effect} className="text-sm text-gray-300">
                        {effect}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setSelectedItem(null)} className="flex-1">
                  Cancel
                </Button>
                <Button
                  onClick={confirmTaken}
                  className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
                >
                  <Heart className="h-4 w-4 mr-2" />
                  Confirm Taken
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
