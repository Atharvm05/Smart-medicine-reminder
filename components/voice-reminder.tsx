"use client"

import type React from "react"

import { useState, useEffect, useCallback, useRef } from "react"
import { Mic, MicOff, Volume2, Bell, BellOff, GripVertical } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import type { Medication } from "@/app/page"

interface VoiceReminderProps {
  medications: Medication[]
}

export function VoiceReminder({ medications }: VoiceReminderProps) {
  const [isListening, setIsListening] = useState(false)
  const [voiceEnabled, setVoiceEnabled] = useState(false)
  const [lastCommand, setLastCommand] = useState<string>("")
  const [autoRemindersEnabled, setAutoRemindersEnabled] = useState(true)
  const [lastReminderTime, setLastReminderTime] = useState<string>("")

  const [isDragging, setIsDragging] = useState(false)
  const [position, setPosition] = useState({ x: 32, y: window.innerHeight - 400 }) // bottom-left initial position
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })
  const cardRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Check if speech synthesis is supported
    if ("speechSynthesis" in window) {
      setVoiceEnabled(true)
    }
  }, [])

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!cardRef.current) return

    const rect = cardRef.current.getBoundingClientRect()
    setDragOffset({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    })
    setIsDragging(true)
  }

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!isDragging) return

      const newX = e.clientX - dragOffset.x
      const newY = e.clientY - dragOffset.y

      // Keep within viewport bounds
      const maxX = window.innerWidth - 320 // card width
      const maxY = window.innerHeight - 300 // approximate card height

      setPosition({
        x: Math.max(0, Math.min(newX, maxX)),
        y: Math.max(0, Math.min(newY, maxY)),
      })
    },
    [isDragging, dragOffset],
  )

  const handleMouseUp = useCallback(() => {
    setIsDragging(false)
  }, [])

  useEffect(() => {
    if (isDragging) {
      document.addEventListener("mousemove", handleMouseMove)
      document.addEventListener("mouseup", handleMouseUp)
      document.body.style.userSelect = "none" // Prevent text selection while dragging
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove)
      document.removeEventListener("mouseup", handleMouseUp)
      document.body.style.userSelect = ""
    }
  }, [isDragging, handleMouseMove, handleMouseUp])

  const speakReminder = useCallback(
    (medication: Medication, time: string) => {
      if (!voiceEnabled) return

      const utterance = new SpeechSynthesisUtterance(
        `Time to take your ${medication.name}, ${medication.dosage}. ${medication.instructions || "Please take as prescribed."}`,
      )
      utterance.rate = 0.8
      utterance.pitch = 1
      utterance.volume = 0.9
      speechSynthesis.speak(utterance)
    },
    [voiceEnabled],
  )

  const checkForScheduledMedications = useCallback(() => {
    if (!autoRemindersEnabled || !voiceEnabled) return

    const now = new Date()
    const currentTime = `${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}`

    // Avoid duplicate reminders for the same minute
    if (currentTime === lastReminderTime) return

    const currentMedications = medications.filter((med) => med.times.includes(currentTime))

    if (currentMedications.length > 0) {
      setLastReminderTime(currentTime)

      // Speak a general reminder first
      const generalReminder = new SpeechSynthesisUtterance(
        `Medication reminder! You have ${currentMedications.length} medication${currentMedications.length > 1 ? "s" : ""} to take now.`,
      )
      generalReminder.rate = 0.8
      generalReminder.pitch = 1
      generalReminder.volume = 0.9
      speechSynthesis.speak(generalReminder)

      // Then speak each medication individually with a delay
      currentMedications.forEach((med, index) => {
        setTimeout(
          () => {
            speakReminder(med, currentTime)
          },
          (index + 1) * 3000,
        ) // 3 second delay between each medication
      })

      // Show browser notification as well
      if ("Notification" in window && Notification.permission === "granted") {
        new Notification("Medication Reminder", {
          body: `Time to take: ${currentMedications.map((m) => m.name).join(", ")}`,
          icon: "/favicon.ico",
        })
      }
    }
  }, [medications, autoRemindersEnabled, voiceEnabled, lastReminderTime, speakReminder])

  useEffect(() => {
    if (!autoRemindersEnabled) return

    const interval = setInterval(checkForScheduledMedications, 60000) // Check every minute

    // Also check immediately when component mounts or medications change
    checkForScheduledMedications()

    return () => clearInterval(interval)
  }, [checkForScheduledMedications, autoRemindersEnabled])

  useEffect(() => {
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission()
    }
  }, [])

  const startListening = () => {
    if (!("webkitSpeechRecognition" in window) && !("SpeechRecognition" in window)) {
      alert("Speech recognition not supported in this browser")
      return
    }

    const SpeechRecognition = window.webkitSpeechRecognition || window.SpeechRecognition
    const recognition = new SpeechRecognition()

    recognition.continuous = false
    recognition.interimResults = false
    recognition.lang = "en-US"

    recognition.onstart = () => {
      setIsListening(true)
    }

    recognition.onresult = (event) => {
      const command = event.results[0][0].transcript.toLowerCase()
      setLastCommand(command)

      // Process voice commands
      if (command.includes("remind me") || command.includes("medication")) {
        const now = new Date()
        const currentTime = `${now.getHours().toString().padStart(2, "0")}:${now
          .getMinutes()
          .toString()
          .padStart(2, "0")}`

        const currentMedications = medications.filter((med) => med.times.includes(currentTime))

        if (currentMedications.length > 0) {
          currentMedications.forEach((med) => speakReminder(med, currentTime))
        } else {
          const utterance = new SpeechSynthesisUtterance("No medications scheduled for this time.")
          speechSynthesis.speak(utterance)
        }
      }
    }

    recognition.onerror = (event) => {
      console.error("Speech recognition error:", event.error)
      setIsListening(false)
    }

    recognition.onend = () => {
      setIsListening(false)
    }

    recognition.start()
  }

  const testVoiceReminder = () => {
    if (medications.length > 0) {
      speakReminder(medications[0], "now")
    } else {
      const utterance = new SpeechSynthesisUtterance("No medications found. Please add your medications first.")
      speechSynthesis.speak(utterance)
    }
  }

  if (!voiceEnabled) return null

  return (
    <Card
      ref={cardRef}
      className={`fixed w-80 bg-gradient-to-br from-slate-800/90 to-slate-900/90 border-cyan-500/20 backdrop-blur-xl shadow-2xl z-40 transition-all duration-200 ${
        isDragging ? "scale-105 shadow-cyan-500/20 shadow-2xl cursor-grabbing" : "cursor-grab hover:shadow-cyan-500/10"
      }`}
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        transform: isDragging ? "rotate(2deg)" : "rotate(0deg)",
      }}
    >
      <CardContent className="p-4">
        <div
          className="flex items-center justify-between mb-3 cursor-grab active:cursor-grabbing"
          onMouseDown={handleMouseDown}
        >
          <div className="flex items-center gap-2">
            <GripVertical className="h-4 w-4 text-gray-400 hover:text-cyan-400 transition-colors" />
            <h3 className="font-semibold text-cyan-400">Voice Assistant</h3>
          </div>
          <Badge variant="secondary" className="bg-cyan-500/20 text-cyan-400">
            AI Powered
          </Badge>
        </div>

        <div className="flex items-center justify-between mb-3 p-2 bg-slate-700/30 rounded-lg">
          <div className="flex items-center gap-2">
            {autoRemindersEnabled ? (
              <Bell className="h-4 w-4 text-green-400" />
            ) : (
              <BellOff className="h-4 w-4 text-gray-400" />
            )}
            <span className="text-sm text-gray-300">Auto Reminders</span>
          </div>
          <Switch
            checked={autoRemindersEnabled}
            onCheckedChange={setAutoRemindersEnabled}
            className="data-[state=checked]:bg-cyan-500"
          />
        </div>

        <div className="flex gap-2 mb-3">
          <Button
            onClick={startListening}
            disabled={isListening}
            size="sm"
            className={`flex-1 ${
              isListening
                ? "bg-red-500 hover:bg-red-600 animate-pulse"
                : "bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700"
            }`}
          >
            {isListening ? <MicOff className="h-4 w-4 mr-2" /> : <Mic className="h-4 w-4 mr-2" />}
            {isListening ? "Listening..." : "Voice Command"}
          </Button>

          <Button onClick={testVoiceReminder} size="sm" variant="outline" className="border-cyan-500/30 bg-transparent">
            <Volume2 className="h-4 w-4" />
          </Button>
        </div>

        {lastCommand && (
          <div className="text-xs text-gray-400 bg-slate-700/30 p-2 rounded mb-2">Last: "{lastCommand}"</div>
        )}

        <div className="text-xs text-gray-500 space-y-1">
          <p>• Drag me anywhere on screen</p>
          <p>• Automatic voice reminders at scheduled times</p>
          <p>• Say "remind me about medication" for manual check</p>
          <p>• Test button plays sample reminder</p>
        </div>
      </CardContent>
    </Card>
  )
}
