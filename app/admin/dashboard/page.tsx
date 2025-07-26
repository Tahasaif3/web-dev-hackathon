"use client"

import { useState, useEffect } from "react"
import { doc, updateDoc, serverTimestamp } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { AdminProtectedRoute } from "@/components/admin-protected-route"
import { FirebaseDebug } from "@/components/firebase-debug"
import { SetupInstructions } from "@/components/setup-instructions"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"
import {
  Calendar,
  HelpCircle,
  Users,
  Clock,
  CheckCircle,
  XCircle,
  LogOut,
  Phone,
  Mail,
  AlertCircle,
  Shield,
  RefreshCw,
  Eye,
  Database,
} from "lucide-react"
import { subscribeToAllAppointments, subscribeToAllHelpRequests } from "@/lib/firebase-realtime"

interface Appointment {
  id: string
  userId: string
  bookerName: string
  bookerPhone: string
  bookerEmail: string
  appointeeName: string
  appointeePhone: string
  appointeeEmail: string
  relationship: string
  reason: string
  department: string
  preferredDate: string
  preferredTime: string
  additionalNotes: string
  status: string
  createdAt: any
  updatedAt: any
}

interface HelpRequest {
  id: string
  userId: string
  name: string
  phone: string
  email: string
  helpType: string
  urgencyLevel: string
  description: string
  contactPreference: string
  additionalContact: string
  status: string
  createdAt: any
  updatedAt: any
}

export default function AdminDashboard() {
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [helpRequests, setHelpRequests] = useState<HelpRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState<string | null>(null)
  const [connectionStatus, setConnectionStatus] = useState<"connecting" | "connected" | "error">("connecting")
  const [firestoreEnabled, setFirestoreEnabled] = useState<boolean | null>(null)
  const { toast } = useToast()
  const router = useRouter()

  const [stats, setStats] = useState({
    totalAppointments: 0,
    totalHelpRequests: 0,
    pendingAppointments: 0,
    approvedAppointments: 0,
    rejectedAppointments: 0,
    pendingHelpRequests: 0,
    approvedHelpRequests: 0,
    rejectedHelpRequests: 0,
  })

  useEffect(() => {
    console.log("🔥 Admin dashboard initializing...")
    setConnectionStatus("connecting")

    // Test Firestore connection first
    const testFirestore = async () => {
      try {
        const { testFirestoreConnection } = await import("@/lib/firebase")
        const result = await testFirestoreConnection()
        setFirestoreEnabled(result.success)

        if (!result.success) {
          console.log("❌ Firestore not enabled, stopping initialization")
          setLoading(false)
          setConnectionStatus("error")
          return
        }
      } catch (error) {
        console.error("❌ Error testing Firestore:", error)
        setFirestoreEnabled(false)
        setLoading(false)
        setConnectionStatus("error")
        return
      }
    }

    testFirestore()

    let appointmentsReceived = false
    let helpRequestsReceived = false

    // Subscribe to real-time appointments
    const unsubscribeAppointments = subscribeToAllAppointments((appointmentsData) => {
      console.log("📅 Admin received appointments:", appointmentsData.length, appointmentsData)
      setAppointments(appointmentsData)
      appointmentsReceived = true

      if (helpRequestsReceived || helpRequests.length === 0) {
        calculateStats(appointmentsData, helpRequests)
        setConnectionStatus("connected")
        setLoading(false)
      }
    })

    const unsubscribeHelpRequests = subscribeToAllHelpRequests((helpRequestsData) => {
      console.log("🆘 Admin received help requests:", helpRequestsData.length, helpRequestsData)
      setHelpRequests(helpRequestsData)
      helpRequestsReceived = true

      if (appointmentsReceived || appointments.length === 0) {
        calculateStats(appointments, helpRequestsData)
        setConnectionStatus("connected")
        setLoading(false)
      }
    })

    // Set a timeout to stop loading after 10 seconds
    const timeout = setTimeout(() => {
      console.log("⏰ Admin dashboard timeout - stopping loading")
      setLoading(false)
      if (connectionStatus === "connecting") {
        setConnectionStatus("error")
      }
    }, 10000)

    // Cleanup subscriptions
    return () => {
      console.log("🧹 Cleaning up admin subscriptions...")
      clearTimeout(timeout)
      unsubscribeAppointments()
      unsubscribeHelpRequests()
    }
  }, [])

  const calculateStats = (appointmentsData: any[], helpRequestsData: any[]) => {
    const newStats = {
      totalAppointments: appointmentsData.length,
      totalHelpRequests: helpRequestsData.length,
      pendingAppointments: appointmentsData.filter((a) => a.status === "Pending").length,
      approvedAppointments: appointmentsData.filter((a) => a.status === "Approved").length,
      rejectedAppointments: appointmentsData.filter((a) => a.status === "Rejected").length,
      pendingHelpRequests: helpRequestsData.filter((h) => h.status === "Pending").length,
      approvedHelpRequests: helpRequestsData.filter((h) => h.status === "Approved").length,
      rejectedHelpRequests: helpRequestsData.filter((h) => h.status === "Rejected").length,
    }

    console.log("📊 Updated admin stats:", newStats)
    setStats(newStats)
  }

  const updateStatus = async (collectionName: string, id: string, newStatus: string) => {
    console.log(`🔄 Updating ${collectionName}/${id} to ${newStatus}`)
    setUpdating(id)

    try {
      await updateDoc(doc(db, collectionName, id), {
        status: newStatus,
        updatedAt: serverTimestamp(),
        updatedBy: "admin",
        adminAction: {
          action: newStatus,
          timestamp: serverTimestamp(),
          admin: localStorage.getItem("adminUsername") || "admin",
        },
      })

      toast({
        title: "✅ Status Updated Successfully!",
        description: `Request has been ${newStatus.toLowerCase()} by admin`,
        duration: 4000,
      })

      console.log(`✅ Successfully updated ${collectionName}/${id} to ${newStatus}`)
    } catch (error) {
      console.error("❌ Error updating status:", error)
      toast({
        title: "❌ Error Updating Status",
        description: "Please try again. Check your connection.",
        variant: "destructive",
        duration: 5000,
      })
    } finally {
      setUpdating(null)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem("adminLoggedIn")
    localStorage.removeItem("adminUsername")
    toast({
      title: "👋 Logged out successfully",
      description: "You have been signed out of admin panel",
    })
    router.push("/admin/login")
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Approved":
        return "bg-green-100 text-green-800 border-green-200"
      case "Rejected":
        return "bg-red-100 text-red-800 border-red-200"
      case "In Progress":
        return "bg-blue-100 text-blue-800 border-blue-200"
      default:
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Approved":
        return <CheckCircle className="h-4 w-4" />
      case "Rejected":
        return <XCircle className="h-4 w-4" />
      case "In Progress":
        return <RefreshCw className="h-4 w-4" />
      default:
        return <Clock className="h-4 w-4" />
    }
  }

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case "Emergency":
        return "bg-red-100 text-red-800"
      case "High":
        return "bg-orange-100 text-orange-800"
      case "Medium":
        return "bg-yellow-100 text-yellow-800"
      default:
        return "bg-green-100 text-green-800"
    }
  }

  const formatDate = (timestamp: any) => {
    if (!timestamp) return "N/A"
    try {
      return timestamp.toDate().toLocaleString()
    } catch {
      return "N/A"
    }
  }

  const getConnectionStatusColor = () => {
    switch (connectionStatus) {
      case "connected":
        return "bg-green-400"
      case "error":
        return "bg-red-400"
      default:
        return "bg-yellow-400"
    }
  }

  const getConnectionStatusText = () => {
    switch (connectionStatus) {
      case "connected":
        return "Live"
      case "error":
        return "Error"
      default:
        return "Connecting"
    }
  }

  if (loading) {
    return (
      <AdminProtectedRoute>
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-400 mx-auto mb-4"></div>
            <p className="text-white">Loading admin dashboard...</p>
            <p className="text-purple-300 text-sm mt-2">Connecting to Firebase...</p>
            <p className="text-purple-400 text-xs mt-1">This may take a few seconds...</p>
          </div>
        </div>
      </AdminProtectedRoute>
    )
  }

  return (
    <AdminProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white p-6 shadow-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Shield className="h-8 w-8 mr-3" />
              <div>
                <h1 className="text-2xl font-bold">Admin Dashboard</h1>
                <p className="text-purple-100">Saylani Booking System - Real-time Management</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-1 bg-white/20 px-3 py-1 rounded-full">
                <div
                  className={`w-2 h-2 ${getConnectionStatusColor()} rounded-full ${connectionStatus === "connected" ? "animate-pulse" : ""}`}
                ></div>
                <span className="text-xs">{getConnectionStatusText()}</span>
              </div>
              <Button
                onClick={handleLogout}
                variant="outline"
                className="bg-white/10 border-white/20 text-white hover:bg-white/20"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>

        <div className="p-6">
          {/* Show setup instructions if Firestore is not enabled */}
          {/* {firestoreEnabled === false && <SetupInstructions />} */}

          {/* Debug Component */}
          {/* <FirebaseDebug /> */}

          {/* Debug Info */}
          {/* <Card className="mb-6 border-2 border-dashed border-orange-300">
            <CardHeader>
              <CardTitle className="flex items-center text-orange-700">
                <Database className="h-5 w-5 mr-2" />
                Debug Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p>
                    <strong>Connection Status:</strong> {connectionStatus}
                  </p>
                  <p>
                    <strong>Firestore Enabled:</strong>{" "}
                    {firestoreEnabled === null ? "Testing..." : firestoreEnabled ? "Yes" : "No"}
                  </p>
                  <p>
                    <strong>Appointments Loaded:</strong> {appointments.length}
                  </p>
                  <p>
                    <strong>Help Requests Loaded:</strong> {helpRequests.length}
                  </p>
                </div>
                <div>
                  <p>
                    <strong>Loading State:</strong> {loading ? "Loading" : "Complete"}
                  </p>
                  <p>
                    <strong>Project ID:</strong> {process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID}
                  </p>
                  <p>
                    <strong>Last Update:</strong> {new Date().toLocaleTimeString()}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card> */}

          {/* Real-time Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card className="shadow-lg border-0 hover:shadow-xl transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Appointments</p>
                    <p className="text-3xl font-bold text-gray-900">{stats.totalAppointments}</p>
                    <p className="text-xs text-gray-500 mt-1">All time bookings</p>
                  </div>
                  <div className="p-3 rounded-full bg-blue-100">
                    <Calendar className="h-6 w-6 text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-lg border-0 hover:shadow-xl transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Help Requests</p>
                    <p className="text-3xl font-bold text-gray-900">{stats.totalHelpRequests}</p>
                    <p className="text-xs text-gray-500 mt-1">All help requests</p>
                  </div>
                  <div className="p-3 rounded-full bg-green-100">
                    <HelpCircle className="h-6 w-6 text-green-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-lg border-0 hover:shadow-xl transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Pending Appointments</p>
                    <p className="text-3xl font-bold text-yellow-600">{stats.pendingAppointments}</p>
                    <p className="text-xs text-gray-500 mt-1">Awaiting approval</p>
                  </div>
                  <div className="p-3 rounded-full bg-yellow-100">
                    <Clock className="h-6 w-6 text-yellow-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-lg border-0 hover:shadow-xl transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Pending Help Requests</p>
                    <p className="text-3xl font-bold text-orange-600">{stats.pendingHelpRequests}</p>
                    <p className="text-xs text-gray-500 mt-1">Need attention</p>
                  </div>
                  <div className="p-3 rounded-full bg-orange-100">
                    <AlertCircle className="h-6 w-6 text-orange-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Status Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <Card className="shadow-lg border-0">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Calendar className="h-5 w-5 mr-2 text-blue-600" />
                  Appointment Status Overview
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-2 bg-green-50 rounded">
                    <span className="text-sm font-medium text-gray-700">Approved</span>
                    <Badge className="bg-green-100 text-green-800">{stats.approvedAppointments}</Badge>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-yellow-50 rounded">
                    <span className="text-sm font-medium text-gray-700">Pending</span>
                    <Badge className="bg-yellow-100 text-yellow-800">{stats.pendingAppointments}</Badge>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-red-50 rounded">
                    <span className="text-sm font-medium text-gray-700">Rejected</span>
                    <Badge className="bg-red-100 text-red-800">{stats.rejectedAppointments}</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-lg border-0">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <HelpCircle className="h-5 w-5 mr-2 text-green-600" />
                  Help Request Status Overview
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-2 bg-green-50 rounded">
                    <span className="text-sm font-medium text-gray-700">Approved</span>
                    <Badge className="bg-green-100 text-green-800">{stats.approvedHelpRequests}</Badge>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-yellow-50 rounded">
                    <span className="text-sm font-medium text-gray-700">Pending</span>
                    <Badge className="bg-yellow-100 text-yellow-800">{stats.pendingHelpRequests}</Badge>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-red-50 rounded">
                    <span className="text-sm font-medium text-gray-700">Rejected</span>
                    <Badge className="bg-red-100 text-red-800">{stats.rejectedHelpRequests}</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Real-time Data Management */}
          <Card className="shadow-lg border-0">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Manage Requests - Real-time</span>
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <Eye className="h-4 w-4" />
                  <span>Live Updates Active</span>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="appointments" className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-6">
                  <TabsTrigger value="appointments" className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4" />
                    <span>Appointments ({appointments.length})</span>
                  </TabsTrigger>
                  <TabsTrigger value="help" className="flex items-center space-x-2">
                    <HelpCircle className="h-4 w-4" />
                    <span>Help Requests ({helpRequests.length})</span>
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="appointments" className="space-y-4">
                  {appointments.length === 0 ? (
                    <div className="text-center py-12">
                      <Calendar className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-gray-700 mb-2">No appointments found</h3>
                      <p className="text-gray-500">New appointments will appear here automatically</p>
                      <p className="text-gray-400 text-sm mt-2">Connection Status: {connectionStatus}</p>
                      {firestoreEnabled === false && (
                        <p className="text-red-500 text-sm mt-2">⚠️ Firestore database not enabled</p>
                      )}
                    </div>
                  ) : (
                    appointments.map((appointment) => (
                      <Card key={appointment.id} className="border border-gray-200 hover:shadow-md transition-shadow">
                        <CardContent className="p-6">
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex-1">
                              <div className="flex items-center mb-3">
                                <h3 className="text-lg font-semibold text-gray-900">{appointment.appointeeName}</h3>
                                {appointment.relationship !== "Self" && (
                                  <Badge variant="outline" className="ml-2">
                                    {appointment.relationship}
                                  </Badge>
                                )}
                                <Badge variant="outline" className="ml-2 text-xs">
                                  ID: {appointment.id.slice(-6)}
                                </Badge>
                              </div>

                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm mb-4">
                                <div className="flex items-center">
                                  <Phone className="h-4 w-4 mr-2 text-gray-500" />
                                  <span>{appointment.appointeePhone}</span>
                                </div>
                                {appointment.appointeeEmail && (
                                  <div className="flex items-center">
                                    <Mail className="h-4 w-4 mr-2 text-gray-500" />
                                    <span>{appointment.appointeeEmail}</span>
                                  </div>
                                )}
                                <div className="flex items-center">
                                  <Calendar className="h-4 w-4 mr-2 text-gray-500" />
                                  <span>
                                    {appointment.preferredDate} at {appointment.preferredTime}
                                  </span>
                                </div>
                                <div className="flex items-center">
                                  <Users className="h-4 w-4 mr-2 text-gray-500" />
                                  <span>{appointment.department}</span>
                                </div>
                              </div>

                              <div className="bg-gray-50 p-3 rounded-lg mb-3">
                                <p className="text-sm text-gray-700">
                                  <strong>Reason:</strong> {appointment.reason}
                                </p>
                                {appointment.additionalNotes && (
                                  <p className="text-sm text-gray-600 mt-1">
                                    <strong>Notes:</strong> {appointment.additionalNotes}
                                  </p>
                                )}
                              </div>

                              <div className="text-xs text-gray-500 space-y-1">
                                <p>
                                  <strong>Booked by:</strong> {appointment.bookerName} ({appointment.bookerPhone})
                                </p>
                                <p>
                                  <strong>Submitted:</strong> {formatDate(appointment.createdAt)}
                                </p>
                                {appointment.updatedAt && (
                                  <p>
                                    <strong>Last updated:</strong> {formatDate(appointment.updatedAt)}
                                  </p>
                                )}
                              </div>
                            </div>

                            <div className="flex flex-col items-end space-y-3 ml-4">
                              <Badge className={`${getStatusColor(appointment.status)} border`}>
                                {getStatusIcon(appointment.status)}
                                <span className="ml-1">{appointment.status}</span>
                              </Badge>

                              {appointment.status === "Pending" && (
                                <div className="flex flex-col space-y-2">
                                  <Button
                                    size="sm"
                                    onClick={() => updateStatus("appointments", appointment.id, "Approved")}
                                    disabled={updating === appointment.id}
                                    className="bg-green-600 hover:bg-green-700 text-white min-w-[100px]"
                                  >
                                    {updating === appointment.id ? (
                                      <RefreshCw className="h-4 w-4 mr-1 animate-spin" />
                                    ) : (
                                      <CheckCircle className="h-4 w-4 mr-1" />
                                    )}
                                    Approve
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="destructive"
                                    onClick={() => updateStatus("appointments", appointment.id, "Rejected")}
                                    disabled={updating === appointment.id}
                                    className="min-w-[100px]"
                                  >
                                    {updating === appointment.id ? (
                                      <RefreshCw className="h-4 w-4 mr-1 animate-spin" />
                                    ) : (
                                      <XCircle className="h-4 w-4 mr-1" />
                                    )}
                                    Reject
                                  </Button>
                                </div>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </TabsContent>

                <TabsContent value="help" className="space-y-4">
                  {helpRequests.length === 0 ? (
                    <div className="text-center py-12">
                      <HelpCircle className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-gray-700 mb-2">No help requests found</h3>
                      <p className="text-gray-500">New help requests will appear here automatically</p>
                      <p className="text-gray-400 text-sm mt-2">Connection Status: {connectionStatus}</p>
                      {firestoreEnabled === false && (
                        <p className="text-red-500 text-sm mt-2">⚠️ Firestore database not enabled</p>
                      )}
                    </div>
                  ) : (
                    helpRequests.map((request) => (
                      <Card key={request.id} className="border border-gray-200 hover:shadow-md transition-shadow">
                        <CardContent className="p-6">
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex-1">
                              <div className="flex items-center mb-3">
                                <h3 className="text-lg font-semibold text-gray-900">{request.name}</h3>
                                <Badge className={`ml-2 ${getUrgencyColor(request.urgencyLevel)}`}>
                                  <AlertCircle className="h-3 w-3 mr-1" />
                                  {request.urgencyLevel}
                                </Badge>
                                <Badge variant="outline" className="ml-2 text-xs">
                                  ID: {request.id.slice(-6)}
                                </Badge>
                              </div>

                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm mb-4">
                                <div className="flex items-center">
                                  <Phone className="h-4 w-4 mr-2 text-gray-500" />
                                  <span>{request.phone}</span>
                                </div>
                                <div className="flex items-center">
                                  <Mail className="h-4 w-4 mr-2 text-gray-500" />
                                  <span>{request.email}</span>
                                </div>
                                <div className="flex items-center">
                                  <HelpCircle className="h-4 w-4 mr-2 text-gray-500" />
                                  <span>{request.helpType}</span>
                                </div>
                                <div className="flex items-center">
                                  <span className="text-gray-500 text-xs">
                                    Contact via: {request.contactPreference}
                                  </span>
                                </div>
                              </div>

                              <div className="bg-gray-50 p-3 rounded-lg mb-3">
                                <p className="text-sm text-gray-700">
                                  <strong>Description:</strong> {request.description}
                                </p>
                                {request.additionalContact && (
                                  <p className="text-sm text-gray-600 mt-1">
                                    <strong>Alt. Contact:</strong> {request.additionalContact}
                                  </p>
                                )}
                              </div>

                              <div className="text-xs text-gray-500 space-y-1">
                                <p>
                                  <strong>Submitted:</strong> {formatDate(request.createdAt)}
                                </p>
                                {request.updatedAt && (
                                  <p>
                                    <strong>Last updated:</strong> {formatDate(request.updatedAt)}
                                  </p>
                                )}
                              </div>
                            </div>

                            <div className="flex flex-col items-end space-y-3 ml-4">
                              <Badge className={`${getStatusColor(request.status)} border`}>
                                {getStatusIcon(request.status)}
                                <span className="ml-1">{request.status}</span>
                              </Badge>

                              {request.status === "Pending" && (
                                <div className="flex flex-col space-y-2">
                                  <Button
                                    size="sm"
                                    onClick={() => updateStatus("helpRequests", request.id, "Approved")}
                                    disabled={updating === request.id}
                                    className="bg-green-600 hover:bg-green-700 text-white min-w-[100px]"
                                  >
                                    {updating === request.id ? (
                                      <RefreshCw className="h-4 w-4 mr-1 animate-spin" />
                                    ) : (
                                      <CheckCircle className="h-4 w-4 mr-1" />
                                    )}
                                    Approve
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="destructive"
                                    onClick={() => updateStatus("helpRequests", request.id, "Rejected")}
                                    disabled={updating === request.id}
                                    className="min-w-[100px"
                                  >
                                    {updating === request.id ? (
                                      <RefreshCw className="h-4 w-4 mr-1 animate-spin" />
                                    ) : (
                                      <XCircle className="h-4 w-4 mr-1" />
                                    )}
                                    Reject
                                  </Button>
                                </div>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminProtectedRoute>
  )
}
