'use client'

import { useState } from 'react'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

interface BidFormProps {
  itemId: string
  onBidPlaced: () => void
}

export default function BidForm({ itemId, onBidPlaced }: BidFormProps) {
  const [bidderName, setBidderName] = useState('')
  const [bidderEmail, setBidderEmail] = useState('')
  const [bidAmount, setBidAmount] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [isError, setIsError] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')
    setIsError(false)

    try {
      const response = await fetch('/api/bid', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          item_id: itemId,
          bidder_name: bidderName,
          bidder_email: bidderEmail,
          bid_amount: parseFloat(bidAmount),
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        setIsError(true)
        setMessage(data.error || 'Failed to place bid')
      } else {
        setMessage('Bid placed successfully!')
        setBidderName('')
        setBidderEmail('')
        setBidAmount('')
        onBidPlaced()
      }
    } catch (error) {
      setIsError(true)
      setMessage('An error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-foreground mb-1">
          Your Name
        </label>
        <input
          type="text"
          value={bidderName}
          onChange={(e) => setBidderName(e.target.value)}
          required
          className="w-full px-4 py-2 bg-input border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          placeholder="Enter your name"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-foreground mb-1">
          Email Address
        </label>
        <input
          type="email"
          value={bidderEmail}
          onChange={(e) => setBidderEmail(e.target.value)}
          required
          className="w-full px-4 py-2 bg-input border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          placeholder="Enter your email"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-foreground mb-1">
          Bid Amount
        </label>
        <input
          type="number"
          step="0.01"
          value={bidAmount}
          onChange={(e) => setBidAmount(e.target.value)}
          required
          className="w-full px-4 py-2 bg-input border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          placeholder="Enter your bid amount"
        />
      </div>

      {message && (
        <div className={`p-3 rounded-lg text-sm ${
          isError
            ? 'bg-red-500/10 text-red-500 border border-red-500/20'
            : 'bg-green-500/10 text-green-500 border border-green-500/20'
        }`}>
          {message}
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-primary text-primary-foreground font-semibold py-3 rounded-lg hover:bg-primary/90 disabled:opacity-50 transition-colors"
      >
        {loading ? 'Placing bid...' : 'Place Bid'}
      </button>
    </form>
  )
}
