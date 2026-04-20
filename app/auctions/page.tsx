'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

interface Item {
  id: string
  title: string
  description: string
  image_url: string
  images?: string[]
  current_bid: number
  starting_price?: number
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
        setItems([
          ...data.filter(i => i.status !== 'ended'),
          ...data.filter(i => i.status === 'ended'),
        ])
      }
      setLoading(false)
    }

    fetchItems()

    const subscription = supabase
      .channel('items-auction-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'items', filter: 'type=eq.auction' },
        (payload) => {
          if (payload.eventType === 'UPDATE') {
            setItems((prev) => prev.map((item) => item.id === payload.new.id ? payload.new as Item : item))
          } else if (payload.eventType === 'INSERT') {
            setItems((prev) => [payload.new as Item, ...prev])
          }
        }
      )
      .subscribe()

    return () => { subscription.unsubscribe() }
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
      <div className="container mx-auto px-4 sm:px-8 py-8">

        <button
          onClick={() => router.push('/')}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 transition-colors group"
        >
          <span className="text-xl group-hover:-translate-x-1 transition-transform">←</span>
          <span>Back to JOPESH</span>
        </button>

        <header className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-foreground">
            Active Auctions{' '}
            <span className="text-muted-foreground text-2xl">({items.length})</span>
          </h1>
          <p className="text-muted-foreground mt-2">Browse and bid on premium items</p>
        </header>

        {items.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground text-lg">No auctions available at the moment</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
            {items.map((item) => {
              const isEnded = item.status === 'ended'
              const thumbnail = item.images?.[0] ?? item.image_url

              return (
                <Link href={`/item/${item.id}`} key={item.id}>
                  <div className="bg-card border border-border rounded-lg overflow-hidden hover:shadow-lg transition-shadow cursor-pointer h-full flex flex-col relative group">

                    {/* SOLD overlay — same as homepage carousel */}
                    {isEnded && (
                      <div className="absolute inset-0 z-10 flex items-center justify-center pointer-events-none">
                        <div className="bg-black/25 rounded-md px-5 py-2">
                          <span className="text-white font-bold text-lg tracking-widest">SOLD</span>
                        </div>
                      </div>
                    )}

                    {/* IMAGE — matches homepage: aspectRatio 1/1, plain <img>, same classes */}
                    <div className="w-full bg-secondary overflow-hidden relative" style={{ aspectRatio: '1/1' }}>
                      {thumbnail ? (
                        <img
                          src={thumbnail}
                          alt={item.title}
                          className={`w-full h-full object-cover transition-transform duration-300 group-hover:scale-105 ${isEnded ? 'opacity-50' : ''}`}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                          No image
                        </div>
                      )}
                      <div className="absolute top-2 right-2 px-3 py-1 rounded text-xs font-semibold bg-primary text-primary-foreground">
                        AUCTION
                      </div>
                    </div>

                    <div className="p-4 flex-1 flex flex-col">
                      <h3 className="text-base font-semibold text-foreground mb-1 line-clamp-1">
                        {item.title}
                      </h3>
                      <p className="text-xs text-muted-foreground mb-3 line-clamp-2 flex-1">
                        {item.description?.substring(0, 100) || 'No description'}...
                      </p>
                      <div className="flex justify-between items-center mt-auto">
                        <div>
                          <div className="text-xs text-muted-foreground">
                            {isEnded ? 'Final bid' : 'Current Bid'}
                          </div>
                          <div className="text-xl font-bold text-foreground">
                            {item.current_bid ? `₱${item.current_bid.toLocaleString()}` : '—'}
                          </div>
                        </div>
                        <span className={`text-xs px-2 py-1 rounded font-semibold ${isEnded ? 'bg-red-500/10 text-red-400' : 'bg-primary/10 text-primary'}`}>
                          {isEnded ? 'Sold' : `${item.bid_count || 0} bids`}
                        </span>
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