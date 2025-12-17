export type PendingVerification = {
  email: string
  fullName?: string
  university?: string
  expiresAt: number
}

const KEY = "pendingVerification_v1"

export function savePending(v: PendingVerification) {
  try {
    localStorage.setItem(KEY, JSON.stringify(v))
  } catch {}
}

export function getPending(): PendingVerification | null {
  try {
    const s = localStorage.getItem(KEY)
    if (!s) return null
    const v: PendingVerification = JSON.parse(s)
    if (Date.now() > v.expiresAt) {
      localStorage.removeItem(KEY)
      return null
    }
    return v
  } catch {
    try { localStorage.removeItem(KEY) } catch {}
    return null
  }
}

export function clearPending() {
  try { localStorage.removeItem(KEY) } catch {}
}
