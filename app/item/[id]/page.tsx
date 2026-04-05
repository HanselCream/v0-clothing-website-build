// app/item/[id]/page.tsx
'use client'

import { useEffect, useState, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import Image from 'next/image'

interface Item {
  id: string
  title: string
  description: string
  price: number
  type: 'fixed' | 'auction'
  image_url: string
  auction_end_date?: string
  starting_price?: number
  current_bid: number
  bid_count: number
  status: string
}

interface Bid {
  id: string
  amount: number
  created_at: string
  bidder_name: string
  rank?: number
}

// Bid Slider Input Component with both slider and manual input
function BidSliderInput({ 
  currentBid, 
  onBidSubmit, 
  isLoading 
}: { 
  currentBid: number, 
  onBidSubmit: (amount: number) => Promise<void>,
  isLoading: boolean 
}) {
  const [bidAmount, setBidAmount] = useState(currentBid + 100)
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const minimumBid = currentBid + 100
  const maxBid = 100000

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value)
    setBidAmount(value)
    setError('')
  }

  const handleManualChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    if (value === '') {
      setBidAmount(minimumBid)
      return
    }
    const numValue = parseInt(value)
    if (!isNaN(numValue)) {
      if (numValue > maxBid) {
        setBidAmount(maxBid)
      } else if (numValue < minimumBid) {
        setBidAmount(minimumBid)
      } else {
        setBidAmount(numValue)
      }
    }
    setError('')
  }

  const handleSubmit = async () => {
    if (bidAmount <= currentBid) {
      setError(`Bid must be at least ₱${minimumBid.toLocaleString()}`)
      return
    }
    if (bidAmount > maxBid) {
      setError(`Bid cannot exceed ₱${maxBid.toLocaleString()}`)
      return
    }
    
    setSubmitting(true)
    setError('')
    try {
      await onBidSubmit(bidAmount)
    } catch (err: any) {
      setError(err.message || 'Failed to place bid')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="space-y-6 bg-card border border-border rounded-lg p-6">
      {/* Slider Option */}
      <div>
        <div className="flex justify-between items-baseline mb-2">
          <label className="text-sm font-medium text-foreground">
            Slide to set bid amount
          </label>
          <div className="text-3xl font-bold text-primary">
            ₱{bidAmount.toLocaleString()}
          </div>
        </div>

        <input
          type="range"
          min={minimumBid}
          max={maxBid}
          step="100"
          value={bidAmount}
          onChange={handleSliderChange}
          className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
          style={{
            background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${
              ((bidAmount - minimumBid) / (maxBid - minimumBid)) * 100
            }%, #e5e7eb ${((bidAmount - minimumBid) / (maxBid - minimumBid)) * 100}%, #e5e7eb 100%)`,
          }}
        />

        <div className="flex justify-between text-xs text-muted-foreground mt-2">
          <span>₱{minimumBid.toLocaleString()}</span>
          <span>₱{maxBid.toLocaleString()}</span>
        </div>
      </div>

      {/* Manual Input Option */}
      <div className="pt-4 border-t border-border">
        <label className="block text-sm font-medium text-foreground mb-2">
          Or type your bid amount
        </label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground font-semibold">
            ₱
          </span>
          <input
            type="number"
            min={minimumBid}
            max={maxBid}
            step="100"
            value={bidAmount}
            onChange={handleManualChange}
            className="w-full pl-8 pr-4 py-2 bg-input border border-border rounded-lg text-foreground text-lg"
          />
        </div>
        <p className="text-xs text-muted-foreground mt-1">
          Minimum bid: ₱{minimumBid.toLocaleString()} | Maximum: ₱{maxBid.toLocaleString()}
        </p>
      </div>

      {error && (
        <p className="text-red-500 text-sm bg-red-500/10 p-2 rounded">{error}</p>
      )}

      <button
        onClick={handleSubmit}
        disabled={isLoading || submitting}
        className="w-full bg-primary text-primary-foreground font-semibold py-3 rounded-lg hover:bg-primary/90 disabled:opacity-50 transition-colors"
      >
        {submitting ? 'Placing bid...' : 'Place Bid'}
      </button>

      <p className="text-xs text-muted-foreground text-center">
        If you win, Jopesh will contact you via Messenger.
      </p>
    </div>
  )
}

export default function ItemPage() {
  const params = useParams()
  const router = useRouter()
  const id = params.id as string

  const [item, setItem] = useState<Item | null>(null)
  const [bids, setBids] = useState<Bid[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [userCredentials, setUserCredentials] = useState<any>(null)
  const [bidSubmitting, setBidSubmitting] = useState(false)
  const [bidSuccess, setBidSuccess] = useState(false)

  const fetchItem = useCallback(async () => {
    const { data, error: itemError } = await supabase
      .from('items')
      .select('*')
      .eq('id', id)
      .single()

    if (itemError || !data) {
      setError('Item not found')
      setLoading(false)
      return
    }

    setItem(data)

    if (data.type === 'auction') {
      const { data: bidsData } = await supabase
        .from('bids')
        .select('*')
        .eq('item_id', id)
        .order('amount', { ascending: false })

      if (bidsData) {
        // Add rank to bids
        const bidsWithRank = bidsData.map((bid, index) => ({
          ...bid,
          rank: index + 1
        }))
        setBids(bidsWithRank)
      }
    }

    setLoading(false)
  }, [id])

  useEffect(() => {
    // Get user credentials from localStorage (from homepage registration)
    const storedUser = localStorage.getItem('user_credentials')
    if (storedUser) {
      setUserCredentials(JSON.parse(storedUser))
    }
    
    fetchItem()
  }, [id, fetchItem])

  const handleBidSubmit = async (amount: number) => {
    if (!userCredentials || !item) return

    setBidSubmitting(true)

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500))

    // Create mock bid with stored user nickname
    const newBid: Bid = {
      id: Date.now().toString(),
      amount: amount,
      created_at: new Date().toISOString(),
      bidder_name: userCredentials.nickname,
    }

    // Update bids list with rank
    const updatedBids = [newBid, ...bids].sort((a, b) => b.amount - a.amount)
    const bidsWithRank = updatedBids.map((bid, index) => ({
      ...bid,
      rank: index + 1
    }))
    
    setBids(bidsWithRank)
    setItem(prev => prev ? {
      ...prev,
      current_bid: amount,
      bid_count: (prev.bid_count || 0) + 1
    } : null)
    
    setBidSuccess(true)
    setTimeout(() => setBidSuccess(false), 3000)
    setBidSubmitting(false)
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center text-foreground">Loading...</div>
        </div>
      </main>
    )
  }

  if (error || !item) {
    return (
      <main className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="text-destructive">{error || 'Item not found'}</div>
        </div>
      </main>
    )
  }

  const isAuction = item.type === 'auction'
  const endDate = isAuction && item.auction_end_date ? new Date(item.auction_end_date) : null
  const isEnded = endDate ? endDate < new Date() : item.status === 'ended'
  const highestBid = item.current_bid || item.starting_price || 0

  const getRankBadge = (rank: number) => {
    switch(rank) {
      case 1: return <span className="text-xs bg-yellow-500/20 text-yellow-500 px-2 py-0.5 rounded font-semibold">🥇 Highest</span>
      case 2: return <span className="text-xs bg-gray-400/20 text-gray-400 px-2 py-0.5 rounded font-semibold">🥈 2nd</span>
      case 3: return <span className="text-xs bg-amber-600/20 text-amber-600 px-2 py-0.5 rounded font-semibold">🥉 3rd</span>
      default: return null
    }
  }

  return (
    <main className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Back Button */}
        <button
          onClick={() => router.push('/')}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 transition-colors group"
        >
          <span className="text-xl group-hover:-translate-x-1 transition-transform">←</span>
          <span>Back to Premium Ukay & Fashion Finds</span>
        </button>

        {/* User Info Bar */}
        {userCredentials && (
          <div className="bg-card border border-border rounded-lg p-3 mb-6 flex items-center gap-4 text-sm">
            <span className="text-muted-foreground">Bidding as:</span>
            <span className="font-semibold text-foreground">{userCredentials.nickname}</span>
            <span className="text-muted-foreground">|</span>
            <span className="text-muted-foreground">{userCredentials.email}</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Image */}
          <div className="relative h-96 lg:h-full min-h-[400px] bg-secondary rounded-lg overflow-hidden">
            {item.image_url ? (
              <Image
                src={item.image_url}
                alt={item.title}
                fill
                className="object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                No image available
              </div>
            )}
          </div>

          {/* Details */}
          <div className="flex flex-col justify-between">
            <div>
              <div className="mb-4">
                {isAuction ? (
                  <span className="inline-block bg-primary text-primary-foreground px-3 py-1 rounded text-sm font-semibold mb-4">
                    AUCTION
                  </span>
                ) : (
                  <span className="inline-block bg-green-500 text-white px-3 py-1 rounded text-sm font-semibold mb-4">
                    FIXED PRICE
                  </span>
                )}
              </div>

              <h1 className="text-4xl font-bold text-foreground mb-4">
                {item.title}
              </h1>

              <p className="text-lg text-muted-foreground mb-6">
                {item.description}
              </p>

              {/* Pricing Info */}
              <div className="bg-card border border-border rounded-lg p-6 mb-6">
                {isAuction ? (
                  <>
                    <div className="mb-4">
                      <div className="text-sm text-muted-foreground mb-1">Current highest bid</div>
                      <div className="text-3xl font-bold text-foreground">
                        ₱{highestBid.toLocaleString()}
                      </div>
                      <div className="text-xs text-muted-foreground mt-2">
                        {item.bid_count} bid{item.bid_count !== 1 ? 's' : ''} placed
                      </div>
                    </div>
                    {endDate && (
                      <div className="text-sm">
                        <span className={isEnded ? 'text-destructive font-semibold' : 'text-muted-foreground'}>
                          {isEnded ? 'Auction ended' : `Ends: ${endDate.toLocaleDateString()} at ${endDate.toLocaleTimeString()}`}
                        </span>
                      </div>
                    )}
                  </>
                ) : (
                  <>
                    <div className="text-sm text-muted-foreground mb-1">Price</div>
                    <div className="text-3xl font-bold text-foreground">
                      ₱{item.price?.toLocaleString()}
                    </div>
                    <div className="text-xs text-muted-foreground mt-4 p-3 bg-secondary rounded-lg">
                      <p className="font-semibold mb-1">📱 Payment Instructions:</p>
                      <p>Contact Jopesh via Messenger to arrange payment and delivery.</p>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Bid Section */}
            {isAuction && (
              <div className="space-y-4">
                {!isEnded ? (
                  <>
                    {bidSuccess && (
                      <div className="bg-green-500/10 text-green-500 border border-green-500/20 p-4 rounded-lg">
                        <p className="font-semibold">✅ Bid placed successfully!</p>
                        <p className="text-sm mt-1">If you win, Jopesh will contact you via Messenger.</p>
                      </div>
                    )}

                    {!userCredentials ? (
                      <div className="bg-card border border-border rounded-lg p-6 text-center">
                        <p className="text-foreground font-semibold mb-2">Please register to place a bid</p>
                        <button
                          onClick={() => router.push('/')}
                          className="text-primary hover:text-primary/80 font-semibold"
                        >
                          Go back to homepage to register →
                        </button>
                      </div>
                    ) : (
                      <BidSliderInput
                        currentBid={highestBid}
                        onBidSubmit={handleBidSubmit}
                        isLoading={bidSubmitting}
                      />
                    )}
                  </>
                ) : (
                  <div className="bg-card border border-border rounded-lg p-6 text-center">
                    <p className="text-foreground font-semibold mb-1">This auction has ended</p>
                    <p className="text-sm text-muted-foreground">Winners will be contacted via Messenger</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Bid History with Rankings */}
        {isAuction && bids.length > 0 && (
          <div className="mt-12">
            <h2 className="text-2xl font-bold text-foreground mb-6">Bid History</h2>
            <div className="bg-card border border-border rounded-lg overflow-hidden">
              <div className="divide-y divide-border">
                {bids.map((bid) => (
                  <div key={bid.id} className="p-4 flex items-center justify-between hover:bg-secondary/50 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="text-sm font-semibold text-muted-foreground min-w-[60px]">
                        Bid #{bid.rank}
                      </div>
                      {getRankBadge(bid.rank!)}
                      <div className="text-sm text-foreground">
                        {bid.bidder_name}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xl font-bold text-foreground">
                        ₱{bid.amount.toLocaleString()}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {new Date(bid.created_at).toLocaleDateString()} at {new Date(bid.created_at).toLocaleTimeString()}
                      </div>
                      {bid.rank === 1 && (
                        <span className="text-xs text-primary font-semibold block mt-1">Current Highest</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  )
}