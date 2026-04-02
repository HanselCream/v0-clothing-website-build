'use client'

import { useEffect, useState, useCallback } from 'react'
import { useParams } from 'next/navigation'
import { createClient } from '@supabase/supabase-js'
import Image from 'next/image'
import BidForm from '@/app/components/BidForm'
import CheckoutForm from '@/app/components/CheckoutForm'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

interface Item {
  id: string
  title: string
  description: string
  price: number
  type: 'fixed' | 'auction'
  image_url: string
  auction_end_date?: string
  starting_price?: number
}

interface Bid {
  id: string
  bidder_name: string
  bid_amount: number
  created_at: string
}

export default function ItemPage() {
  const params = useParams()
  const id = params.id as string

  const [item, setItem] = useState<Item | null>(null)
  const [bids, setBids] = useState<Bid[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

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
        .order('bid_amount', { ascending: false })

      if (bidsData) {
        setBids(bidsData)
      }
    }

    setLoading(false)
  }, [id])

  useEffect(() => {
    fetchItem()

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
            setBids(prev => [newBid, ...prev].sort((a, b) => b.bid_amount - a.bid_amount))
          }
        )
        .subscribe()

      return () => {
        subscription.unsubscribe()
      }
    }
  }, [id, item?.type, fetchItem])

  if (loading) {
    return (
      <main className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="text-foreground">Loading...</div>
        </div>
      </main>
    )
  }

  if (error || !item) {
    return (
      <main className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="text-red-500">{error || 'Item not found'}</div>
        </div>
      </main>
    )
  }

  const isAuction = item.type === 'auction'
  const endDate = isAuction && item.auction_end_date ? new Date(item.auction_end_date) : null
  const isEnded = endDate ? endDate < new Date() : false
  const highestBid = bids[0]?.bid_amount || item.starting_price

  return (
    <main className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <a href="/" className="text-muted-foreground hover:text-foreground mb-6 inline-block">
          ← Back to items
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
                        ${highestBid?.toFixed(2)}
                      </div>
                    </div>
                    {endDate && (
                      <div className="text-sm">
                        <span className={isEnded ? 'text-red-500 font-semibold' : 'text-muted-foreground'}>
                          {isEnded ? 'Auction ended' : `Ends: ${endDate.toLocaleDateString()} at ${endDate.toLocaleTimeString()}`}
                        </span>
                      </div>
                    )}
                  </>
                ) : (
                  <>
                    <div className="text-sm text-muted-foreground mb-1">Price</div>
                    <div className="text-3xl font-bold text-foreground">
                      ${item.price?.toFixed(2)}
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Forms */}
            {isAuction && !isEnded ? (
              <BidForm itemId={id} onBidPlaced={fetchItem} />
            ) : !isAuction ? (
              <CheckoutForm itemId={id} />
            ) : (
              <div className="bg-secondary text-foreground p-4 rounded-lg text-center">
                <p className="font-semibold">This auction has ended</p>
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
                    <div>
                      <div className="font-semibold text-foreground">
                        {bid.bidder_name}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {new Date(bid.created_at).toLocaleDateString()}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xl font-bold text-foreground">
                        ${bid.bid_amount.toFixed(2)}
                      </div>
                      {index === 0 && (
                        <span className="text-xs text-primary font-semibold">Highest</span>
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
