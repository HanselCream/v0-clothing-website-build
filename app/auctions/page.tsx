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
  const [userNickname, setUserNickname] = useState('')
  const router = useRouter()

  useEffect(() => {
    const storedUser = localStorage.getItem('user_credentials')
    if (!storedUser) {
      router.push('/')
      return
    }
    const user = JSON.parse(storedUser)
    setUserNickname(user.nickname || user.email)
    

// Load from cache instantly
sessionStorage.removeItem('cache_auction')
const cached = sessionStorage.getItem('cache_auction')
if (cached) {
  setItems(JSON.parse(cached))
  setLoading(false)
}

  // Always refresh in background
  const fetchItems = async () => {
    const { data, error } = await supabase
      .from('items')
      .select('*')
      .eq('type', 'auction')
      .order('sort_order', { ascending: true })

    if (!error && data) {
      const sorted = [
        ...data.filter(i => i.status !== 'ended'),
        ...data.filter(i => i.status === 'ended'),
      ]
      setItems(sorted)
      sessionStorage.setItem('cache_auction', JSON.stringify(sorted))
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
    <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-6">
<div className="mb-4">
  <img 
    src="/jopesh-logo.png" 
    alt="JOPESH" 
    className="w-auto h-20 sm:h-24 md:h-28 mx-auto"
  />
</div>
      <p className="text-sm text-muted-foreground tracking-widest uppercase">Wearable Art — Curated & Reworked</p>
      <div className="flex gap-2 mt-4">
        <span className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '0ms' }} />
        <span className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '150ms' }} />
        <span className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '300ms' }} />
      </div>
    </div>
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
    Auctions{' '}
    <span className="text-muted-foreground text-2xl">({items.length})</span>
  </h1>
  <p className="text-muted-foreground mt-2">Browse and bid on premium items</p>
</header>

        {items.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground text-lg">No auctions available at the moment</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6">
            {items.map((item) => {
              const isEnded = item.status === 'ended'
              const thumbnail = item.images?.[0] ?? item.image_url

              return (
                <Link href={`/item/${item.id}`} key={item.id}>
                  <div className="bg-card border border-border rounded-lg overflow-hidden hover:shadow-lg transition-shadow cursor-pointer h-full flex flex-col relative group">

                    {/* SOLD overlay — same as homepage carousel */}
{isEnded && (
  <div className="absolute inset-0 z-10 flex items-center justify-center pointer-events-none bg-black/50">
    <span className="text-white font-bold text-xl tracking-widest text-center">AUCTION<br />ENDED</span>
  </div>
)}

                    {/* IMAGE — matches homepage: aspectRatio 1/1, plain <img>, same classes */}
                    <div className="w-full bg-secondary overflow-hidden relative" style={{ aspectRatio: '1/1' }}>
                      {thumbnail ? (
                        <img
                          src={thumbnail}
                          alt={item.title}
                          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                          No image
                        </div>
                      )}

                    </div>

<div className="p-2 sm:p-4 flex-1 flex flex-col">
  <h3 className="text-xs sm:text-base font-semibold text-foreground mb-1 line-clamp-1">
    {item.title}
  </h3>
  <div className="flex justify-between items-end mt-auto">
    <div>
      <div className="text-sm sm:text-xl font-bold text-foreground">
        ₱{(item.starting_price ?? 0).toLocaleString()}
      </div>
      {(item.bid_count ?? 0) > 0 && (
        <div className="text-xs text-muted-foreground mt-0.5">
          {item.bid_count} bid{item.bid_count !== 1 ? 's' : ''}
        </div>
      )}
    </div>
  </div>
</div>
                  </div>
                </Link>
              )
            })}
          </div>
        )}
<div className="mt-12 bg-card border border-border rounded-lg p-3 sm:p-4 flex flex-col sm:flex-row justify-between items-center gap-3">
          <div className="flex flex-wrap items-center gap-2 sm:gap-4">
            <span className="text-sm text-muted-foreground">Bidding as:</span>
            <span className="font-semibold text-foreground">{userNickname}</span>
          </div>
        </div>
      </div>
    </main>
  )
}