"use client"

import { signOut } from "firebase/auth"
import { auth } from "@/lib/firebase"
import { ProtectedRoute } from "@/components/protected-route"
import { BottomNav } from "@/components/bottom-nav"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { useToast } from "@/hooks/use-toast"
import { LogOut, FileText, Shield, Bell, HelpCircle, Info } from "lucide-react"
import { useRouter } from "next/navigation"

export default function SettingsPage() {
  const { toast } = useToast()
  const router = useRouter()

  const handleLogout = async () => {
    try {
      await signOut(auth)
      toast({
        title: "Signed out successfully",
        description: "You have been logged out of your account",
      })
      router.push("/login")
    } catch (error) {
      toast({
        title: "Error signing out",
        description: "Please try again",
        variant: "destructive",
      })
    }
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 pb-20">
        {/* Header */}
        <div className="bg-gradient-to-r from-gray-600 to-slate-600 text-white p-4 shadow-lg">
          <h1 className="text-xl font-semibold">Settings</h1>
          <p className="text-gray-100 text-sm">Manage your preferences and account</p>
        </div>

        <div className="p-6 space-y-6">
          {/* App Information */}
          <Card className="shadow-lg border-0">
            <CardHeader>
              <CardTitle className="flex items-center text-gray-800">
                <Info className="h-5 w-5 mr-2 text-blue-600" />
                App Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg cursor-pointer">
                <div className="flex items-center">
                  <HelpCircle className="h-5 w-5 text-gray-600 mr-3" />
                  <div>
                    <span className="font-medium">Help & Support</span>
                    <p className="text-sm text-gray-500">Get help with using the app</p>
                  </div>
                </div>
              </div>

              <Separator />

              <div className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg cursor-pointer">
                <div className="flex items-center">
                  <Bell className="h-5 w-5 text-gray-600 mr-3" />
                  <div>
                    <span className="font-medium">Notifications</span>
                    <p className="text-sm text-gray-500">Manage notification preferences</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Legal & Privacy */}
          <Card className="shadow-lg border-0">
            <CardHeader>
              <CardTitle className="flex items-center text-gray-800">
                <Shield className="h-5 w-5 mr-2 text-green-600" />
                Legal & Privacy
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg cursor-pointer">
                <div className="flex items-center">
                  <FileText className="h-5 w-5 text-gray-600 mr-3" />
                  <div>
                    <span className="font-medium">Terms & Conditions</span>
                    <p className="text-sm text-gray-500">Read our terms of service</p>
                  </div>
                </div>
              </div>

              <Separator />

              <div className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg cursor-pointer">
                <div className="flex items-center">
                  <Shield className="h-5 w-5 text-gray-600 mr-3" />
                  <div>
                    <span className="font-medium">Privacy Policy</span>
                    <p className="text-sm text-gray-500">Learn how we protect your data</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Account Actions */}
          <Card className="shadow-lg border-0">
            <CardHeader>
              <CardTitle className="text-gray-800">Account</CardTitle>
            </CardHeader>
            <CardContent>
              <Button
                variant="destructive"
                className="w-full h-12 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700"
                onClick={handleLogout}
              >
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
            </CardContent>
          </Card>

          {/* App Version */}
          <div className="text-center text-sm text-gray-500">
            <p>Saylani Booking System</p>
            <p>Version 1.0.0</p>
          </div>
        </div>
      </div>
      <BottomNav />
    </ProtectedRoute>
  )
}
