"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { collection, addDoc, doc, getDoc, serverTimestamp } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { useAuth } from "@/lib/auth-context"
import { ProtectedRoute } from "@/components/protected-route"
import { BottomNav } from "@/components/bottom-nav"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { ArrowLeft, Calendar, Clock, User, FileText, CheckCircle } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"

export default function BookAppointmentPage() {
  const { user } = useAuth()
  const { toast } = useToast()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [userInfo, setUserInfo] = useState({ name: "", phone: "" })
  const [formData, setFormData] = useState({
    appointeeName: "",
    appointeePhone: "",
    appointeeEmail: "",
    relationship: "",
    reason: "",
    department: "",
    preferredDate: "",
    preferredTime: "",
    additionalNotes: "",
  })

  useEffect(() => {
    const fetchUserInfo = async () => {
      if (user) {
        try {
          const userDoc = await getDoc(doc(db, "users", user.uid))
          if (userDoc.exists()) {
            const userData = userDoc.data()
            setUserInfo({
              name: userData.name || user.displayName || "",
              phone: userData.phone || "",
            })
            // Pre-fill with user's own info
            setFormData((prev) => ({
              ...prev,
              appointeeName: userData.name || user.displayName || "",
              appointeePhone: userData.phone || "",
              appointeeEmail: userData.email || user.email || "",
              relationship: "Self",
            }))
          }
        } catch (error) {
          console.error("Error fetching user info:", error)
        }
      }
    }
    fetchUserInfo()
  }, [user])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      console.log("🔥 Creating appointment with data:", {
        userId: user?.uid,
        bookerName: userInfo.name,
        appointeeName: formData.appointeeName,
        department: formData.department,
      })

      // Create appointment document with detailed logging
      const appointmentData = {
        userId: user?.uid,
        bookerName: userInfo.name,
        bookerPhone: userInfo.phone,
        bookerEmail: user?.email,
        appointeeName: formData.appointeeName,
        appointeePhone: formData.appointeePhone,
        appointeeEmail: formData.appointeeEmail,
        relationship: formData.relationship,
        reason: formData.reason,
        department: formData.department,
        preferredDate: formData.preferredDate,
        preferredTime: formData.preferredTime,
        additionalNotes: formData.additionalNotes,
        status: "Pending",
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      }

      console.log("🔥 Appointment data to be saved:", appointmentData)

      const docRef = await addDoc(collection(db, "appointments"), appointmentData)

      console.log("✅ Appointment created successfully with ID:", docRef.id)

      // Show success toast
      toast({
        title: "🎉 Appointment Booked Successfully!",
        description: `Your appointment for ${formData.appointeeName} has been submitted and is pending approval. ID: ${docRef.id.slice(-6)}`,
        duration: 6000,
      })

      // Reset form
      setFormData({
        appointeeName: userInfo.name,
        appointeePhone: userInfo.phone,
        appointeeEmail: user?.email || "",
        relationship: "Self",
        reason: "",
        department: "",
        preferredDate: "",
        preferredTime: "",
        additionalNotes: "",
      })

      // Navigate to requests page after a short delay
      setTimeout(() => {
        router.push("/requests")
      }, 2000)
    } catch (error) {
      console.error("❌ Error booking appointment:", error)
      toast({
        title: "❌ Error Booking Appointment",
        description: "There was an error submitting your appointment. Please try again.",
        variant: "destructive",
        duration: 5000,
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 pb-20">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-4 shadow-lg">
          <div className="flex items-center">
            <Link href="/home">
              <Button variant="ghost" size="sm" className="mr-3 text-white hover:bg-white/20">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <div>
              <h1 className="text-xl font-semibold">Book Appointment</h1>
              <p className="text-blue-100 text-sm">Schedule your appointment</p>
            </div>
          </div>
        </div>

        <div className="p-6">
          <Card className="shadow-lg border-0">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50">
              <CardTitle className="flex items-center text-gray-800">
                <Calendar className="h-5 w-5 mr-2 text-blue-600" />
                Appointment Details
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Debug Info */}
                <div className="bg-blue-50 p-3 rounded-lg text-sm">
                  <p>
                    <strong>User ID:</strong> {user?.uid}
                  </p>
                  <p>
                    <strong>User Email:</strong> {user?.email}
                  </p>
                  <p>
                    <strong>User Name:</strong> {userInfo.name}
                  </p>
                </div>

                {/* Appointee Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-800 flex items-center">
                    <User className="h-5 w-5 mr-2 text-blue-600" />
                    Appointee Information
                  </h3>

                  <div className="grid grid-cols-1 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="appointeeName" className="text-sm font-medium text-gray-700">
                        Full Name *
                      </Label>
                      <Input
                        id="appointeeName"
                        placeholder="Enter appointee's full name"
                        value={formData.appointeeName}
                        onChange={(e) => setFormData({ ...formData, appointeeName: e.target.value })}
                        className="h-11"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="appointeePhone" className="text-sm font-medium text-gray-700">
                        Phone Number *
                      </Label>
                      <Input
                        id="appointeePhone"
                        type="tel"
                        placeholder="Enter phone number"
                        value={formData.appointeePhone}
                        onChange={(e) => setFormData({ ...formData, appointeePhone: e.target.value })}
                        className="h-11"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="appointeeEmail" className="text-sm font-medium text-gray-700">
                        Email Address
                      </Label>
                      <Input
                        id="appointeeEmail"
                        type="email"
                        placeholder="Enter email address"
                        value={formData.appointeeEmail}
                        onChange={(e) => setFormData({ ...formData, appointeeEmail: e.target.value })}
                        className="h-11"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="relationship" className="text-sm font-medium text-gray-700">
                        Relationship *
                      </Label>
                      <Select
                        value={formData.relationship}
                        onValueChange={(value:string) => setFormData({ ...formData, relationship: value })}
                      >
                        <SelectTrigger className="h-11">
                          <SelectValue placeholder="Select relationship" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Self">Self</SelectItem>
                          <SelectItem value="Family Member">Family Member</SelectItem>
                          <SelectItem value="Friend">Friend</SelectItem>
                          <SelectItem value="Colleague">Colleague</SelectItem>
                          <SelectItem value="Other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                {/* Appointment Details */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-800 flex items-center">
                    <FileText className="h-5 w-5 mr-2 text-blue-600" />
                    Appointment Details
                  </h3>

                  <div className="space-y-2">
                    <Label htmlFor="department" className="text-sm font-medium text-gray-700">
                      Department *
                    </Label>
                    <Select
                      value={formData.department}
                      onValueChange={(value:string) => setFormData({ ...formData, department: value })}
                    >
                      <SelectTrigger className="h-11">
                        <SelectValue placeholder="Select department" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="General Consultation">General Consultation</SelectItem>
                        <SelectItem value="Medical">Medical</SelectItem>
                        <SelectItem value="Legal">Legal</SelectItem>
                        <SelectItem value="Educational">Educational</SelectItem>
                        <SelectItem value="Social Services">Social Services</SelectItem>
                        <SelectItem value="Technical Support">Technical Support</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="reason" className="text-sm font-medium text-gray-700">
                      Reason for Appointment *
                    </Label>
                    <Textarea
                      id="reason"
                      placeholder="Please describe the reason for your appointment"
                      value={formData.reason}
                      onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                      className="min-h-[100px]"
                      required
                    />
                  </div>
                </div>

                {/* Schedule */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-800 flex items-center">
                    <Clock className="h-5 w-5 mr-2 text-blue-600" />
                    Preferred Schedule
                  </h3>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="date" className="text-sm font-medium text-gray-700">
                        Preferred Date *
                      </Label>
                      <Input
                        id="date"
                        type="date"
                        value={formData.preferredDate}
                        onChange={(e) => setFormData({ ...formData, preferredDate: e.target.value })}
                        min={new Date().toISOString().split("T")[0]}
                        className="h-11"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="time" className="text-sm font-medium text-gray-700">
                        Preferred Time *
                      </Label>
                      <Input
                        id="time"
                        type="time"
                        value={formData.preferredTime}
                        onChange={(e) => setFormData({ ...formData, preferredTime: e.target.value })}
                        className="h-11"
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* Additional Notes */}
                <div className="space-y-2">
                  <Label htmlFor="additionalNotes" className="text-sm font-medium text-gray-700">
                    Additional Notes
                  </Label>
                  <Textarea
                    id="additionalNotes"
                    placeholder="Any additional information or special requirements"
                    value={formData.additionalNotes}
                    onChange={(e) => setFormData({ ...formData, additionalNotes: e.target.value })}
                    className="min-h-[80px]"
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full h-12 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium"
                  disabled={loading}
                >
                  {loading ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Booking Appointment...
                    </div>
                  ) : (
                    <div className="flex items-center">
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Book Appointment
                    </div>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
      <BottomNav />
    </ProtectedRoute>
  )
}
