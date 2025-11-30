"use client"

import { redirect } from "next/navigation"

export default function RegisterPage() {
  // Redirect to login page since both forms are now combined there
  redirect("/auth/login")
}

