'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

interface BidSliderInputProps {
  currentBid: number
  startingPrice: number
  onBidSubmit: (amount: number) => Promise<void>
  isLoading: boolean
  hasBidAlready: boolean
  existingBidAmount?: number
}

export default function BidSliderInput({
  currentBid,
  startingPrice,
  onBidSubmit,
  isLoading,
  hasBidAlready,
  existingBidAmount,
}: BidSliderInputProps) {
  const [sliderValue, setSliderValue] = useState(currentBid + 100)
  const [manualValue, setManualValue] = useState((currentBid + 100).toString())
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  // If user already bid, minimum is their existing bid + 100
  // Otherwise use current highest bid + 100
  const minimumBid = existingBidAmount 
  ? existingBidAmount + 100 
  : currentBid > 0 ? currentBid + 100 : startingPrice + 1500
  const maxBid = 100000

  // Sync slider and manual input
  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value)
    setSliderValue(value)
    setManualValue(value.toString())
    setError('')
  }

  const handleManualChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setManualValue(value)

    if (value === '') {
      setError('')
      return
    }

    const numValue = parseInt(value)
    if (isNaN(numValue)) {
      setError('Please enter a valid number')
      return
    }

    if (numValue > maxBid) {
      setManualValue(maxBid.toString())
      setSliderValue(maxBid)
      setError('')
    } else {
      setSliderValue(numValue)
      setError('')
    }
  }

  const handleSubmit = async () => {
    const amount = parseInt(manualValue)

    if (isNaN(amount) || amount <= currentBid) {
      setError('Bid must exceed current highest bid')
      return
    }

    if (amount > maxBid) {
      setError('Bid cannot exceed ₱100,000')
      return
    }

    setSubmitting(true)
    setError('')

    try {
      await onBidSubmit(amount)
    } catch (err: any) {
      setError(err.message || 'Failed to place bid')
    } finally {
      setSubmitting(false)
    }
  }

return (
  <div className="space-y-6">

    {/* Show existing bid if they already bid */}
    {hasBidAlready && existingBidAmount && (
      <div className="bg-primary/10 border border-primary/20 rounded-lg p-4 text-center">
        <p className="text-sm text-muted-foreground mb-1">Your current bid</p>
        <p className="text-2xl font-bold text-primary">₱{existingBidAmount.toLocaleString()}</p>
        <p className="text-xs text-muted-foreground mt-1">Place a higher bid to stay competitive</p>
      </div>
    )}

    <div>
      <div className="flex justify-between items-baseline mb-2">
          <label className="text-sm font-medium text-foreground">
            Bid Amount
          </label>
          <div className="text-3xl font-bold text-foreground">
            ₱{sliderValue.toLocaleString()}
          </div>
        </div>

        <input
          type="range"
          min="100"
          max={maxBid}
          step="100"
          value={sliderValue}
          onChange={handleSliderChange}
          className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
          style={{
            background: `linear-gradient(to right, #ffffff 0%, #ffffff ${
              ((sliderValue - 100) / (maxBid - 100)) * 100
            }%, #3a3a3a ${((sliderValue - 100) / (maxBid - 100)) * 100}%, #3a3a3a 100%)`,
          }}
        />

        <div className="flex justify-between text-xs text-muted-foreground mt-2">
          <span>₱100</span>
          <span>₱{maxBid.toLocaleString()}</span>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-foreground mb-2">
          Or type your amount
        </label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-input-foreground font-semibold">
            ₱
          </span>
          <Input
            type="number"
            min={minimumBid}
            max={maxBid}
            value={manualValue}
            onChange={handleManualChange}
            placeholder="Enter amount"
            className="pl-8 bg-input text-input-foreground placeholder:text-input-placeholder border border-border rounded-md"
          />
        </div>
        {manualValue && (
          <p className="text-xs text-muted-foreground mt-1">
            Minimum: ₱{minimumBid.toLocaleString()}
          </p>
        )}
      </div>

      {error && <p className="text-destructive text-sm">{error}</p>}

      <Button
        onClick={handleSubmit}
        disabled={
          isLoading ||
          submitting ||
          !manualValue ||
          parseInt(manualValue) <= currentBid
        }
        className="w-full bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
      >
        {submitting ? 'Placing bid...' : 'Place Bid'}
      </Button>

      <p className="text-xs text-muted-foreground text-center">
        If you win, Jopesh will contact you via Messenger.
      </p>
    </div>
  )
}
