"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { useAuth } from "@/contexts/AuthContext"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import api from "@/lib/api/index"

const brandColor = "#182C53"

const chamferStyle = {
  clipPath: "polygon(20px 0, calc(100% - 20px) 0, 100% 20px, 100% calc(100% - 20px), calc(100% - 20px) 100%, 20px 100%, 0 calc(100% - 20px), 0 20px)"
}

// Universities from backend database
const universities = [
  "Istanbul Technical University (ITU)",
  "Middle East Technical University (METU)",
  "Yildiz Technical University (YTU)",
  "Bogazici University",
  "Hacettepe University"
]

export default function LoginPage() {
  const searchParams = useSearchParams()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [activeTab, setActiveTab] = useState<"login" | "register" | "verify">("login")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  
  // Set initial tab from URL parameter
  useEffect(() => {
    const tab = searchParams.get('tab')
    if (tab === 'register' || tab === 'verify') {
      setActiveTab(tab)
    }
  }, [searchParams])
  
  // Register state
  const [fullName, setFullName] = useState("")
  const [registerEmail, setRegisterEmail] = useState("")
  const [registerPassword, setRegisterPassword] = useState("")
  const [university, setUniversity] = useState("")
  const [phoneNumber, setPhoneNumber] = useState("")
  
  // Verify state
  const [verifyEmail, setVerifyEmail] = useState("")
  const [verificationCode, setVerificationCode] = useState("")
  
  const { login } = useAuth()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    
    try {
      const response = await api.post('/auth/login', {
        email,
        password
      })
      
      const { token, user } = response.data
      login(token, user)
    } catch (err: any) {
      console.error('Login error:', err)
      const errorData = err.response?.data
      let errorMessage = 'Login failed. Please check your credentials.'
      if (typeof errorData === 'string') {
        errorMessage = errorData
      } else if (errorData?.message) {
        errorMessage = errorData.message
      } else if (errorData?.error) {
        errorMessage = errorData.error
      }
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!fullName || !registerEmail || !registerPassword || !university) {
      setError("Please fill in all required fields.")
      return
    }
    
    if (registerPassword.length < 8) {
      setError("Password must be at least 8 characters long.")
      return
    }
    
    setLoading(true)
    setError(null)
    
    try {
      await api.post('/auth/register', {
        fullName,
        email: registerEmail,
        password: registerPassword,
        university,
        phoneNumber: phoneNumber || null
      })
      
      setVerifyEmail(registerEmail)
      setActiveTab('verify')
      setError(null)
    } catch (err: any) {
      console.error('Register error:', err)
      const errorData = err.response?.data
      let errorMessage = 'Registration failed. Please try again.'
      if (typeof errorData === 'string') {
        errorMessage = errorData
      } else if (errorData?.message) {
        errorMessage = errorData.message
      } else if (errorData?.error) {
        errorMessage = errorData.error
      }
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!verifyEmail || !verificationCode) {
      setError("Please enter your email and verification code.")
      return
    }
    
    setLoading(true)
    setError(null)
    
    try {
      await api.post('/auth/verify', {
        email: verifyEmail,
        token: verificationCode
      })
      
      setActiveTab('login')
      setEmail(verifyEmail)
      setError(null)
      setSuccess('Email verified successfully! You can now login.')
    } catch (err: any) {
      console.error('Verify error:', err)
      const errorData = err.response?.data
      let errorMessage = 'Verification failed. Please check your code.'
      if (typeof errorData === 'string') {
        errorMessage = errorData
      } else if (errorData?.message) {
        errorMessage = errorData.message
      } else if (errorData?.error) {
        errorMessage = errorData.error
      }
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="relative min-h-screen flex items-center justify-center px-4">
      {/* BACKGROUND IMAGE */}
      <img
        src="/bg-browse.svg"
        alt="background"
        className="pointer-events-none absolute top-0 left-0 -z-50 w-full h-full object-cover"
      />

      {/* CONTENT CARD */}
      <div className="relative z-10 w-full max-w-md">
        {/* Chamfered Card Outer Border */}
        <div className="drop-shadow-2xl filter">
          <div
            className="p-[3px]"
            style={{ backgroundColor: brandColor, ...chamferStyle }}
          >
            {/* Card Inner Content */}
            <div
              className="p-8 space-y-6"
              style={{ ...chamferStyle, backgroundColor: "rgba(255,255,255,0.95)", backdropFilter: "blur(10px)" }}
            >
              {/* Tabs */}
              <div className="flex border-b border-gray-300">
                <button
                  onClick={() => { setActiveTab("login"); setError(null); setSuccess(null); }}
                  className={`flex-1 py-3 text-center font-semibold transition-colors ${
                    activeTab === "login"
                      ? `border-b-2`
                      : "text-gray-500"
                  }`}
                  style={{
                    color: activeTab === "login" ? brandColor : undefined,
                    borderColor: activeTab === "login" ? brandColor : undefined,
                  }}
                >
                  Login
                </button>
                <button
                  onClick={() => { setActiveTab("register"); setError(null); setSuccess(null); }}
                  className={`flex-1 py-3 text-center font-semibold transition-colors ${
                    activeTab === "register"
                      ? `border-b-2`
                      : "text-gray-500"
                  }`}
                  style={{
                    color: activeTab === "register" ? brandColor : undefined,
                    borderColor: activeTab === "register" ? brandColor : undefined,
                  }}
                >
                  Register
                </button>
                <button
                  onClick={() => { setActiveTab("verify"); setError(null); setSuccess(null); }}
                  className={`flex-1 py-3 text-center font-semibold transition-colors ${
                    activeTab === "verify"
                      ? `border-b-2`
                      : "text-gray-500"
                  }`}
                  style={{
                    color: activeTab === "verify" ? brandColor : undefined,
                    borderColor: activeTab === "verify" ? brandColor : undefined,
                  }}
                >
                  Verify
                </button>
              </div>

              {/* LOGIN TAB */}
              {activeTab === "login" && (
                <>
                  {/* Title & Description */}
                  <div>
                    <h1 className="text-2xl font-bold" style={{ color: brandColor }}>
                      Welcome Back
                    </h1>
                    <p className="text-sm text-gray-600 mt-1">
                      Please enter your details to sign in.
                    </p>
                  </div>

                  {/* Success Message */}
                  {success && (
                    <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md text-sm">
                      <span className="font-medium">Success:</span> {success}
                    </div>
                  )}

                  {/* Error Message */}
                  {error && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
                      <span className="font-medium">Error:</span> {error}
                    </div>
                  )}

                  {/* Login Form */}
                  <form onSubmit={handleLogin} className="space-y-4">
                    <div>
                      <Label htmlFor="email" className="text-sm font-medium" style={{ color: brandColor }}>
                        University Email
                      </Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="m@example.com"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="mt-2 border border-gray-300 rounded-md px-4 py-2"
                      />
                    </div>

                    <div>
                      <Label htmlFor="password" className="text-sm font-medium" style={{ color: brandColor }}>
                        Password
                      </Label>
                      <Input
                        id="password"
                        type="password"
                        placeholder="••••••••"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="mt-2 border border-gray-300 rounded-md px-4 py-2"
                      />
                    </div>

                    <div className="flex justify-end">
                      <Link href="#" className="text-sm text-teal-600 hover:text-teal-700 font-medium">
                        Forgot Password?
                      </Link>
                    </div>

                    <Button
                      type="submit"
                      disabled={loading}
                      className="w-full py-3 font-semibold rounded-md text-white"
                      style={{ backgroundColor: brandColor }}
                    >
                      {loading ? 'Logging in...' : 'Login'}
                    </Button>
                  </form>
                </>
              )}

              {/* REGISTER TAB */}
              {activeTab === "register" && (
                <>
                  {/* Title & Description */}
                  <div>
                    <h1 className="text-2xl font-bold" style={{ color: brandColor }}>
                      Create Account
                    </h1>
                    <p className="text-sm text-gray-600 mt-1">
                      Enter your information to join the campus network
                    </p>
                  </div>

                  {/* Error Message */}
                  {error && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
                      <span className="font-medium">Error:</span> {error}
                    </div>
                  )}

                  {/* Register Form */}
                  <form onSubmit={handleRegister} className="space-y-4">
                    {/* Full Name */}
                    <div>
                      <Label htmlFor="full-name" className="text-sm font-medium" style={{ color: brandColor }}>
                        Full Name *
                      </Label>
                      <Input
                        id="full-name"
                        placeholder="John Doe"
                        required
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        className="mt-2 border border-gray-300 rounded-md px-4 py-2"
                      />
                    </div>

                    {/* Email */}
                    <div>
                      <Label htmlFor="register-email" className="text-sm font-medium" style={{ color: brandColor }}>
                        University Email *
                      </Label>
                      <Input
                        id="register-email"
                        type="email"
                        placeholder="j.doe@university.edu"
                        required
                        value={registerEmail}
                        onChange={(e) => setRegisterEmail(e.target.value)}
                        className="mt-2 border border-gray-300 rounded-md px-4 py-2"
                      />
                    </div>

                    {/* Password */}
                    <div>
                      <Label htmlFor="register-password" className="text-sm font-medium" style={{ color: brandColor }}>
                        Password * (min 8 characters)
                      </Label>
                      <Input
                        id="register-password"
                        type="password"
                        placeholder="••••••••"
                        required
                        minLength={8}
                        value={registerPassword}
                        onChange={(e) => setRegisterPassword(e.target.value)}
                        className="mt-2 border border-gray-300 rounded-md px-4 py-2"
                      />
                    </div>

                    {/* University */}
                    <div>
                      <Label htmlFor="university" className="text-sm font-medium" style={{ color: brandColor }}>
                        University *
                      </Label>
                      <select
                        id="university"
                        required
                        value={university}
                        onChange={(e) => setUniversity(e.target.value)}
                        className="mt-2 w-full border border-gray-300 rounded-md px-4 py-2 bg-white"
                      >
                        <option value="">Select your university</option>
                        {universities.map((uni) => (
                          <option key={uni} value={uni}>{uni}</option>
                        ))}
                      </select>
                    </div>

                    {/* Phone Number */}
                    <div>
                      <Label htmlFor="phone" className="text-sm font-medium" style={{ color: brandColor }}>
                        Phone Number (optional)
                      </Label>
                      <Input
                        id="phone"
                        type="tel"
                        placeholder="+90 555 123 4567"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        className="mt-2 border border-gray-300 rounded-md px-4 py-2"
                      />
                    </div>

                    {/* Create Account Button */}
                    <Button
                      type="submit"
                      disabled={loading}
                      className="w-full py-3 font-semibold rounded-md text-white"
                      style={{ backgroundColor: brandColor }}
                    >
                      {loading ? 'Creating Account...' : 'Create Account'}
                    </Button>
                  </form>
                </>
              )}

              {/* VERIFY TAB */}
              {activeTab === "verify" && (
                <>
                  <div>
                    <h1 className="text-2xl font-bold" style={{ color: brandColor }}>
                      Verify Email
                    </h1>
                    <p className="text-sm text-gray-600 mt-1">
                      Enter the verification code sent to your email
                    </p>
                  </div>

                  {/* Error Message */}
                  {error && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
                      <span className="font-medium">Error:</span> {error}
                    </div>
                  )}

                  <form onSubmit={handleVerify} className="space-y-4">
                    <div>
                      <Label htmlFor="verify-email" className="text-sm font-medium" style={{ color: brandColor }}>
                        Email
                      </Label>
                      <Input
                        id="verify-email"
                        type="email"
                        required
                        value={verifyEmail}
                        onChange={(e) => setVerifyEmail(e.target.value)}
                        className="mt-2 border border-gray-300 rounded-md px-4 py-2"
                      />
                    </div>

                    <div>
                      <Label htmlFor="verification-code" className="text-sm font-medium" style={{ color: brandColor }}>
                        Verification Code
                      </Label>
                      <Input
                        id="verification-code"
                        type="text"
                        placeholder="Enter 6-digit code"
                        required
                        value={verificationCode}
                        onChange={(e) => setVerificationCode(e.target.value)}
                        className="mt-2 border border-gray-300 rounded-md px-4 py-2"
                      />
                    </div>

                    <Button
                      type="submit"
                      disabled={loading}
                      className="w-full py-3 font-semibold rounded-md text-white"
                      style={{ backgroundColor: brandColor }}
                    >
                      {loading ? 'Verifying...' : 'Verify Email'}
                    </Button>
                  </form>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
