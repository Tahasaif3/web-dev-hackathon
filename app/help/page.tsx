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
import { ArrowLeft, HelpCircle, User, AlertCircle, CheckCircle } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"

export default function RequestHelpPage() {
  const { user } = useAuth()
  const { toast } = useToast()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [userInfo, setUserInfo] = useState({ name: "", phone: "" })
  const [formData, setFormData] = useState({
    helpType: "",
    urgencyLevel: "",
    description: "",
    contactPreference: "",
    additionalContact: "",
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
      console.log("🔥 Creating help request with data:", {
        userId: user?.uid,
        name: userInfo.name,
        helpType: formData.helpType,
        urgencyLevel: formData.urgencyLevel,
      })

      // Create help request document with detailed logging
      const helpRequestData = {
        userId: user?.uid,
        name: userInfo.name,
        phone: userInfo.phone,
        email: user?.email,
        helpType: formData.helpType,
        urgencyLevel: formData.urgencyLevel,
        description: formData.description,
        contactPreference: formData.contactPreference,
        additionalContact: formData.additionalContact,
        status: "Pending",
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      }

      console.log("🔥 Help request data to be saved:", helpRequestData)

      const docRef = await addDoc(collection(db, "helpRequests"), helpRequestData)

      console.log("✅ Help request created successfully with ID:", docRef.id)

      // Show success toast
      toast({
        title: "🆘 Help Request Submitted Successfully!",
        description: `Your ${formData.helpType} request has been submitted. We'll contact you soon via ${formData.contactPreference}. ID: ${docRef.id.slice(-6)}`,
        duration: 6000,
      })

      // Reset form
      setFormData({
        helpType: "",
        urgencyLevel: "",
        description: "",
        contactPreference: "",
        additionalContact: "",
      })

      // Navigate to requests page after a short delay
      setTimeout(() => {
        router.push("/requests")
      }, 2000)
    } catch (error) {
      console.error("❌ Error submitting help request:", error)
      toast({
        title: "❌ Error Submitting Request",
        description: "There was an error submitting your help request. Please try again.",
        variant: "destructive",
        duration: 5000,
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-green-50 pb-20">
        {/* Header */}
        <div className="bg-gradient-to-r from-green-600 to-emerald-600 text-white p-4 shadow-lg">
          <div className="flex items-center">
            <Link href="/home">
              <Button variant="ghost" size="sm" className="mr-3 text-white hover:bg-white/20">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <div>
              <h1 className="text-xl font-semibold">Request Help</h1>
              <p className="text-green-100 text-sm">We're here to assist you</p>
            </div>
          </div>
        </div>

        <div className="p-6">
          <Card className="shadow-lg border-0">
            <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50">
              <CardTitle className="flex items-center text-gray-800">
                <HelpCircle className="h-5 w-5 mr-2 text-green-600" />
                Help Request Details
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Debug Info */}
                <div className="bg-green-50 p-3 rounded-lg text-sm">
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

                {/* User Information Display */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-800 flex items-center">
                    <User className="h-5 w-5 mr-2 text-green-600" />
                    Your Information
                  </h3>

                  <div className="grid grid-cols-1 gap-4">
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-gray-700">Name</Label>
                      <Input value={userInfo.name} disabled className="bg-gray-50 h-11" />
                    </div>

                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-gray-700">Phone</Label>
                      <Input value={userInfo.phone} disabled className="bg-gray-50 h-11" />
                    </div>

                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-gray-700">Email</Label>
                      <Input value={user?.email || ""} disabled className="bg-gray-50 h-11" />
                    </div>
                  </div>
                </div>

                {/* Help Request Details */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-800 flex items-center">
                    <AlertCircle className="h-5 w-5 mr-2 text-green-600" />
                    Request Details
                  </h3>

                  <div className="space-y-2">
                    <Label htmlFor="helpType" className="text-sm font-medium text-gray-700">
                      Type of Help Needed *
                    </Label>
                    <Select
                      value={formData.helpType}
                      onValueChange={(value:string) => setFormData({ ...formData, helpType: value })}
                    >
                      <SelectTrigger className="h-11">
                        <SelectValue placeholder="Select help type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Food Assistance">Food Assistance</SelectItem>
                        <SelectItem value="Medical Help">Medical Help</SelectItem>
                        <SelectItem value="Educational Support">Educational Support</SelectItem>
                        <SelectItem value="Financial Aid">Financial Aid</SelectItem>
                        <SelectItem value="Legal Assistance">Legal Assistance</SelectItem>
                        <SelectItem value="Housing Support">Housing Support</SelectItem>
                        <SelectItem value="Job Assistance">Job Assistance</SelectItem>
                        <SelectItem value="Emergency Help">Emergency Help</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="urgencyLevel" className="text-sm font-medium text-gray-700">
                      Urgency Level *
                    </Label>
                    <Select
                      value={formData.urgencyLevel}
                      onValueChange={(value:string) => setFormData({ ...formData, urgencyLevel: value })}
                    >
                      <SelectTrigger className="h-11">
                        <SelectValue placeholder="Select urgency level" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Low">Low - Can wait a few days</SelectItem>
                        <SelectItem value="Medium">Medium - Need help within 24 hours</SelectItem>
                        <SelectItem value="High">High - Need immediate assistance</SelectItem>
                        <SelectItem value="Emergency">Emergency - Critical situation</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description" className="text-sm font-medium text-gray-700">
                      Detailed Description *
                    </Label>
                    <Textarea
                      id="description"
                      placeholder="Please provide detailed information about your situation and what kind of help you need"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="min-h-[120px]"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="contactPreference" className="text-sm font-medium text-gray-700">
                      Preferred Contact Method *
                    </Label>
                    <Select
                      value={formData.contactPreference}
                      onValueChange={(value:string) => setFormData({ ...formData, contactPreference: value })}
                    >
                      <SelectTrigger className="h-11">
                        <SelectValue placeholder="How should we contact you?" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Phone Call">Phone Call</SelectItem>
                        <SelectItem value="WhatsApp">WhatsApp</SelectItem>
                        <SelectItem value="Email">Email</SelectItem>
                        <SelectItem value="SMS">SMS</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="additionalContact" className="text-sm font-medium text-gray-700">
                      Alternative Contact (Optional)
                    </Label>
                    <Input
                      id="additionalContact"
                      placeholder="Alternative phone number or contact person"
                      value={formData.additionalContact}
                      onChange={(e) => setFormData({ ...formData, additionalContact: e.target.value })}
                      className="h-11"
                    />
                  </div>
                </div>

                <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="text-sm text-blue-800">
                    <strong>Note:</strong> Your request will be reviewed by our team. We aim to respond within 24 hours
                    for regular requests and immediately for emergency situations.
                  </p>
                </div>

                <Button
                  type="submit"
                  className="w-full h-12 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-medium"
                  disabled={loading}
                >
                  {loading ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Submitting Request...
                    </div>
                  ) : (
                    <div className="flex items-center">
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Submit Help Request
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
