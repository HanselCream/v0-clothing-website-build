'use client'

import { useEffect, useState, useCallback } from 'react'
import { useParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import Image from 'next/image'
import BidRegistrationForm from '@/app/components/BidRegistrationForm'
import BidSliderInput from '@/app/components/BidSliderInput'

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
}

interface BidderInfo {
  name: string
  address: string
  phone: string
  email: string
}

export default function ItemPage() {
  const params = useParams()
  const id = params.id as string

  const [item, setItem] = useState<Item | null>(null)
  const [bids, setBids] = useState<Bid[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [bidderInfo, setBidderInfo] = useState<BidderInfo | null>(null)
  const [hasBidAlready, setHasBidAlready] = useState(false)
  const [existingBidAmount, setExistingBidAmount] = useState<number | null>(null)
  const [bidSubmitting, setBidSubmitting] = useState(false)
  const [bidError, setBidError] = useState('')
  const [bidSuccess, setBidSuccess] = useState(false)

  const fetchItem = useCallback(async () => {
    const { data, error: itemError } = await supabase
      .from('items')
      .select('*')
      .eq('id', id)
      .single()

    if (itemError || !data) {
      setError('Item not found')
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
        setBids(bidsData)
      }

      // Check if user is already registered in localStorage
      const storedBidderInfo = localStorage.getItem('bidder_info')
      if (storedBidderInfo) {
        const bidderData = JSON.parse(storedBidderInfo)
        setBidderInfo(bidderData)

        // Check if user has already bid on this item
        const response = await fetch(
          `/api/check-bid?item_id=${id}&email=${encodeURIComponent(bidderData.email)}`
        )
        const result = await response.json()
        setHasBidAlready(result.has_bid)
        if (result.amount) {
          setExistingBidAmount(result.amount)
        }
      }
    }

    setLoading(false)
  }, [id])

  useEffect(() => {
    fetchItem()
  }, [id, fetchItem])

  useEffect(() => {
    // Subscribe to bid changes for auctions
    if (item?.type === 'auction') {
      const subscription = supabase
        .channel(`bids-${id}`)
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'bids',
            filter: `item_id=eq.${id}`,
          },
          (payload) => {
            const newBid = payload.new as Bid
            setBids(prev => [newBid, ...prev].sort((a, b) => b.amount - a.amount))
            setItem(prev => prev ? { ...prev, bid_count: (prev.bid_count || 0) + 1 } : null)
          }
        )
        .subscribe()

      return () => {
        subscription.unsubscribe()
      }
    }
  }, [id, item?.type])

  if (loading) {
    return (
      <main className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="text-foreground">Loading...</div>
        </div>
      </main>
    )
  }

  const handleRegister = (info: BidderInfo) => {
    localStorage.setItem('bidder_info', JSON.stringify(info))
    setBidderInfo(info)
    setBidError('')
  }

  const handleBidSubmit = async (amount: number) => {
    if (!bidderInfo || !item) return

    setBidSubmitting(true)
    setBidError('')

    try {
      const response = await fetch('/api/bid', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          item_id: item.id,
          name: bidderInfo.name,
          address: bidderInfo.address,
          phone: bidderInfo.phone,
          email: bidderInfo.email,
          amount,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to place bid')
      }

      // Save to localStorage
      localStorage.setItem(
        `bid_${item.id}`,
        JSON.stringify({ amount, placed_at: new Date().toISOString() })
      )

      setBidSuccess(true)
      setHasBidAlready(true)
      setExistingBidAmount(amount)
      fetchItem()

      setTimeout(() => setBidSuccess(false), 5000)
    } catch (err: any) {
      setBidError(err.message)
    } finally {
      setBidSubmitting(false)
    }
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
  const bidCount = item.bid_count || 0

  return (
    <main className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <a href={isAuction ? '/auctions' : '/'} className="text-muted-foreground hover:text-foreground mb-6 inline-block">
          ← Back to {isAuction ? 'auctions' : 'items'}
        </a>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Image */}
          <div className="relative h-96 lg:h-full bg-secondary rounded-lg overflow-hidden">
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
                {isAuction && (
                  <span className="inline-block bg-primary text-primary-foreground px-3 py-1 rounded text-sm font-semibold mb-4">
                    AUCTION
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
                        {bidCount} bid{bidCount !== 1 ? 's' : ''} placed
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
                      <div className="bg-green-900 text-green-100 p-4 rounded-lg">
                        <p className="font-semibold">
                          Bid of ₱{existingBidAmount?.toLocaleString()} placed successfully.
                        </p>
                        <p className="text-sm mt-1">
                          If you win, Jopesh will contact you via Messenger.
                        </p>
                      </div>
                    )}

                    {!bidderInfo ? (
                      <BidRegistrationForm onRegister={handleRegister} />
                    ) : (
                      <>
                        {bidError && (
                          <div className="bg-red-900 text-red-100 p-4 rounded-lg">
                            <p className="text-sm">{bidError}</p>
                          </div>
                        )}
                        <BidSliderInput
                          currentBid={highestBid}
                          startingPrice={item.starting_price || 100}
                          onBidSubmit={handleBidSubmit}
                          isLoading={bidSubmitting}
                          hasBidAlready={hasBidAlready}
                          existingBidAmount={existingBidAmount || undefined}
                        />
                      </>
                    )}
                  </>
                ) : (
                  <div className="bg-card border border-border rounded-lg p-6 text-center">
                    <p className="text-foreground font-semibold mb-1">
                      This auction has ended
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Winners will be contacted via Messenger
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Bids List */}
        {isAuction && bids.length > 0 && (
          <div className="mt-12">
            <h2 className="text-2xl font-bold text-foreground mb-6">Bid History</h2>
            <div className="bg-card border border-border rounded-lg overflow-hidden">
              <div className="divide-y divide-border">
                {bids.map((bid, index) => (
                  <div key={bid.id} className="p-4 flex items-center justify-between">
                    <div className="text-sm text-muted-foreground">
                      Bid #{bids.length - index}
                    </div>
                    <div className="text-right">
                      <div className="text-xl font-bold text-foreground">
                        ₱{bid.amount.toLocaleString()}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {new Date(bid.created_at).toLocaleDateString()}
                      </div>
                      {index === 0 && (
                        <span className="text-xs text-primary font-semibold block mt-1">Highest</span>
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
