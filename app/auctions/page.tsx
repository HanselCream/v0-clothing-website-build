'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'

interface Item {
  id: string
  title: string
  description: string
  image_url: string
  images?: string[]
  current_bid: number
  bid_count: number
  status: string
  auction_end_date?: string
}

export default function AuctionsPage() {
  const [items, setItems] = useState<Item[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const storedUser = localStorage.getItem('user_credentials')
    if (!storedUser) {
      router.push('/')
      return
    }

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
                item.id === payload.new.id ? payload.new as Item : item
              )
            )
          } else if (payload.eventType === 'INSERT') {
            setItems((prev) => [payload.new as Item, ...prev])
          }
        }
      )
      .subscribe()

    return () => {
      subscription.unsubscribe()
    }
  }, [router])

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

        <button
          onClick={() => router.push('/')}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 transition-colors group"
        >
          <span className="text-xl group-hover:-translate-x-1 transition-transform">←</span>
          <span>Back to JOPESH</span>
        </button>

        <header className="mb-12">
          <h1 className="text-4xl font-bold text-foreground mb-2">
            Active Auctions{' '}
            <span className="text-muted-foreground text-2xl">({items.length})</span>
          </h1>
          <p className="text-muted-foreground">Browse and bid on premium items</p>
        </header>

        {items.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground text-lg">No auctions available at the moment</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {items.map((item) => {
              const isEnded = item.status === 'ended'
              const thumbnail = item.images?.[0] ?? item.image_url

              return (
                <Link href={`/item/${item.id}`} key={item.id}>
                  <div className="bg-card border border-border rounded-lg overflow-hidden hover:shadow-lg transition-shadow cursor-pointer h-full flex flex-col relative group">

                    {/* Image */}
                    <div className="relative w-full h-48 bg-secondary overflow-hidden">
                      {thumbnail ? (
                        <Image
                          src={thumbnail}
                          alt={item.title}
                          fill
                          className={`object-cover transition-transform duration-300 group-hover:scale-105 ${isEnded ? 'opacity-50' : ''}`}
                          unoptimized
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                          No image
                        </div>
                      )}

                      {isEnded && (
                        <div className="absolute inset-0 bg-destructive/80 flex items-center justify-center">
                          <span className="text-destructive-foreground font-bold text-lg">
                            Auction Ended
                          </span>
                        </div>
                      )}

                      <div className="absolute top-2 right-2 px-3 py-1 rounded text-xs font-semibold bg-primary text-primary-foreground">
                        AUCTION
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-4 flex-1 flex flex-col">
                      <h3 className="text-lg font-semibold text-foreground mb-2 truncate">
                        {item.title}
                      </h3>
                      <p className="text-sm text-muted-foreground mb-4 line-clamp-2 flex-1">
                        {item.description || 'No description'}
                      </p>

                      <div className="space-y-2 mt-auto">
                        <div className="flex justify-between items-end">
                          <span className="text-sm text-muted-foreground">
                            {isEnded ? 'Final bid' : 'Current Bid'}
                          </span>
                          <span className="text-2xl font-bold text-foreground">
                            {item.current_bid ? `₱${item.current_bid.toLocaleString()}` : '—'}
                          </span>
                        </div>

                        <div className="flex justify-between items-center pt-2 border-t border-border">
                          <span className="text-xs text-muted-foreground">
                            {item.bid_count} bid{item.bid_count !== 1 ? 's' : ''}
                          </span>
                          <span className={`text-xs font-semibold ${isEnded ? 'text-destructive' : 'text-primary'}`}>
                            {isEnded ? 'Sold' : 'Click to bid'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </div>
    </main>
  )
}