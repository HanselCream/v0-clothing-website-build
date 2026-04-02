'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import Image from 'next/image'

interface Item {
  id: string
  title: string
  description: string
  image_url: string
  current_bid: number
  bid_count: number
  status: string
  auction_end_date?: string
}

export default function AuctionsPage() {
  const [items, setItems] = useState<Item[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchItems = async () => {
      const { data, error } = await supabase
        .from('items')
        .select('*')
        .eq('type', 'auction')
        .order('created_at', { ascending: false })

      if (!error && data) {
        setItems(data)
      }
      setLoading(false)
    }

    fetchItems()

    // Subscribe to real-time updates
    const subscription = supabase
      .channel('items-auction-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'items',
          filter: `type=eq.auction`,
        },
        (payload) => {
          if (payload.eventType === 'UPDATE') {
            setItems((prev) =>
              prev.map((item) =>
                item.id === payload.new.id ? payload.new : item
              )
            )
          } else if (payload.eventType === 'INSERT') {
            setItems((prev) => [payload.new, ...prev])
          }
        }
      )
      .subscribe()

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  if (loading) {
    return (
      <main className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center text-foreground">Loading auctions...</div>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <header className="mb-12">
          <h1 className="text-4xl font-bold text-foreground mb-2">
            Active Auctions
          </h1>
          <p className="text-muted-foreground">
            Browse and bid on premium items
          </p>
        </header>

        {items.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground text-lg">
              No auctions available at the moment
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {items.map((item) => {
              const isEnded = item.status === 'ended'

              return (
                <div key={item.id}>
                  <Link
                    href={isEnded ? '#' : `/item/${item.id}`}
                    className={isEnded ? 'cursor-not-allowed' : ''}
                  >
                    <div
                      className={`bg-card border border-border rounded-lg overflow-hidden transition-opacity ${
                        isEnded ? 'opacity-60' : 'hover:opacity-90'
                      }`}
                    >
                      {/* Image Container */}
                      <div className="relative w-full h-48 bg-secondary overflow-hidden">
                        {item.image_url ? (
                          <Image
                            src={item.image_url}
                            alt={item.title}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                            No image
                          </div>
                        )}

                        {/* Ended Banner */}
                        {isEnded && (
                          <div className="absolute inset-0 bg-destructive/80 flex items-center justify-center">
                            <span className="text-destructive-foreground font-bold text-lg">
                              Auction Ended
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Content */}
                      <div className="p-4">
                        <h3 className="text-lg font-semibold text-foreground mb-2 truncate">
                          {item.title}
                        </h3>
                        <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                          {item.description || 'No description'}
                        </p>

                        <div className="space-y-2">
                          <div className="flex justify-between items-end">
                            <span className="text-sm text-muted-foreground">
                              Current Bid
                            </span>
                            <span className="text-2xl font-bold text-foreground">
                              ₱{item.current_bid.toLocaleString()}
                            </span>
                          </div>

                          <div className="flex justify-between items-center pt-2 border-t border-border">
                            <span className="text-xs text-muted-foreground">
                              {item.bid_count} bid{item.bid_count !== 1 ? 's' : ''}
                            </span>
                            {!isEnded && (
                              <span className="text-xs text-primary font-semibold">
                                Click to bid
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </Link>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </main>
  )
}
