"use client"

import { useState } from "react"
import { Edit, Trash2, Clock, Calendar, Pill } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { EditMedicationDialog } from "@/components/edit-medication-dialog"
import type { Medication } from "@/app/page"

interface MedicationListProps {
  medications: Medication[]
  onUpdate: (id: string, updates: Partial<Medication>) => void
  onDelete: (id: string) => void
}

export function MedicationList({ medications, onUpdate, onDelete }: MedicationListProps) {
  const [editingMedication, setEditingMedication] = useState<Medication | null>(null)

  if (medications.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Pill className="h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No medications added</h3>
          <p className="text-gray-600 text-center">
            Click the "Add Medication" button to start managing your medications
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {medications.map((medication) => (
        <Card key={medication.id}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-4 h-4 rounded-full" style={{ backgroundColor: medication.color }} />
                <div>
                  <CardTitle className="text-xl">{medication.name}</CardTitle>
                  <CardDescription>{medication.dosage}</CardDescription>
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => setEditingMedication(medication)}>
                  <Edit className="h-4 w-4" />
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="outline" size="sm">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete Medication</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to delete {medication.name}? This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={() => onDelete(medication.id)}>Delete</AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-gray-500" />
                <span className="text-sm text-gray-600">Frequency: {medication.frequency}</span>
              </div>

              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-gray-500" />
                <span className="text-sm text-gray-600">
                  Started: {new Date(medication.startDate).toLocaleDateString()}
                  {medication.endDate && ` - Ends: ${new Date(medication.endDate).toLocaleDateString()}`}
                </span>
              </div>

              <div>
                <p className="text-sm text-gray-600 mb-2">Reminder times:</p>
                <div className="flex flex-wrap gap-2">
                  {medication.times.map((time, index) => (
                    <Badge key={index} variant="secondary" className="font-mono">
                      {time}
                    </Badge>
                  ))}
                </div>
              </div>

              {medication.instructions && (
                <div>
                  <p className="text-sm text-gray-600 mb-1">Instructions:</p>
                  <p className="text-sm text-gray-800 bg-gray-50 p-2 rounded">{medication.instructions}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      ))}

      {editingMedication && (
        <EditMedicationDialog
          medication={editingMedication}
          open={!!editingMedication}
          onOpenChange={(open) => !open && setEditingMedication(null)}
          onUpdate={(updates) => {
            onUpdate(editingMedication.id, updates)
            setEditingMedication(null)
          }}
        />
      )}
    </div>
  )
}
