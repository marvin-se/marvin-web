"use client"

import { useState } from "react"
import Link from "next/link"
import { useAuth } from "@/contexts/AuthContext"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

const brandColor = "#182C53"

const chamferStyle = {
  clipPath: "polygon(20px 0, calc(100% - 20px) 0, 100% 20px, 100% calc(100% - 20px), calc(100% - 20px) 100%, 20px 100%, 0 calc(100% - 20px), 0 20px)"
}

export default function LoginPage() {
  const [email, setEmail] = useState("test@campus.com")
  const [password, setPassword] = useState("123456")
  const [activeTab, setActiveTab] = useState<"login" | "register">("login")
  
  // Register state
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [registerEmail, setRegisterEmail] = useState("")
  const [registerPassword, setRegisterPassword] = useState("")
  
  const { login } = useAuth()

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    login({ id: 1, full_name: "Test User", email: email, created_at: new Date().toISOString(), is_active: true })
  }

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault()
    if (!firstName || !lastName || !registerEmail || !registerPassword) {
      alert("Please fill in all fields.")
      return
    }
    login({
      id: 1,
      full_name: `${firstName} ${lastName}`,
      email: registerEmail,
      university: null,
      phone_number: null,
      created_at: new Date().toISOString(),
      is_active: true,
    })
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
                  onClick={() => setActiveTab("login")}
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
                  onClick={() => setActiveTab("register")}
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
                      className="w-full py-3 font-semibold rounded-md text-white"
                      style={{ backgroundColor: brandColor }}
                    >
                      Login
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

                  {/* Register Form */}
                  <form onSubmit={handleRegister} className="space-y-4">
                    {/* First Name & Last Name Row */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="first-name" className="text-sm font-medium" style={{ color: brandColor }}>
                          First Name
                        </Label>
                        <Input
                          id="first-name"
                          placeholder="John"
                          required
                          value={firstName}
                          onChange={(e) => setFirstName(e.target.value)}
                          className="mt-2 border border-gray-300 rounded-md px-4 py-2"
                        />
                      </div>
                      <div>
                        <Label htmlFor="last-name" className="text-sm font-medium" style={{ color: brandColor }}>
                          Last Name
                        </Label>
                        <Input
                          id="last-name"
                          placeholder="Doe"
                          required
                          value={lastName}
                          onChange={(e) => setLastName(e.target.value)}
                          className="mt-2 border border-gray-300 rounded-md px-4 py-2"
                        />
                      </div>
                    </div>

                    {/* Email */}
                    <div>
                      <Label htmlFor="register-email" className="text-sm font-medium" style={{ color: brandColor }}>
                        University Email
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
                        Password
                      </Label>
                      <Input
                        id="register-password"
                        type="password"
                        placeholder="••••••••"
                        required
                        value={registerPassword}
                        onChange={(e) => setRegisterPassword(e.target.value)}
                        className="mt-2 border border-gray-300 rounded-md px-4 py-2"
                      />
                    </div>

                    {/* Create Account Button */}
                    <Button
                      type="submit"
                      className="w-full py-3 font-semibold rounded-md text-white"
                      style={{ backgroundColor: brandColor }}
                    >
                      Create Account
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
