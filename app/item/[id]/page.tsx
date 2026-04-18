'use client'

import { useEffect, useState, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import Image from 'next/image'
import BidSliderInput from '@/app/components/BidSliderInput'

interface Item {
  id: string
  title: string
  description: string
  price: number
  type: 'fixed' | 'auction'
  image_url: string
  images?: string[]
  auction_end_date?: string
  starting_price?: number
  current_bid: number
  bid_count: number
  status: string
}

export default function ItemPage() {
  const params = useParams()
  const router = useRouter()
  const id = params.id as string

  const [item, setItem] = useState<Item | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [userCredentials, setUserCredentials] = useState<any>(null)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [allImages, setAllImages] = useState<string[]>([])
  const [isZoomed, setIsZoomed] = useState(false)
  const [zoomOrigin, setZoomOrigin] = useState('center center')

  // ✅ FIXED: State inside component
  const [bids, setBids] = useState<any[]>([])
  const [bidSuccess, setBidSuccess] = useState(false)
  const [hasBidAlready, setHasBidAlready] = useState(false)
  const [existingBidAmount, setExistingBidAmount] = useState<number | null>(null)

  const fetchItem = useCallback(async () => {
    const { data, error: itemError } = await supabase
      .from('items')
      .select('*')
      .eq('id', id)
      .single()

    if (itemError || !data) {
      setError('Item not found')
      setLoading(false)
      return // ✅ FIXED: early return here, bid fetch below
    }

    setItem(data)

    if (data.images && Array.isArray(data.images) && data.images.length > 0) {
      setAllImages(data.images)
    } else {
      setAllImages([data.image_url])
    }

    // ✅ FIXED: Bid fetch AFTER successful item load
    if (data.type === 'auction') {
      const { data: bidsData } = await supabase
        .from('bids')
        .select('*')
        .eq('item_id', id)
        .order('amount', { ascending: false })

if (bidsData) {
  // Show only highest bid per user
  const uniqueBids = new Map<string, any>()
  bidsData.forEach((bid: any) => {
    if (!uniqueBids.has(bid.bidder_email) || bid.amount > uniqueBids.get(bid.bidder_email).amount) {
      uniqueBids.set(bid.bidder_email, bid)
    }
  })
  setBids(Array.from(uniqueBids.values()).sort((a, b) => b.amount - a.amount))
        const storedUser = localStorage.getItem('user_credentials')
        if (storedUser) {
          const user = JSON.parse(storedUser)
          const existing = bidsData.find((b: any) => b.bidder_email === user.email)
          if (existing) {
            setHasBidAlready(true)
            setExistingBidAmount(existing.amount)
          }
        }
      }
    }

    setLoading(false)
  }, [id])

  useEffect(() => {
    const storedUser = localStorage.getItem('user_credentials')
    if (storedUser) setUserCredentials(JSON.parse(storedUser))
    fetchItem()
  }, [id, fetchItem])

  const nextImage = () => {
    if (currentImageIndex < allImages.length - 1) setCurrentImageIndex(currentImageIndex + 1)
  }

  const prevImage = () => {
    if (currentImageIndex > 0) setCurrentImageIndex(currentImageIndex - 1)
  }

const handleBidSubmit = async (amount: number) => {
  if (!userCredentials) return

  // Check if user already has a higher or equal bid
  if (existingBidAmount && amount <= existingBidAmount) {
    throw new Error(`Your bid must be higher than your current bid of ₱${existingBidAmount.toLocaleString()}`)
  }

  const { error } = await supabase.from('bids').insert({
    item_id: item?.id,
    bidder_name: userCredentials.nickname,
    bidder_email: userCredentials.email,
    bidder_phone: userCredentials.phoneNumber,
    bidder_address: userCredentials.location,
    amount,
  })

  if (error) throw new Error(error.message)

  // Update item stats
  setItem(prev => prev ? {
    ...prev,
    current_bid: amount,
    bid_count: (prev.bid_count || 0) + 1
  } : null)

  // Update bids — replace user's old bid with new higher one
  setBids(prev => {
    const withoutUserOldBid = prev.filter(b => b.bidder_email !== userCredentials.email)
    return [
      ...withoutUserOldBid,
      {
        id: Date.now().toString(),
        bidder_name: userCredentials.nickname,
        bidder_email: userCredentials.email,
        amount,
        placed_at: new Date().toISOString()
      }
    ].sort((a, b) => b.amount - a.amount)
  })

  setHasBidAlready(true)
  setExistingBidAmount(amount)
  setBidSuccess(true)
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
  const hasMultipleImages = allImages.length > 1

  return (
    <main className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">

        {/* Back Button */}
        <button
          onClick={() => router.push('/')}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 transition-colors group"
        >
          <span className="text-xl group-hover:-translate-x-1 transition-transform">←</span>
          <span>Back to JOPESH</span>
        </button>

        {/* User Info Bar */}
        {userCredentials && (
          <div className="bg-card border border-border rounded-lg p-3 mb-6 flex items-center gap-4 text-sm">
            <span className="text-muted-foreground">Viewing as:</span>
            <span className="font-semibold text-foreground">{userCredentials.nickname}</span>
            <span className="text-muted-foreground">|</span>
            <span className="text-muted-foreground">{userCredentials.email}</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

          {/* Image Gallery */}
          <div className="space-y-4">
            <div
              className="relative bg-secondary rounded-lg overflow-hidden select-none"
              style={{ aspectRatio: '1 / 1' }}
              onTouchStart={(e) => { (e.currentTarget as any)._touchStartX = e.touches[0].clientX }}
              onTouchEnd={(e) => {
                const diff = (e.currentTarget as any)._touchStartX - e.changedTouches[0].clientX
                if (Math.abs(diff) > 50) { if (diff > 0) nextImage(); else prevImage() }
              }}
            >
              {allImages[currentImageIndex] ? (
                <div
                  className="relative w-full h-full cursor-zoom-in"
                  style={{ aspectRatio: '1 / 1', transform: isZoomed ? 'scale(2)' : 'scale(1)', transition: 'transform 0.3s ease', transformOrigin: zoomOrigin }}
                  onClick={(e) => {
                    if (!isZoomed) {
                      const rect = e.currentTarget.getBoundingClientRect()
                      setZoomOrigin(`${((e.clientX - rect.left) / rect.width) * 100}% ${((e.clientY - rect.top) / rect.height) * 100}%`)
                    }
                    setIsZoomed(!isZoomed)
                  }}
                >
                  <Image
                    src={allImages[currentImageIndex]}
                    alt={`${item.title} - image ${currentImageIndex + 1}`}
                    fill
                    className="object-contain p-2"
                    sizes="(max-width: 768px) 100vw, 50vw"
                    priority={currentImageIndex === 0}
                    loading={currentImageIndex === 0 ? "eager" : "lazy"}
                    unoptimized
                  />
                </div>
              ) : (
                <div className="w-full h-full flex items-center justify-center text-muted-foreground">No image available</div>
              )}

              {/* SOLD overlay */}
              {item.status === 'ended' && (
                <div className="absolute inset-0 z-20 flex items-center justify-center pointer-events-none">
                  <div className="bg-black/70 rounded-full px-6 py-3 border-2 border-red-500 rotate-12">
                    <span className="text-white font-bold text-2xl tracking-widest">SOLD</span>
                  </div>
                </div>
              )}

              {hasMultipleImages && !isZoomed && (
                <>
                  <button onClick={prevImage} disabled={currentImageIndex === 0}
                    className="absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-black/70 disabled:opacity-30 z-30">←</button>
                  <button onClick={nextImage} disabled={currentImageIndex === allImages.length - 1}
                    className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-black/70 disabled:opacity-30 z-30">→</button>
                </>
              )}

              {hasMultipleImages && (
                <div className="absolute bottom-2 right-2 bg-black/50 text-white text-xs px-3 py-1 rounded-full z-30">
                  {currentImageIndex + 1} / {allImages.length}
                </div>
              )}

              <div className="absolute bottom-2 left-2 bg-black/40 text-white text-xs px-2 py-1 rounded-full z-30">
                {isZoomed ? 'tap to zoom out' : 'tap to zoom'}
              </div>
            </div>

            {hasMultipleImages && (
              <div className="flex gap-2 overflow-x-auto pb-2">
                {allImages.map((img, idx) => (
                  <button key={idx} onClick={() => { setCurrentImageIndex(idx); setIsZoomed(false) }}
                    className={`relative w-16 h-16 rounded-lg overflow-hidden border-2 flex-shrink-0 transition-all ${
                      currentImageIndex === idx ? 'border-primary ring-2 ring-primary/50' : 'border-transparent opacity-60 hover:opacity-100'
                    }`}>
                    <Image src={img} alt={`thumbnail ${idx + 1}`} fill className="object-cover" unoptimized />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Details Section */}
          <div className="flex flex-col gap-6">
            <div>
              <span className="inline-block bg-primary text-primary-foreground px-3 py-1 rounded text-sm font-semibold mb-4">
                {isAuction ? 'AUCTION' : 'FIXED PRICE'}
              </span>
              <h1 className="text-4xl font-bold text-foreground mb-4">{item.title}</h1>
              <p className="text-lg text-muted-foreground mb-6 whitespace-pre-line">{item.description}</p>

              <div className="bg-card border border-border rounded-lg p-6 mb-6">
 {isAuction ? (
  item.starting_price && item.starting_price > 0 ? (
    <div>
      <div className="text-sm text-muted-foreground mb-1">
        {item.status === 'ended' ? 'Final bid' : 'Starting bid'}
      </div>
      <div className="text-3xl font-bold text-foreground">
        ₱{item.starting_price.toLocaleString()}
      </div>
    </div>
  ) : null
) : (
  item.price && item.price > 0 ? (
    <div>
      <div className="text-sm text-muted-foreground mb-1">
        {item.status === 'ended' ? 'Sold for' : 'Price'}
      </div>
      <div className="text-3xl font-bold text-foreground">
        ₱{item.price.toLocaleString()}
      </div>
    </div>
  ) : null
)}
              </div>
            </div>

            {/* SOLD or Bid Section */}
            {item.status === 'ended' ? (
              <div className="bg-card border border-border rounded-lg p-8 text-center">
                <div className="text-6xl mb-4">🔴</div>
                <p className="text-foreground font-bold text-2xl mb-2">SOLD</p>
                <p className="text-muted-foreground">This item has been sold. Thank you for your interest!</p>
                <p className="text-xs text-muted-foreground mt-4">Check back soon for new collections.</p>
              </div>
            ) : (
              <>
                {!userCredentials ? (
                  <div className="bg-card border border-border rounded-lg p-6 text-center">
                    <p className="text-foreground font-semibold mb-2">Please login to place a bid</p>
                    <button onClick={() => router.push('/')} className="text-primary hover:text-primary/80 font-semibold">
                      Go back to login →
                    </button>
                  </div>
                ) : (
                  <BidSliderInput
                    currentBid={item.current_bid || 0}
                    startingPrice={item.starting_price || 0}
                    onBidSubmit={handleBidSubmit}
                    isLoading={false}
                    hasBidAlready={hasBidAlready}
                    existingBidAmount={existingBidAmount ?? undefined}
                  />
                )}

                {/* Bid Success */}
                {bidSuccess && (
                  <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-6 text-center">
                    <div className="text-4xl mb-2">✅</div>
                    <p className="text-green-500 font-bold text-xl mb-1">Bid Placed Successfully!</p>
                    <p className="text-muted-foreground text-sm">
                      Jopesh will contact you via Messenger if you win. Good luck! 🎉
                    </p>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* ✅ FIXED: Leaderboard OUTSIDE the grid, always visible for auctions */}
        {isAuction && bids.length > 0 && (
          <div className="mt-12">
            <h2 className="text-2xl font-bold text-foreground mb-6">Bid Leaderboard</h2>
            <div className="bg-card border border-border rounded-lg overflow-hidden">
              <div className="divide-y divide-border">
                {bids.map((bid, index) => {
                  const rank = index + 1
                  const medal = rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : null
                  const rankColor = rank === 1
                    ? 'border-l-4 border-yellow-500 bg-yellow-500/5'
                    : rank === 2
                    ? 'border-l-4 border-gray-400 bg-gray-400/5'
                    : rank === 3
                    ? 'border-l-4 border-amber-600 bg-amber-600/5'
                    : ''

                  return (
                    <div key={bid.id} className={`p-4 flex items-center justify-between ${rankColor}`}>
                      <div className="flex items-center gap-3">
                        <div className="text-2xl w-8 text-center">
                          {medal ?? <span className="text-sm text-muted-foreground font-bold">#{rank}</span>}
                        </div>
                        <div>
                          <div className="font-semibold text-foreground text-sm">
                            {bid.bidder_name}
                            {bid.bidder_email === userCredentials?.email && (
                              <span className="ml-2 text-xs bg-primary/20 text-primary px-2 py-0.5 rounded-full">You</span>
                            )}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {new Date(bid.placed_at).toLocaleDateString()} at {new Date(bid.placed_at).toLocaleTimeString()}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-xl font-bold text-foreground">
                          ₱{bid.amount.toLocaleString()}
                        </div>
                        {rank === 1 && (
                          <div className="text-xs text-yellow-500 font-semibold">Current Highest</div>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
            <p className="text-xs text-muted-foreground text-center mt-4">
              Top 3 bidders will be contacted via Messenger when auction ends.
            </p>
          </div>
        )}

      </div>
    </main>
  )
}