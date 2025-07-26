"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { AlertTriangle, ExternalLink, Database, Settings } from "lucide-react"

export function SetupInstructions() {
  const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID

  const openFirebaseConsole = () => {
    window.open(`https://console.firebase.google.com/project/${projectId}/firestore`, "_blank")
  }

  return (
    <Card className="mb-6 border-2 border-orange-300 bg-orange-50">
      <CardHeader>
        <CardTitle className="flex items-center text-orange-800">
          <AlertTriangle className="h-5 w-5 mr-2" />
          Database Setup Required
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="bg-white p-4 rounded-lg border border-orange-200">
          <h3 className="font-semibold text-orange-800 mb-3 flex items-center">
            <Database className="h-4 w-4 mr-2" />
            Enable Firestore Database
          </h3>

          <p className="text-sm text-orange-700 mb-4">
            Your Firebase project currently has <strong>Realtime Database</strong> enabled, but this application
            requires <strong>Firestore</strong>. Please follow these steps to enable Firestore:
          </p>

          <ol className="text-sm text-orange-700 space-y-2 list-decimal list-inside mb-4">
            <li>Click the button below to open Firebase Console</li>
            <li>You'll be taken to the Firestore section</li>
            <li>
              Click <strong>"Create database"</strong>
            </li>
            <li>
              Choose <strong>"Start in test mode"</strong> (for development)
            </li>
            <li>Select your preferred database location</li>
            <li>
              Click <strong>"Done"</strong>
            </li>
            <li>Come back here and test the connection</li>
          </ol>

          <Button onClick={openFirebaseConsole} className="w-full bg-orange-600 hover:bg-orange-700">
            <ExternalLink className="h-4 w-4 mr-2" />
            Open Firebase Console - Firestore
          </Button>
        </div>

        <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
          <h4 className="font-semibold text-blue-800 mb-2 flex items-center">
            <Settings className="h-4 w-4 mr-2" />
            Why Firestore?
          </h4>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• Better querying capabilities</li>
            <li>• Real-time updates</li>
            <li>• Better scalability</li>
            <li>• More structured data organization</li>
            <li>• Better offline support</li>
          </ul>
        </div>

        <div className="bg-gray-100 p-3 rounded-lg">
          <p className="text-xs text-gray-600">
            <strong>Note:</strong> You can have both Realtime Database and Firestore in the same project. Enabling
            Firestore won't affect your existing Realtime Database data.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
