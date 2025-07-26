"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/lib/auth-context"
import { ProtectedRoute } from "@/components/protected-route"
import { BottomNav } from "@/components/bottom-nav"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import {
  Calendar,
  HelpCircle,
  Clock,
  CheckCircle,
  XCircle,
  User,
  Phone,
  Mail,
  AlertCircle,
  RefreshCw,
  Filter,
} from "lucide-react"
import { subscribeToUserAppointments, subscribeToUserHelpRequests } from "@/lib/firebase-realtime"

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

export default function MyRequestsPage() {
  const { user } = useAuth()
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [helpRequests, setHelpRequests] = useState<HelpRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<"all" | "pending" | "approved" | "rejected">("all")
  const [connectionStatus, setConnectionStatus] = useState<"connecting" | "connected" | "error">("connecting")

  useEffect(() => {
    if (!user) return

    console.log("🔥 Setting up user bookings subscriptions for:", user.uid)
    setLoading(true)
    setConnectionStatus("connecting")

    // Subscribe to real-time appointments for this user
    const unsubscribeAppointments = subscribeToUserAppointments(user.uid, (appointmentsData) => {
      console.log("📅 User received appointments:", appointmentsData.length)
      setAppointments(appointmentsData)
      setConnectionStatus("connected")
      setLoading(false)
    })

    // Subscribe to real-time help requests for this user
    const unsubscribeHelpRequests = subscribeToUserHelpRequests(user.uid, (helpRequestsData) => {
      console.log("🆘 User received help requests:", helpRequestsData.length)
      setHelpRequests(helpRequestsData)
      setConnectionStatus("connected")
      setLoading(false)
    })

    // Cleanup subscriptions
    return () => {
      console.log("🧹 Cleaning up user subscriptions...")
      unsubscribeAppointments()
      unsubscribeHelpRequests()
    }
  }, [user])

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
      return timestamp.toDate().toLocaleDateString()
    } catch {
      return "N/A"
    }
  }

  const formatDateTime = (timestamp: any) => {
    if (!timestamp) return "N/A"
    try {
      return timestamp.toDate().toLocaleString()
    } catch {
      return "N/A"
    }
  }

  const filterData = (data: any[]) => {
    if (filter === "all") return data
    return data.filter((item) => item.status.toLowerCase() === filter)
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
      <ProtectedRoute>
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 pb-20 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading your bookings...</p>
            <p className="text-gray-500 text-sm mt-2">Connecting to real-time updates...</p>
          </div>
        </div>
      </ProtectedRoute>
    )
  }

  const filteredAppointments = filterData(appointments)
  const filteredHelpRequests = filterData(helpRequests)

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 pb-20">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white p-4 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-semibold">My Bookings</h1>
              <p className="text-purple-100 text-sm">Track all your appointments and requests</p>
            </div>
            <div className="flex items-center space-x-1 bg-white/20 px-3 py-1 rounded-full">
              <div
                className={`w-2 h-2 ${getConnectionStatusColor()} rounded-full ${connectionStatus === "connected" ? "animate-pulse" : ""}`}
              ></div>
              <span className="text-xs">{getConnectionStatusText()}</span>
            </div>
          </div>
        </div>

        <div className="p-6">
          {/* Filter Buttons */}
          <div className="flex flex-wrap gap-2 mb-6">
            <Button
              variant={filter === "all" ? "default" : "outline"}
              size="sm"
              onClick={() => setFilter("all")}
              className="flex items-center"
            >
              <Filter className="h-3 w-3 mr-1" />
              All ({appointments.length + helpRequests.length})
            </Button>
            <Button
              variant={filter === "pending" ? "default" : "outline"}
              size="sm"
              onClick={() => setFilter("pending")}
              className="flex items-center"
            >
              <Clock className="h-3 w-3 mr-1" />
              Pending (
              {appointments.filter((a) => a.status === "Pending").length +
                helpRequests.filter((h) => h.status === "Pending").length}
              )
            </Button>
            <Button
              variant={filter === "approved" ? "default" : "outline"}
              size="sm"
              onClick={() => setFilter("approved")}
              className="flex items-center"
            >
              <CheckCircle className="h-3 w-3 mr-1" />
              Approved (
              {appointments.filter((a) => a.status === "Approved").length +
                helpRequests.filter((h) => h.status === "Approved").length}
              )
            </Button>
            <Button
              variant={filter === "rejected" ? "default" : "outline"}
              size="sm"
              onClick={() => setFilter("rejected")}
              className="flex items-center"
            >
              <XCircle className="h-3 w-3 mr-1" />
              Rejected (
              {appointments.filter((a) => a.status === "Rejected").length +
                helpRequests.filter((h) => h.status === "Rejected").length}
              )
            </Button>
          </div>

          <Tabs defaultValue="appointments" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="appointments" className="flex items-center space-x-2">
                <Calendar className="h-4 w-4" />
                <span>Appointments ({filteredAppointments.length})</span>
              </TabsTrigger>
              <TabsTrigger value="help" className="flex items-center space-x-2">
                <HelpCircle className="h-4 w-4" />
                <span>Help Requests ({filteredHelpRequests.length})</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="appointments" className="space-y-4">
              {filteredAppointments.length === 0 ? (
                <Card className="shadow-lg border-0">
                  <CardContent className="p-8 text-center">
                    <Calendar className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-700 mb-2">
                      {filter === "all" ? "No appointments found" : `No ${filter} appointments`}
                    </h3>
                    <p className="text-gray-500">
                      {filter === "all"
                        ? "Your appointment bookings will appear here"
                        : `Your ${filter} appointments will appear here`}
                    </p>
                  </CardContent>
                </Card>
              ) : (
                filteredAppointments.map((appointment) => (
                  <Card key={appointment.id} className="shadow-lg border-0 hover:shadow-xl transition-shadow">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg flex items-center">
                          <Calendar className="h-5 w-5 mr-2 text-blue-600" />
                          {appointment.department}
                        </CardTitle>
                        <div className="flex items-center space-x-2">
                          <Badge className={`${getStatusColor(appointment.status)} border`}>
                            {getStatusIcon(appointment.status)}
                            <span className="ml-1">{appointment.status}</span>
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            #{appointment.id.slice(-6)}
                          </Badge>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 gap-3">
                        <div className="flex items-center text-sm">
                          <User className="h-4 w-4 mr-2 text-gray-500" />
                          <span className="font-medium">Appointee:</span>
                          <span className="ml-2">{appointment.appointeeName}</span>
                          {appointment.relationship !== "Self" && (
                            <Badge variant="outline" className="ml-2 text-xs">
                              {appointment.relationship}
                            </Badge>
                          )}
                        </div>

                        <div className="flex items-center text-sm">
                          <Phone className="h-4 w-4 mr-2 text-gray-500" />
                          <span>{appointment.appointeePhone}</span>
                        </div>

                        {appointment.appointeeEmail && (
                          <div className="flex items-center text-sm">
                            <Mail className="h-4 w-4 mr-2 text-gray-500" />
                            <span>{appointment.appointeeEmail}</span>
                          </div>
                        )}
                      </div>

                      <div className="bg-gray-50 p-3 rounded-lg">
                        <p className="text-sm text-gray-700 mb-2">
                          <strong>Reason:</strong> {appointment.reason}
                        </p>
                        {appointment.additionalNotes && (
                          <p className="text-sm text-gray-600">
                            <strong>Notes:</strong> {appointment.additionalNotes}
                          </p>
                        )}
                      </div>

                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center text-gray-600">
                          <Calendar className="h-4 w-4 mr-2" />
                          {appointment.preferredDate}
                        </div>
                        <div className="flex items-center text-gray-600">
                          <Clock className="h-4 w-4 mr-2" />
                          {appointment.preferredTime}
                        </div>
                      </div>

                      <div className="text-xs text-gray-500 border-t pt-2 space-y-1">
                        <p>Submitted: {formatDateTime(appointment.createdAt)}</p>
                        {appointment.updatedAt && <p>Last updated: {formatDateTime(appointment.updatedAt)}</p>}
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </TabsContent>

            <TabsContent value="help" className="space-y-4">
              {filteredHelpRequests.length === 0 ? (
                <Card className="shadow-lg border-0">
                  <CardContent className="p-8 text-center">
                    <HelpCircle className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-700 mb-2">
                      {filter === "all" ? "No help requests found" : `No ${filter} help requests`}
                    </h3>
                    <p className="text-gray-500">
                      {filter === "all"
                        ? "Your help requests will appear here"
                        : `Your ${filter} help requests will appear here`}
                    </p>
                  </CardContent>
                </Card>
              ) : (
                filteredHelpRequests.map((request) => (
                  <Card key={request.id} className="shadow-lg border-0 hover:shadow-xl transition-shadow">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg flex items-center">
                          <HelpCircle className="h-5 w-5 mr-2 text-green-600" />
                          {request.helpType}
                        </CardTitle>
                        <div className="flex items-center space-x-2">
                          <Badge className={getUrgencyColor(request.urgencyLevel)}>
                            <AlertCircle className="h-3 w-3 mr-1" />
                            {request.urgencyLevel}
                          </Badge>
                          <Badge className={`${getStatusColor(request.status)} border`}>
                            {getStatusIcon(request.status)}
                            <span className="ml-1">{request.status}</span>
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            #{request.id.slice(-6)}
                          </Badge>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <p className="text-sm text-gray-700">
                          <strong>Description:</strong>
                        </p>
                        <p className="text-sm text-gray-600 mt-1">{request.description}</p>
                      </div>

                      <div className="grid grid-cols-1 gap-2 text-sm">
                        <div className="flex items-center">
                          <span className="font-medium text-gray-700 w-32">Contact via:</span>
                          <span className="text-gray-600">{request.contactPreference}</span>
                        </div>

                        {request.additionalContact && (
                          <div className="flex items-center">
                            <span className="font-medium text-gray-700 w-32">Alt. Contact:</span>
                            <span className="text-gray-600">{request.additionalContact}</span>
                          </div>
                        )}
                      </div>

                      <div className="text-xs text-gray-500 border-t pt-2 space-y-1">
                        <p>Submitted: {formatDateTime(request.createdAt)}</p>
                        {request.updatedAt && <p>Last updated: {formatDateTime(request.updatedAt)}</p>}
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
      <BottomNav />
    </ProtectedRoute>
  )
}
