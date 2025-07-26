"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { testFirebaseConnection } from "@/lib/firebase-realtime"
import { testFirestoreConnection } from "@/lib/firebase"
import { useToast } from "@/hooks/use-toast"
import { Database, RefreshCw, CheckCircle, XCircle, AlertTriangle } from "lucide-react"

export function FirebaseDebug() {
  const [testing, setTesting] = useState(false)
  const [results, setResults] = useState<any>(null)
  const [firestoreTest, setFirestoreTest] = useState<any>(null)
  const { toast } = useToast()

  const runCollectionTest = async () => {
    setTesting(true)
    try {
      const results = await testFirebaseConnection()
      setResults(results)
      toast({
        title: "✅ Firebase Collection Test Successful",
        description: `Found ${results.appointments} appointments, ${results.helpRequests} help requests, ${results.users} users`,
      })
    } catch (error) {
      console.error("Firebase collection test failed:", error)
      toast({
        title: "❌ Firebase Collection Test Failed",
        description: "Check console for details",
        variant: "destructive",
      })
    } finally {
      setTesting(false)
    }
  }

  const runFirestoreTest = async () => {
    setTesting(true)
    try {
      const result = await testFirestoreConnection()
      setFirestoreTest(result)

      if (result.success) {
        toast({
          title: "✅ Firestore Connection Successful",
          description: "Firestore is working properly",
        })
      } else {
        toast({
          title: "❌ Firestore Connection Failed",
          description: result.error,
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Firestore test failed:", error)
      toast({
        title: "❌ Firestore Test Failed",
        description: "Check console for details",
        variant: "destructive",
      })
    } finally {
      setTesting(false)
    }
  }

  return (
    <Card className="mb-6 border-2 border-dashed border-blue-300">
      <CardHeader>
        <CardTitle className="flex items-center text-blue-700">
          <Database className="h-5 w-5 mr-2" />
          Firebase Connection Debug
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Important Notice */}
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
            <div className="flex items-start">
              <AlertTriangle className="h-5 w-5 text-orange-600 mr-2 mt-0.5" />
              <div>
                <h4 className="font-semibold text-orange-800">Database Configuration Issue</h4>
                <p className="text-sm text-orange-700 mt-1">
                  Your Firebase project is configured for <strong>Realtime Database</strong>, but this app uses{" "}
                  <strong>Firestore</strong>. You need to enable Firestore in your Firebase console.
                </p>
              </div>
            </div>
          </div>

          {/* Test Buttons */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button onClick={runFirestoreTest} disabled={testing} className="w-full">
              {testing ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Testing Firestore...
                </>
              ) : (
                <>
                  <Database className="h-4 w-4 mr-2" />
                  Test Firestore Connection
                </>
              )}
            </Button>

            <Button onClick={runCollectionTest} disabled={testing} variant="outline" className="w-full bg-transparent">
              {testing ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Testing Collections...
                </>
              ) : (
                <>
                  <Database className="h-4 w-4 mr-2" />
                  Test Collections
                </>
              )}
            </Button>
          </div>

          {/* Firestore Test Results */}
          {firestoreTest && (
            <div
              className={`p-4 rounded-lg ${firestoreTest.success ? "bg-green-50 border border-green-200" : "bg-red-50 border border-red-200"}`}
            >
              <div className="flex items-center mb-2">
                {firestoreTest.success ? (
                  <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
                ) : (
                  <XCircle className="h-5 w-5 text-red-600 mr-2" />
                )}
                <h4 className={`font-semibold ${firestoreTest.success ? "text-green-800" : "text-red-800"}`}>
                  Firestore Connection {firestoreTest.success ? "Successful" : "Failed"}
                </h4>
              </div>
              {firestoreTest.success ? (
                <p className="text-sm text-green-700">
                  Firestore is working properly. Test document created and read successfully.
                </p>
              ) : (
                <p className="text-sm text-red-700">Error: {firestoreTest.error}</p>
              )}
            </div>
          )}

          {/* Collection Test Results */}
          {results && (
            <div className="bg-green-50 border border-green-200 p-4 rounded-lg">
              <h4 className="font-semibold text-green-800 mb-2">Collection Results:</h4>
              <ul className="text-sm text-green-700 space-y-1">
                <li>• Appointments: {results.appointments}</li>
                <li>• Help Requests: {results.helpRequests}</li>
                <li>• Users: {results.users}</li>
              </ul>
            </div>
          )}

          {/* Setup Instructions */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-semibold text-blue-800 mb-2">Setup Instructions:</h4>
            <ol className="text-sm text-blue-700 space-y-1 list-decimal list-inside">
              <li>Go to your Firebase Console</li>
              <li>
                Select your project:{" "}
                <code className="bg-blue-100 px-1 rounded">{process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID}</code>
              </li>
              <li>Click on "Firestore Database" in the left sidebar</li>
              <li>Click "Create database"</li>
              <li>Choose "Start in test mode" for now</li>
              <li>Select a location for your database</li>
              <li>Click "Done"</li>
            </ol>
          </div>

          {/* Current Configuration */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <h4 className="font-semibold text-gray-800 mb-2">Current Configuration:</h4>
            <ul className="text-sm text-gray-700 space-y-1">
              <li>
                • Project ID:{" "}
                <code className="bg-gray-100 px-1 rounded">{process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID}</code>
              </li>
              <li>
                • Auth Domain:{" "}
                <code className="bg-gray-100 px-1 rounded">{process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN}</code>
              </li>
              <li>
                • Database Type: <span className="text-red-600 font-semibold">Realtime Database (needs Firestore)</span>
              </li>
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
