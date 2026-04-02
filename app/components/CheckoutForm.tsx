'use client'

import { useState } from 'react'
import { loadStripe } from '@stripe/js'

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

interface CheckoutFormProps {
  itemId: string
}

export default function CheckoutForm({ itemId }: CheckoutFormProps) {
  const [customerName, setCustomerName] = useState('')
  const [customerEmail, setCustomerEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [isError, setIsError] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')
    setIsError(false)

    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          item_id: itemId,
          customer_name: customerName,
          customer_email: customerEmail,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        setIsError(true)
        setMessage(data.error || 'Failed to start checkout')
      } else {
        // Redirect to Stripe checkout
        const stripe = await stripePromise
        if (stripe && data.sessionId) {
          const { error } = await stripe.redirectToCheckout({
            sessionId: data.sessionId,
          })
          if (error) {
            setIsError(true)
            setMessage(error.message || 'Failed to redirect to checkout')
          }
        }
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
          Full Name
        </label>
        <input
          type="text"
          value={customerName}
          onChange={(e) => setCustomerName(e.target.value)}
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
          value={customerEmail}
          onChange={(e) => setCustomerEmail(e.target.value)}
          required
          className="w-full px-4 py-2 bg-input border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          placeholder="Enter your email"
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
        {loading ? 'Processing...' : 'Proceed to Checkout'}
      </button>
    </form>
  )
}
