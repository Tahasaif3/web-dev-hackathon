"use client"

import type React from "react"
import { useState } from "react"
import { signInWithEmailAndPassword } from "firebase/auth"
import { auth } from "@/lib/firebase"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import { Eye, EyeOff, LogIn, AlertCircle } from "lucide-react"

export default function LoginPage() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  })
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [errors, setErrors] = useState({
    email: "",
    password: "",
    general: "",
  })
  const router = useRouter()
  const { toast } = useToast()

  // Email validation function
  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  // Password validation function
  const validatePassword = (password: string) => {
    return password.length >= 6
  }

  // Real-time validation
  const handleInputChange = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value })

    // Clear previous errors
    setErrors({ ...errors, [field]: "", general: "" })

    // Validate on change
    if (field === "email" && value) {
      if (!validateEmail(value)) {
        setErrors({ ...errors, email: "Please enter a valid email address" })
      }
    }

    if (field === "password" && value) {
      if (!validatePassword(value)) {
        setErrors({ ...errors, password: "Password must be at least 6 characters" })
      }
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Clear previous errors
    setErrors({ email: "", password: "", general: "" })

    // Validate form
    let hasErrors = false
    const newErrors = { email: "", password: "", general: "" }

    if (!formData.email) {
      newErrors.email = "Email is required"
      hasErrors = true
    } else if (!validateEmail(formData.email)) {
      newErrors.email = "Please enter a valid email address"
      hasErrors = true
    }

    if (!formData.password) {
      newErrors.password = "Password is required"
      hasErrors = true
    } else if (!validatePassword(formData.password)) {
      newErrors.password = "Password must be at least 6 characters"
      hasErrors = true
    }

    if (hasErrors) {
      setErrors(newErrors)
      toast({
        title: "❌ Validation Error",
        description: "Please fix the errors below",
        variant: "destructive",
      })
      return
    }

    setLoading(true)

    try {
      await signInWithEmailAndPassword(auth, formData.email, formData.password)

      toast({
        title: "✅ Welcome back!",
        description: "You've been signed in successfully",
      })

      router.push("/home")
    } catch (error: any) {
      console.error("Login error:", error)

      let errorMessage = "Invalid email or password"

      // Handle specific Firebase auth errors
      switch (error.code) {
        case "auth/user-not-found":
          errorMessage = "No account found with this email address"
          break
        case "auth/wrong-password":
          errorMessage = "Incorrect password"
          break
        case "auth/invalid-email":
          errorMessage = "Invalid email address format"
          break
        case "auth/user-disabled":
          errorMessage = "This account has been disabled"
          break
        case "auth/too-many-requests":
          errorMessage = "Too many failed attempts. Please try again later"
          break
        case "auth/network-request-failed":
          errorMessage = "Network error. Please check your connection"
          break
        default:
          errorMessage = "Login failed. Please check your credentials"
      }

      setErrors({ ...errors, general: errorMessage })

      toast({
        title: "❌ Login Failed",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <Card className="w-full max-w-md shadow-xl border-0">
        <CardHeader className="text-center pb-2">
          <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <LogIn className="h-8 w-8 text-white" />
          </div>
          <CardTitle className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            Welcome Back
          </CardTitle>
          <CardDescription className="text-gray-600">Sign in to your account</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* General Error Message */}
          {errors.general && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-center">
              <AlertCircle className="h-4 w-4 text-red-600 mr-2" />
              <span className="text-sm text-red-700">{errors.general}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                Email Address
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={formData.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                className={`h-11 ${errors.email ? "border-red-500 focus:border-red-500" : ""}`}
                required
              />
              {errors.email && (
                <p className="text-sm text-red-600 flex items-center">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  {errors.email}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                Password
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={(e) => handleInputChange("password", e.target.value)}
                  className={`h-11 pr-10 ${errors.password ? "border-red-500 focus:border-red-500" : ""}`}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.password && (
                <p className="text-sm text-red-600 flex items-center">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  {errors.password}
                </p>
              )}
            </div>

            <Button
              type="submit"
              className="w-full h-11 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium"
              disabled={loading || !!errors.email || !!errors.password}
            >
              {loading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Signing In...
                </div>
              ) : (
                "Sign In"
              )}
            </Button>
          </form>

          <div className="text-center">
            <p className="text-sm text-gray-600">
              Don't have an account?{" "}
              <Link href="/signup" className="text-blue-600 hover:text-blue-700 font-medium">
                Create account
              </Link>
            </p>
          </div>


        </CardContent>
      </Card>
    </div>
  )
}
