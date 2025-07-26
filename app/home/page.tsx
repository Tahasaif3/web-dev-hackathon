"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/lib/auth-context"
import { ProtectedRoute } from "@/components/protected-route"
import { BottomNav } from "@/components/bottom-nav"
import { StatsCard } from "@/components/ui/stats-card"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Calendar, HelpCircle, FileText, Settings, Clock, CheckCircle, XCircle, Users } from "lucide-react"
import Link from "next/link"
import { subscribeToUserAppointments, subscribeToUserHelpRequests } from "@/lib/firebase-realtime"

export default function HomePage() {
  const { user } = useAuth()
  const [stats, setStats] = useState({
    totalAppointments: 0,
    pendingAppointments: 0,
    totalHelpRequests: 0,
    pendingHelpRequests: 0,
  })
  const [recentBookings, setRecentBookings] = useState<any[]>([])

  useEffect(() => {
    if (!user) return

    // Subscribe to real-time appointments
    const unsubscribeAppointments = subscribeToUserAppointments(user.uid, (appointments) => {
      const pendingCount = appointments.filter((a) => a.status === "Pending").length
      setStats((prev) => ({
        ...prev,
        totalAppointments: appointments.length,
        pendingAppointments: pendingCount,
      }))

      // Update recent bookings
      updateRecentBookings(appointments, null)
    })

    // Subscribe to real-time help requests
    const unsubscribeHelpRequests = subscribeToUserHelpRequests(user.uid, (helpRequests) => {
      const pendingCount = helpRequests.filter((h) => h.status === "Pending").length
      setStats((prev) => ({
        ...prev,
        totalHelpRequests: helpRequests.length,
        pendingHelpRequests: pendingCount,
      }))

      // Update recent bookings
      updateRecentBookings(null, helpRequests)
    })

    let appointmentsCache: any[] = []
    let helpRequestsCache: any[] = []

    const updateRecentBookings = (appointments: any[] | null, helpRequests: any[] | null) => {
      if (appointments !== null) appointmentsCache = appointments
      if (helpRequests !== null) helpRequestsCache = helpRequests

      const allBookings = [...appointmentsCache, ...helpRequestsCache]
        .filter((booking) => booking.createdAt)
        .sort((a, b) => {
          if (a.createdAt && b.createdAt) {
            return b.createdAt.toDate() - a.createdAt.toDate()
          }
          return 0
        })
        .slice(0, 3)

      setRecentBookings(allBookings)
    }

    // Cleanup subscriptions
    return () => {
      unsubscribeAppointments()
      unsubscribeHelpRequests()
    }
  }, [user])

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Approved":
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case "Rejected":
        return <XCircle className="h-4 w-4 text-red-600" />
      default:
        return <Clock className="h-4 w-4 text-yellow-600" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Approved":
        return "text-green-600 bg-green-50"
      case "Rejected":
        return "text-red-600 bg-red-50"
      default:
        return "text-yellow-600 bg-yellow-50"
    }
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 pb-20">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6 rounded-b-3xl shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold">Welcome back!</h1>
              <p className="text-blue-100">{user?.displayName || "User"}</p>
            </div>
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
              <Users className="h-6 w-6 text-white" />
            </div>
          </div>
          <p className="text-blue-100">Manage your appointments and requests easily</p>
        </div>

        <div className="p-6 space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-2 gap-4">
            <StatsCard
              title="Total Appointments"
              value={stats.totalAppointments}
              icon={Calendar}
              color="text-blue-600"
              bgColor="bg-blue-100"
            />
            <StatsCard
              title="Pending"
              value={stats.pendingAppointments}
              icon={Clock}
              color="text-yellow-600"
              bgColor="bg-yellow-100"
            />
            <StatsCard
              title="Help Requests"
              value={stats.totalHelpRequests}
              icon={HelpCircle}
              color="text-green-600"
              bgColor="bg-green-100"
            />
            <StatsCard
              title="Pending Help"
              value={stats.pendingHelpRequests}
              icon={Clock}
              color="text-orange-600"
              bgColor="bg-orange-100"
            />
          </div>

          {/* Quick Actions */}
          <Card className="shadow-lg border-0">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-gray-800">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <Link href="/book">
                  <Button className="w-full h-20 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white flex flex-col items-center justify-center space-y-2">
                    <Calendar className="h-6 w-6" />
                    <span className="text-sm font-medium">Book Appointment</span>
                  </Button>
                </Link>

                <Link href="/help">
                  <Button className="w-full h-20 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white flex flex-col items-center justify-center space-y-2">
                    <HelpCircle className="h-6 w-6" />
                    <span className="text-sm font-medium">Request Help</span>
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card className="shadow-lg border-0">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-gray-800 flex items-center">
                Recent Activity
                <div className="ml-2 w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {recentBookings.length === 0 ? (
                <div className="text-center py-8">
                  <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No recent activity</p>
                  <p className="text-sm text-gray-500">Your bookings will appear here</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {recentBookings.map((booking, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex items-center space-x-3">
                        {booking.reason ? (
                          <Calendar className="h-5 w-5 text-blue-600" />
                        ) : (
                          <HelpCircle className="h-5 w-5 text-green-600" />
                        )}
                        <div>
                          <p className="font-medium text-gray-900">
                            {booking.reason ? "Appointment" : `Help - ${booking.helpType}`}
                          </p>
                          <p className="text-sm text-gray-600">{booking.appointeeName || booking.name}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(booking.status)}
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(booking.status)}`}
                        >
                          {booking.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Navigation Cards */}
          <div className="grid grid-cols-1 gap-4">
            <Link href="/requests">
              <Card className="hover:shadow-lg transition-shadow cursor-pointer border-0">
                <CardContent className="p-4 flex items-center">
                  <FileText className="h-6 w-6 text-purple-600 mr-4" />
                  <div>
                    <h3 className="font-semibold text-gray-900">My Bookings</h3>
                    <p className="text-sm text-gray-600">View all your appointments and requests</p>
                  </div>
                </CardContent>
              </Card>
            </Link>

            <Link href="/settings">
              <Card className="hover:shadow-lg transition-shadow cursor-pointer border-0">
                <CardContent className="p-4 flex items-center">
                  <Settings className="h-6 w-6 text-gray-600 mr-4" />
                  <div>
                    <h3 className="font-semibold text-gray-900">Settings</h3>
                    <p className="text-sm text-gray-600">Manage your account and preferences</p>
                  </div>
                </CardContent>
              </Card>
            </Link>
          </div>
        </div>
      </div>
      <BottomNav />
    </ProtectedRoute>
  )
}
