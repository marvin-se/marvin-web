"use client"

import React, { useEffect, useState } from "react"
import api from "@/lib/api/index"
import { getPending, clearPending, PendingVerification } from "@/lib/pendingVerification"
import { Button } from "@/components/ui/button"

export default function VerificationBanner() {
  const [pending, setPending] = useState<PendingVerification | null>(null)
  const [secondsLeft, setSecondsLeft] = useState(0)

  useEffect(() => {
    const p = getPending()
    setPending(p)
    if (p) {
      setSecondsLeft(Math.max(0, Math.floor((p.expiresAt - Date.now()) / 1000)))
    }
  }, [])

  useEffect(() => {
    if (!pending) return
    const t = setInterval(() => {
      const left = Math.max(0, Math.floor((pending.expiresAt - Date.now()) / 1000))
      setSecondsLeft(left)
      if (left <= 0) {
        clearPending()
        setPending(null)
        clearInterval(t)
      }
    }, 1000)
    return () => clearInterval(t)
  }, [pending])

  if (!pending) return null

  async function handleResend() {
    // Backend does not provide a dedicated resend endpoint. Instead, instruct user
    // to reopen the register tab so they can re-trigger the register flow (which triggers email).
    try { sessionStorage.setItem('openVerifyModal', pending.email) } catch {}
    window.location.href = '/auth/login?tab=register'
  }

  function openVerify() {
    // navigate to register tab with inline verify handled by page
    // Since we cannot access page state from here easily, set a small flag in sessionStorage
    try { sessionStorage.setItem('openVerifyModal', pending.email) } catch {}
    window.location.href = '/auth/login?tab=register'
  }

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-white border shadow-lg rounded-md px-4 py-3 flex items-center gap-4">
      <div className="text-sm">Doğrulama bekleniyor: <strong>{pending.email}</strong> — {Math.floor(secondsLeft/60)}:{String(secondsLeft%60).padStart(2,'0')}</div>
      <Button onClick={openVerify} className="py-1 px-3">Doğrula</Button>
      <Button onClick={handleResend} className="py-1 px-3">Kodu Tekrar Gönder</Button>
    </div>
  )
}
