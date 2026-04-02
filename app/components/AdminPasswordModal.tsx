'use client'

import { useState } from 'react'

interface AdminPasswordModalProps {
  onSuccess: () => void
}

export default function AdminPasswordModal({ onSuccess }: AdminPasswordModalProps) {
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    // Check password client-side for simplicity
    // In production, you'd verify this on the server
    if (password === process.env.NEXT_PUBLIC_ADMIN_PASSWORD) {
      onSuccess()
    } else {
      setError('Invalid password')
      setPassword('')
    }

    setLoading(false)
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
      <div className="bg-card border border-border rounded-lg p-8 w-full max-w-sm">
        <h1 className="text-2xl font-bold text-foreground mb-6">
          Admin Access
        </h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoFocus
              className="w-full px-4 py-2 bg-input border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="Enter admin password"
            />
          </div>

          {error && (
            <div className="p-3 rounded-lg text-sm bg-red-500/10 text-red-500 border border-red-500/20">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary text-primary-foreground font-semibold py-2 rounded-lg hover:bg-primary/90 disabled:opacity-50 transition-colors"
          >
            {loading ? 'Verifying...' : 'Enter Dashboard'}
          </button>
        </form>
      </div>
    </div>
  )
}
