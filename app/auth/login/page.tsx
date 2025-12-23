"use client"

import { useState, useEffect, useRef, Suspense } from "react"
import Link from "next/link"
import { useSearchParams, useRouter } from "next/navigation"
import { useAuth } from "@/contexts/AuthContext"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import api from "@/lib/api/index"
import { getUniversities } from "@/lib/api/listings"
import { UniversityNameResponse } from "@/lib/types"

const brandColor = "#182C53"

const chamferStyle = {
  clipPath: "polygon(20px 0, calc(100% - 20px) 0, 100% 20px, 100% calc(100% - 20px), calc(100% - 20px) 100%, 20px 100%, 0 calc(100% - 20px), 0 20px)"
}

function LoginForm() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { login } = useAuth()

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [activeTab, setActiveTab] = useState<"login" | "register">("login")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [showVerifyInRegister, setShowVerifyInRegister] = useState(false)
  const [resendDisabled, setResendDisabled] = useState(false)
  const [secondsLeft, setSecondsLeft] = useState(0)
  const timerRef = useRef<number | null>(null)
  const [showVerifyCTA, setShowVerifyCTA] = useState(false)
  
  // Universities state
  const [universityList, setUniversityList] = useState<UniversityNameResponse[]>([])

  // Pending verification timer state
  const [pendingResendDisabled, setPendingResendDisabled] = useState(false)
  const [pendingSecondsLeft, setPendingSecondsLeft] = useState(0)
  const pendingTimerRef = useRef<number | null>(null)
  const [pendingAttempts, setPendingAttempts] = useState(0)
  
  // Set initial tab from URL parameter
  useEffect(() => {
    const tab = searchParams.get('tab')
    if (tab === 'register') {
      setActiveTab(tab)
    }
  }, [searchParams])

  // Fetch universities on mount
  useEffect(() => {
    const fetchUniversities = async () => {
      try {
        const data = await getUniversities();
        setUniversityList(data);
      } catch (err) {
        console.error("Failed to fetch universities:", err);
      }
    };
    fetchUniversities();
  }, []);

  // Cleanup verification timer on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        window.clearInterval(timerRef.current)
        timerRef.current = null
      }
      if (pendingTimerRef.current) {
        window.clearInterval(pendingTimerRef.current)
        pendingTimerRef.current = null
      }
      if (forgotPasswordTimerRef.current) {
        window.clearInterval(forgotPasswordTimerRef.current)
        forgotPasswordTimerRef.current = null
      }
    }
  }, [])
  
  // Register state
  const [fullName, setFullName] = useState("")
  const [registerEmail, setRegisterEmail] = useState("")
  const [registerPassword, setRegisterPassword] = useState("")
  const [university, setUniversity] = useState("")
  const [phoneNumber, setPhoneNumber] = useState("")
  
  // Verify state
  const [verifyEmail, setVerifyEmail] = useState("")
  const [verificationCode, setVerificationCode] = useState("")
  const [registerAttempts, setRegisterAttempts] = useState(0)
  
  // Pending verification flow (for users who registered but didn't verify)
  const [showPendingVerify, setShowPendingVerify] = useState(false)
  const [pendingCode, setPendingCode] = useState("")
  const [pendingLoading, setPendingLoading] = useState(false)
  const [pendingError, setPendingError] = useState<string | null>(null)
  const [pendingSuccess, setPendingSuccess] = useState<string | null>(null)
  
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setShowVerifyCTA(false)
    
    try {
      const response = await api.post('/auth/login', {
        email,
        password
      })
      
      const { token, user } = response.data
      login(token, user)
      // Redirect to browse page after successful login
      setTimeout(() => {
        router.push('/browse')
      }, 100)
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
      
      // If account is not verified, show verification code input
      const isUnverified = /not verified|unverified|verify your|verification|disabled/i.test(errorMessage);
      if (isUnverified) {
        setError('Your account is not verified.')
        setShowVerifyCTA(true)
        setVerifyEmail(email)
        setShowPendingVerify(false)
        setPendingError(null)
        setPendingSuccess(null)
        return
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
      
      // Show inline verification UI and start 5 minute timer
      setVerifyEmail(registerEmail)
      setShowVerifyInRegister(true)
      setSuccess('Verification code sent to your email. Enter it below within 5 minutes.')
      setError(null)
      setResendDisabled(true)
      setSecondsLeft(5 * 60)
      if (timerRef.current) window.clearInterval(timerRef.current)
      timerRef.current = window.setInterval(() => {
        setSecondsLeft((s) => {
          if (s <= 1) {
            if (timerRef.current) window.clearInterval(timerRef.current)
            setResendDisabled(false)
            return 0
          }
          return s - 1
        })
      }, 1000)
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
      if (typeof errorMessage === 'string' && /university not found/i.test(errorMessage)) {
        errorMessage = 'The email domain does not match the selected university.'
      }
      
      // Check if email exists but user is not verified - offer verification flow
      if (err?.response?.status === 409 || /already exists/i.test(errorMessage)) {
        try {
          const checkUser = await api.get(`/user/get-inactive-user/${encodeURIComponent(registerEmail)}`)
          if (checkUser?.status === 200 && checkUser?.data) {
            // User exists but not verified - show verification UI
            setVerifyEmail(registerEmail)
            setShowVerifyInRegister(true)
            setError(null)
            setSuccess('This email is already registered but not verified. Please enter the verification code sent to your email. If the code expired, please contact support.')
            return
          }
        } catch {
          // User doesn't exist or is already verified - show normal error
        }
      }
      
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  // Verify pending account (user entered code after login failed due to unverified account)
  const handleVerifyPending = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (pendingAttempts >= 5) {
      setPendingError('Too many failed attempts. Please click "Resend Code" to get a new one.')
      return
    }

    if (!email || !pendingCode) {
      setPendingError('Please enter the verification code.')
      return
    }
    setPendingLoading(true)
    setPendingError(null)
    try {
      await api.post('/auth/verify', {
        email: email,
        token: pendingCode
      })
      setPendingSuccess('Email verified successfully! You can now login.')
      setShowPendingVerify(false)
      setError(null)
      setSuccess('Email verified successfully! You can now login.')
      setPendingCode('')
      setPendingAttempts(0)
    } catch (err: any) {
      setPendingAttempts(prev => prev + 1)
      console.error('Verify pending error:', err)
      const errorData = err.response?.data
      let errorMessage = 'Verification failed. Please check your code.'
      if (typeof errorData === 'string') {
        errorMessage = errorData
      } else if (errorData?.message) {
        errorMessage = errorData.message
      }
      if (/expired/i.test(errorMessage)) {
        errorMessage = 'Your verification code has expired. Click "Resend Code" to get a new one.'
      }
      setPendingError(errorMessage)
    } finally {
      setPendingLoading(false)
    }
  }

  // Resend verification code for pending/unverified account
  const handleResendPending = async () => {
    if (pendingResendDisabled) return
    if (!email) {
      setPendingError('Please make sure the email is filled in the login form above.')
      return
    }
    setPendingLoading(true)
    setPendingError(null)
    setPendingSuccess(null)
    try {
      await api.post('/auth/resend', { email: email })
      setPendingSuccess('New verification code sent! Please check your email.')
      setPendingCode('')
      setPendingAttempts(0)
      
      // Start 5 minute timer
      setPendingResendDisabled(true)
      setPendingSecondsLeft(5 * 60)
      if (pendingTimerRef.current) window.clearInterval(pendingTimerRef.current)
      pendingTimerRef.current = window.setInterval(() => {
        setPendingSecondsLeft((s) => {
          if (s <= 1) {
            if (pendingTimerRef.current) window.clearInterval(pendingTimerRef.current)
            setPendingResendDisabled(false)
            return 0
          }
          return s - 1
        })
      }, 1000)
    } catch (err: any) {
      console.error('Resend pending error:', err)
      const errorData = err.response?.data
      let errorMessage = 'Unable to resend verification code.'
      if (typeof errorData === 'string') {
        errorMessage = errorData
      } else if (errorData?.message) {
        errorMessage = errorData.message
      }
      setPendingError(errorMessage + ' Please contact support if the problem persists.')
    } finally {
      setPendingLoading(false)
    }
  }

  // Forgot Password state
  const [showForgotPassword, setShowForgotPassword] = useState(false)
  const [forgotPasswordStep, setForgotPasswordStep] = useState(1) // 1: Email, 2: Code, 3: New Password
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState("")
  const [forgotPasswordCode, setForgotPasswordCode] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmNewPassword, setConfirmNewPassword] = useState("")
  const [forgotPasswordLoading, setForgotPasswordLoading] = useState(false)
  const [forgotPasswordError, setForgotPasswordError] = useState<string | null>(null)
  const [forgotPasswordSuccess, setForgotPasswordSuccess] = useState<string | null>(null)

  // Forgot Password Timer & Limits
  const [forgotPasswordResendDisabled, setForgotPasswordResendDisabled] = useState(false)
  const [forgotPasswordSecondsLeft, setForgotPasswordSecondsLeft] = useState(0)
  const forgotPasswordTimerRef = useRef<number | null>(null)
  const [forgotPasswordAttempts, setForgotPasswordAttempts] = useState(0)

  const handleForgotPasswordResend = async () => {
    if (forgotPasswordResendDisabled) return
    setForgotPasswordLoading(true)
    setForgotPasswordError(null)
    setForgotPasswordSuccess(null)
    try {
      await api.post('/auth/forgot-password', { email: forgotPasswordEmail })
      setForgotPasswordSuccess("Reset code resent to your email!")
      setForgotPasswordAttempts(0)
      
      // Start 5 minute timer
      setForgotPasswordResendDisabled(true)
      setForgotPasswordSecondsLeft(5 * 60)
      if (forgotPasswordTimerRef.current) window.clearInterval(forgotPasswordTimerRef.current)
      forgotPasswordTimerRef.current = window.setInterval(() => {
        setForgotPasswordSecondsLeft((s) => {
          if (s <= 1) {
            if (forgotPasswordTimerRef.current) window.clearInterval(forgotPasswordTimerRef.current)
            setForgotPasswordResendDisabled(false)
            return 0
          }
          return s - 1
        })
      }, 1000)
    } catch (err: any) {
      console.error('Resend forgot password error:', err)
      setForgotPasswordError('Unable to resend verification code.')
    } finally {
      setForgotPasswordLoading(false)
    }
  }

  const handleForgotPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setForgotPasswordLoading(true)
    setForgotPasswordError(null)
    setForgotPasswordSuccess(null)

    try {
      if (forgotPasswordStep === 1) {
        // Step 1: Send Reset Email
        if (!forgotPasswordEmail) {
          setForgotPasswordError("Please enter your email address.")
          setForgotPasswordLoading(false)
          return
        }
        await api.post('/auth/forgot-password', { email: forgotPasswordEmail })
        setForgotPasswordSuccess("Reset code sent to your email!")
        setForgotPasswordStep(2)
        
        // Start 5 minute timer
        setForgotPasswordResendDisabled(true)
        setForgotPasswordSecondsLeft(5 * 60)
        if (forgotPasswordTimerRef.current) window.clearInterval(forgotPasswordTimerRef.current)
        forgotPasswordTimerRef.current = window.setInterval(() => {
          setForgotPasswordSecondsLeft((s) => {
            if (s <= 1) {
              if (forgotPasswordTimerRef.current) window.clearInterval(forgotPasswordTimerRef.current)
              setForgotPasswordResendDisabled(false)
              return 0
            }
            return s - 1
          })
        }, 1000)

      } else if (forgotPasswordStep === 2) {
        // Step 2: Verify Code
        if (forgotPasswordAttempts >= 5) {
          setForgotPasswordError('Too many failed attempts. Please click "Resend Code" to get a new one.')
          setForgotPasswordLoading(false)
          return
        }

        if (!forgotPasswordCode) {
          setForgotPasswordError("Please enter the verification code.")
          setForgotPasswordLoading(false)
          return
        }
        await api.post('/auth/verify-reset-code', { 
          email: forgotPasswordEmail, 
          token: forgotPasswordCode 
        })
        setForgotPasswordSuccess("Code verified! Please set your new password.")
        setForgotPasswordStep(3)
        setForgotPasswordAttempts(0)
      } else if (forgotPasswordStep === 3) {
        // Step 3: Reset Password
        if (!newPassword || !confirmNewPassword) {
          setForgotPasswordError("Please fill in all fields.")
          setForgotPasswordLoading(false)
          return
        }
        if (newPassword !== confirmNewPassword) {
          setForgotPasswordError("Passwords do not match.")
          setForgotPasswordLoading(false)
          return
        }
        if (newPassword.length < 8) {
          setForgotPasswordError("Password must be at least 8 characters long.")
          setForgotPasswordLoading(false)
          return
        }
        
        await api.post('/auth/change-password', {
          email: forgotPasswordEmail,
          token: forgotPasswordCode,
          oldPassword: "",
          newPassword: newPassword,
          confirmNewPassword: confirmNewPassword,
          type: "FORGOT_PASSWORD"
        })
        
        setForgotPasswordSuccess("Password reset successfully! You can now login.")
        setTimeout(() => {
          setShowForgotPassword(false)
          setForgotPasswordStep(1)
          setForgotPasswordEmail("")
          setForgotPasswordCode("")
          setNewPassword("")
          setConfirmNewPassword("")
          setForgotPasswordSuccess(null)
        }, 2000)
      }
    } catch (err: any) {
      console.error('Forgot password error:', err)
      const errorData = err.response?.data
      let errorMessage = 'An error occurred. Please try again.'
      if (typeof errorData === 'string') {
        errorMessage = errorData
      } else if (errorData?.message) {
        errorMessage = errorData.message
      }
      setForgotPasswordError(errorMessage)
      if (forgotPasswordStep === 2) {
        setForgotPasswordAttempts(prev => prev + 1)
      }
    } finally {
      setForgotPasswordLoading(false)
    }
  }

  const handleResend = async () => {
    if (resendDisabled) return
    setLoading(true)
    setError(null)
    try {
      await api.post('/auth/resend', null, {
        params: { email: registerEmail }
      })
      setSuccess('Verification code resent. Please check your email.')
      setRegisterAttempts(0)
      // restart timer
      setResendDisabled(true)
      setSecondsLeft(5 * 60)
      if (timerRef.current) window.clearInterval(timerRef.current)
      timerRef.current = window.setInterval(() => {
        setSecondsLeft((s) => {
          if (s <= 1) {
            if (timerRef.current) window.clearInterval(timerRef.current)
            setResendDisabled(false)
            return 0
          }
          return s - 1
        })
      }, 1000)
    } catch (err: any) {
      console.error('Resend error:', err)
      setError('Unable to resend verification code. Try again later.')
    } finally {
      setLoading(false)
    }
  }

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (registerAttempts >= 5) {
      setError('Too many failed attempts. Please click "Resend Code" to get a new one.')
      return
    }

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
      // hide inline verify UI and go to login
      setShowVerifyInRegister(false)
      setActiveTab('login')
      setEmail(verifyEmail)
      setError(null)
      setSuccess('Email verified successfully! You can now login.')
      setRegisterAttempts(0)
    } catch (err: any) {
      setRegisterAttempts(prev => prev + 1)
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
                  onClick={() => { setActiveTab("login"); setError(null); setSuccess(null); setShowVerifyInRegister(false); setShowPendingVerify(false); setShowVerifyCTA(false); setResendDisabled(false); if (timerRef.current) { window.clearInterval(timerRef.current); timerRef.current = null } }}
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
                  onClick={() => { setActiveTab("register"); setError(null); setSuccess(null); setShowVerifyInRegister(false); setShowPendingVerify(false); setShowVerifyCTA(false); setResendDisabled(false); if (timerRef.current) { window.clearInterval(timerRef.current); timerRef.current = null } }}
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
              </div>

              {/* LOGIN TAB */}
              {activeTab === "login" && !showForgotPassword && (
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

                  {showVerifyCTA && !showPendingVerify && (
                    <div className="flex items-center justify-between gap-3 bg-amber-50 border border-amber-200 text-amber-800 px-4 py-3 rounded-md text-sm">
                      <span>You haven’t verified your account.</span>
                      <Button
                        type="button"
                        onClick={() => { setShowPendingVerify(true); setShowVerifyCTA(false); setPendingError(null); setPendingSuccess(null); setSuccess(null); setError(null); handleResendPending();}}
                        className="font-semibold"
                        style={{ backgroundColor: brandColor }}
                      >
                        Verify your account
                      </Button>
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
                        placeholder="x@example.edu.tr"
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
                      <button
                        type="button"
                        onClick={() => setShowForgotPassword(true)}
                        className="text-sm text-teal-600 hover:text-teal-700 font-medium"
                      >
                        Forgot Password?
                      </button>
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

                  {/* Pending Verification UI - shown when login fails due to unverified account */}
                  {showPendingVerify && (
                    <div className="mt-4 p-4 border border-amber-200 rounded-md bg-amber-50 space-y-4">
                      <div>
                        <h3 className="text-md font-semibold" style={{ color: brandColor }}>Enter Verification Code</h3>
                        <p className="text-sm text-gray-600 mt-1">
                          Please enter the 6-digit verification code sent to <strong>{email}</strong>
                        </p>
                      </div>

                      {pendingSuccess && (
                        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md text-sm">
                          <span className="font-medium">Success:</span> {pendingSuccess}
                        </div>
                      )}

                      {pendingError && (
                        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
                          <span className="font-medium">Error:</span> {pendingError}
                        </div>
                      )}

                      <form onSubmit={handleVerifyPending} className="space-y-3">
                        <div>
                          <Label htmlFor="pending-code" className="text-sm font-medium" style={{ color: brandColor }}>
                            Verification Code
                          </Label>
                          <Input
                            id="pending-code"
                            type="text"
                            placeholder="Enter 6-digit code"
                            value={pendingCode}
                            onChange={(e) => setPendingCode(e.target.value)}
                            className="mt-2 border border-gray-300 rounded-md px-4 py-2"
                          />
                        </div>
                        <Button
                          type="submit"
                          disabled={pendingLoading}
                          className="w-full py-2 font-semibold rounded-md text-white"
                          style={{ backgroundColor: brandColor }}
                        >
                          {pendingLoading ? 'Verifying...' : 'Verify Email'}
                        </Button>
                        <Button
                          type="button"
                          onClick={handleResendPending}
                          disabled={pendingLoading || pendingResendDisabled}
                          variant="outline"
                          className="w-full py-2 font-semibold rounded-md"
                        >
                          {pendingLoading ? 'Sending...' : 
                            pendingResendDisabled 
                              ? `Resend available in ${Math.floor(pendingSecondsLeft/60)}:${String(pendingSecondsLeft%60).padStart(2,'0')}` 
                              : 'Resend Code'
                          }
                        </Button>
                        <p className="text-xs text-gray-500 mt-2">
                          Code expired? Click "Resend Code" to get a new one.
                        </p>
                      </form>
                    </div>
                  )}
                </>
              )}

              {/* FORGOT PASSWORD UI */}
              {activeTab === "login" && showForgotPassword && (
                <>
                  <div>
                    <h1 className="text-2xl font-bold" style={{ color: brandColor }}>
                      {forgotPasswordStep === 1 ? "Reset Password" : 
                       forgotPasswordStep === 2 ? "Verify Code" : "New Password"}
                    </h1>
                    <p className="text-sm text-gray-600 mt-1">
                      {forgotPasswordStep === 1 ? "Enter your email to receive a reset code." : 
                       forgotPasswordStep === 2 ? "Enter the code sent to your email." : "Set your new password."}
                    </p>
                  </div>

                  {forgotPasswordSuccess && (
                    <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md text-sm">
                      <span className="font-medium">Success:</span> {forgotPasswordSuccess}
                    </div>
                  )}

                  {forgotPasswordError && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
                      <span className="font-medium">Error:</span> {forgotPasswordError}
                    </div>
                  )}

                  <form onSubmit={handleForgotPasswordSubmit} className="space-y-4">
                    {forgotPasswordStep === 1 && (
                      <div>
                        <Label htmlFor="fp-email" className="text-sm font-medium" style={{ color: brandColor }}>
                          University Email
                        </Label>
                        <Input
                          id="fp-email"
                          type="email"
                          placeholder="m@example.com"
                          required
                          value={forgotPasswordEmail}
                          onChange={(e) => setForgotPasswordEmail(e.target.value)}
                          className="mt-2 border border-gray-300 rounded-md px-4 py-2"
                        />
                      </div>
                    )}

                    {forgotPasswordStep === 2 && (
                      <div>
                        <Label htmlFor="fp-code" className="text-sm font-medium" style={{ color: brandColor }}>
                          Verification Code
                        </Label>
                        <Input
                          id="fp-code"
                          type="text"
                          placeholder="Enter 6-digit code"
                          required
                          value={forgotPasswordCode}
                          onChange={(e) => setForgotPasswordCode(e.target.value)}
                          className="mt-2 border border-gray-300 rounded-md px-4 py-2"
                        />
                        <div className="mt-2 flex justify-end">
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={handleForgotPasswordResend}
                            disabled={forgotPasswordResendDisabled || forgotPasswordLoading}
                            className="text-xs h-auto p-0 hover:bg-transparent"
                            style={{ color: brandColor }}
                          >
                            {forgotPasswordResendDisabled 
                              ? `Resend available in ${Math.floor(forgotPasswordSecondsLeft/60)}:${String(forgotPasswordSecondsLeft%60).padStart(2,'0')}` 
                              : 'Resend Code'}
                          </Button>
                        </div>
                      </div>
                    )}

                    {forgotPasswordStep === 3 && (
                      <>
                        <div>
                          <Label htmlFor="new-password" className="text-sm font-medium" style={{ color: brandColor }}>
                            New Password
                          </Label>
                          <Input
                            id="new-password"
                            type="password"
                            placeholder="••••••••"
                            required
                            minLength={8}
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            className="mt-2 border border-gray-300 rounded-md px-4 py-2"
                          />
                        </div>
                        <div>
                          <Label htmlFor="confirm-password" className="text-sm font-medium" style={{ color: brandColor }}>
                            Confirm Password
                          </Label>
                          <Input
                            id="confirm-password"
                            type="password"
                            placeholder="••••••••"
                            required
                            minLength={8}
                            value={confirmNewPassword}
                            onChange={(e) => setConfirmNewPassword(e.target.value)}
                            className="mt-2 border border-gray-300 rounded-md px-4 py-2"
                          />
                        </div>
                      </>
                    )}

                    <div className="flex gap-3">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          setShowForgotPassword(false)
                          setForgotPasswordStep(1)
                          setForgotPasswordError(null)
                          setForgotPasswordSuccess(null)
                        }}
                        className="flex-1 py-3 font-semibold rounded-md"
                      >
                        Cancel
                      </Button>
                      <Button
                        type="submit"
                        disabled={forgotPasswordLoading}
                        className="flex-1 py-3 font-semibold rounded-md text-white"
                        style={{ backgroundColor: brandColor }}
                      >
                        {forgotPasswordLoading ? 'Processing...' : 
                         forgotPasswordStep === 1 ? 'Send Code' : 
                         forgotPasswordStep === 2 ? 'Verify Code' : 'Reset Password'}
                      </Button>
                    </div>
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
                        {universityList.map((uni) => (
                          <option key={uni.name} value={uni.name}>{uni.name}</option>
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
                    {/* Inline Verify UI shown after successful registration */}
                    {showVerifyInRegister && (
                      <div className="mt-6 space-y-4">
                        <div>
                          <h2 className="text-lg font-semibold" style={{ color: brandColor }}>Verify Your Email</h2>
                          <p className="text-sm text-gray-600">A verification code was sent to your email. Enter it below within 5 minutes.</p>
                        </div>

                        {success && (
                          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md text-sm">
                            <span className="font-medium">Success:</span> {success}
                          </div>
                        )}

                        {error && (
                          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
                            <span className="font-medium">Error:</span> {error}
                          </div>
                        )}

                        <form onSubmit={handleVerify} className="space-y-4">
                          <div>
                            <Label htmlFor="verify-email-inline" className="text-sm font-medium" style={{ color: brandColor }}>Email</Label>
                            <Input id="verify-email-inline" type="email" required value={verifyEmail} readOnly className="mt-2 border border-gray-300 rounded-md px-4 py-2 bg-gray-100" />
                          </div>

                          <div>
                            <Label htmlFor="verification-code-inline" className="text-sm font-medium" style={{ color: brandColor }}>Verification Code</Label>
                            <Input id="verification-code-inline" type="text" placeholder="Enter 6-digit code" required value={verificationCode} onChange={(e) => setVerificationCode(e.target.value)} className="mt-2 border border-gray-300 rounded-md px-4 py-2" />
                          </div>

                          <div className="flex items-center gap-3">
                            <Button type="submit" disabled={loading} className="py-2 px-4 font-semibold rounded-md text-white" style={{ backgroundColor: brandColor }}>
                              {loading ? 'Verifying...' : 'Verify Email'}
                            </Button>

                            <Button type="button" onClick={handleResend} disabled={resendDisabled || loading} className={`py-2 px-4 font-semibold rounded-md`}>
                              {resendDisabled ? `Resend available in ${Math.floor(secondsLeft/60)}:${String(secondsLeft%60).padStart(2,'0')}` : 'Resend Code'}
                            </Button>
                          </div>
                        </form>
                      </div>
                    )}
                </>
              )}

              
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <LoginForm />
    </Suspense>
  )
}