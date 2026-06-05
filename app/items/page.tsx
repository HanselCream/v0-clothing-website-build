"use client"

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
  type: 'fixed' | 'auction'
  price?: number
  status?: string
}

export default function ItemsPage() {
  const [items, setItems] = useState<Item[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const storedUser = localStorage.getItem('user_credentials')
    if (!storedUser) {
      router.push('/')
      return
    }

// Load from cache instantly
const cached = sessionStorage.getItem('cache_fixed')
if (cached) {
  setItems(JSON.parse(cached))
  setLoading(false)
}

// Always refresh in background
const fetchItems = async () => {
  const { data } = await supabase
    .from('items')
    .select('*')
    .eq('type', 'fixed')
    .order('created_at', { ascending: false })

  if (data) {
    const sorted = [
      ...data.filter(i => i.status !== 'ended'),
      ...data.filter(i => i.status === 'ended'),
    ]
    setItems(sorted)
    sessionStorage.setItem('cache_fixed', JSON.stringify(sorted))
  }
  setLoading(false)
}

fetchItems()
  }, [router])

if (loading) {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-6">
      <h1 className="text-4xl font-bold text-foreground tracking-widest">JOPESH</h1>
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
    Collection{' '}
    <span className="text-muted-foreground text-2xl">({items.length})</span>
  </h1>
  <p className="text-muted-foreground mt-2">All items ready to purchase</p>
</header>

        {items.length === 0 ? (
          <div className="text-center py-20 bg-card rounded-lg border border-border">
            <p className="text-muted-foreground">No items available at the moment.</p>
          </div>
        ) : (
<div className="grid grid-cols-2 gap-4 sm:gap-6">
              {items.map((item) => {
              const isSold = item.status === 'ended'
              const thumbnail = item.images?.[0] ?? item.image_url

              return (
                <Link href={`/item/${item.id}`} key={item.id}>
                  <div className="bg-card border border-border rounded-lg overflow-hidden hover:shadow-lg transition-shadow cursor-pointer h-full flex flex-col relative group">

                    {/* SOLD overlay — same as homepage carousel */}
{isSold && (
  <div className="absolute inset-0 z-10 flex items-center justify-center pointer-events-none bg-black/50">
    <span className="text-white font-bold text-2xl tracking-widest text-center">SOLD</span>
  </div>
)}

                    {/* IMAGE — matches homepage: aspectRatio 1/1, plain <img>, same classes */}
                    <div className="w-full bg-secondary overflow-hidden relative" style={{ aspectRatio: '1/1' }}>
                      {thumbnail ? (
                        <img
                          src={thumbnail}
                          alt={item.title}
                          className={`w-full h-full object-cover transition-transform duration-300 group-hover:scale-105 ${isSold ? 'opacity-50' : ''}`}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                          No image
                        </div>
                      )}
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
    <div className="text-xl font-bold text-foreground">
      ₱{(item.price || 0).toLocaleString()}
    </div>
  </div>
  {/* Status badge removed */}
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