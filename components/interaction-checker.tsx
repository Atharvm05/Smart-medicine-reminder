"use client"

import { useState, useMemo } from "react"
import { AlertTriangle, Shield, Info } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import type { Medication } from "@/app/page"

interface InteractionCheckerProps {
  medications: Medication[]
}

interface DrugInteraction {
  medication1: string
  medication2: string
  severity: "high" | "medium" | "low"
  description: string
  recommendation: string
}

// Simulated drug interaction database
const knownInteractions: DrugInteraction[] = [
  {
    medication1: "aspirin",
    medication2: "warfarin",
    severity: "high",
    description: "Increased risk of bleeding when taken together",
    recommendation: "Monitor INR levels closely and consult your doctor",
  },
  {
    medication1: "metformin",
    medication2: "alcohol",
    severity: "medium",
    description: "May increase risk of lactic acidosis",
    recommendation: "Limit alcohol consumption and monitor for symptoms",
  },
  {
    medication1: "lisinopril",
    medication2: "potassium",
    severity: "medium",
    description: "May cause hyperkalemia (high potassium levels)",
    recommendation: "Monitor potassium levels regularly",
  },
]

export function InteractionChecker({ medications }: InteractionCheckerProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  const interactions = useMemo(() => {
    const foundInteractions: DrugInteraction[] = []

    for (let i = 0; i < medications.length; i++) {
      for (let j = i + 1; j < medications.length; j++) {
        const med1 = medications[i].name.toLowerCase()
        const med2 = medications[j].name.toLowerCase()

        const interaction = knownInteractions.find(
          (int) =>
            (int.medication1 === med1 && int.medication2 === med2) ||
            (int.medication1 === med2 && int.medication2 === med1),
        )

        if (interaction) {
          foundInteractions.push({
            ...interaction,
            medication1: medications[i].name,
            medication2: medications[j].name,
          })
        }
      }
    }

    return foundInteractions
  }, [medications])

  const highRiskCount = interactions.filter((int) => int.severity === "high").length
  const mediumRiskCount = interactions.filter((int) => int.severity === "medium").length

  if (medications.length < 2) return null

  return (
    <Card className="fixed bottom-24 right-8 w-96 bg-gradient-to-br from-slate-800/90 to-slate-900/90 border-orange-500/20 backdrop-blur-xl shadow-2xl z-40">
      <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
        <CollapsibleTrigger asChild>
          <CardHeader className="cursor-pointer hover:bg-slate-700/20 transition-colors">
            <CardTitle className="flex items-center justify-between text-orange-400">
              <div className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Drug Interaction Checker
              </div>
              <div className="flex gap-2">
                {highRiskCount > 0 && (
                  <Badge className="bg-red-500/20 text-red-400 border-red-500/30 animate-pulse">
                    {highRiskCount} High Risk
                  </Badge>
                )}
                {mediumRiskCount > 0 && (
                  <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">
                    {mediumRiskCount} Medium Risk
                  </Badge>
                )}
                {interactions.length === 0 && (
                  <Badge className="bg-green-500/20 text-green-400 border-green-500/30">No Issues</Badge>
                )}
              </div>
            </CardTitle>
          </CardHeader>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <CardContent className="pt-0">
            {interactions.length === 0 ? (
              <Alert className="border-green-500/20 bg-green-900/10">
                <Shield className="h-4 w-4 text-green-400" />
                <AlertDescription className="text-gray-300">
                  No known drug interactions detected between your current medications.
                </AlertDescription>
              </Alert>
            ) : (
              <div className="space-y-4">
                {interactions.map((interaction, index) => (
                  <Alert
                    key={index}
                    className={`
                      ${
                        interaction.severity === "high"
                          ? "border-red-500/20 bg-red-900/10"
                          : interaction.severity === "medium"
                            ? "border-yellow-500/20 bg-yellow-900/10"
                            : "border-blue-500/20 bg-blue-900/10"
                      }
                    `}
                  >
                    <div className="flex items-start gap-3">
                      {interaction.severity === "high" ? (
                        <AlertTriangle className="h-4 w-4 text-red-400 mt-0.5" />
                      ) : interaction.severity === "medium" ? (
                        <AlertTriangle className="h-4 w-4 text-yellow-400 mt-0.5" />
                      ) : (
                        <Info className="h-4 w-4 text-blue-400 mt-0.5" />
                      )}
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="font-semibold text-white">
                            {interaction.medication1} + {interaction.medication2}
                          </span>
                          <Badge
                            className={`
                              ${
                                interaction.severity === "high"
                                  ? "bg-red-500/20 text-red-400 border-red-500/30"
                                  : interaction.severity === "medium"
                                    ? "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
                                    : "bg-blue-500/20 text-blue-400 border-blue-500/30"
                              }
                            `}
                          >
                            {interaction.severity} risk
                          </Badge>
                        </div>
                        <AlertDescription className="text-gray-300 mb-2">{interaction.description}</AlertDescription>
                        <div className="text-sm text-gray-400 bg-slate-700/30 p-2 rounded">
                          <strong>Recommendation:</strong> {interaction.recommendation}
                        </div>
                      </div>
                    </div>
                  </Alert>
                ))}

                <Alert className="border-cyan-500/20 bg-cyan-900/10">
                  <Info className="h-4 w-4 text-cyan-400" />
                  <AlertDescription className="text-gray-300">
                    Always consult with your healthcare provider before making any changes to your medication regimen.
                  </AlertDescription>
                </Alert>
              </div>
            )}
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  )
}
