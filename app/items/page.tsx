"use client"

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

    const fetchItems = async () => {
      const { data } = await supabase
        .from('items')
        .select('*')
        .eq('type', 'fixed')
        .order('created_at', { ascending: false })

      if (data) setItems(data)
      setLoading(false)
    }

    fetchItems()
  }, [router])

  if (loading) {
    return (
      <main className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-foreground">Loading items...</div>
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
            Available for Purchase{' '}
            <span className="text-muted-foreground text-2xl">({items.length})</span>
          </h1>
          <p className="text-muted-foreground mt-2">All fixed-price items ready to buy now</p>
        </header>

        {items.length === 0 ? (
          <div className="text-center py-20 bg-card rounded-lg border border-border">
            <p className="text-muted-foreground">No items available at the moment.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
            {items.map((item) => {
              const isSold = item.status === 'ended'
              const thumbnail = item.images?.[0] ?? item.image_url

              return (
                <Link href={`/item/${item.id}`} key={item.id}>
                  <div className="bg-card border border-border rounded-lg overflow-hidden hover:shadow-lg transition-shadow cursor-pointer h-full flex flex-col relative group">
                    {isSold && (
                      <div className="absolute inset-0 z-10 flex items-center justify-center pointer-events-none">
                        <div className="bg-black/70 rounded-full px-5 py-2 border-2 border-red-500">
                          <span className="text-white font-bold text-lg tracking-widest">SOLD</span>
                        </div>
                      </div>
                    )}
                    <div className="relative h-48 bg-secondary overflow-hidden">
                      {thumbnail ? (
                        <Image
                          src={thumbnail}
                          alt={item.title}
                          fill
                          className={`object-cover transition-transform duration-300 group-hover:scale-105 ${isSold ? 'opacity-50' : ''}`}
                          unoptimized
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                          No image
                        </div>
                      )}
                      <div className="absolute top-2 right-2 px-3 py-1 rounded text-xs font-semibold bg-primary text-primary-foreground">
                        BUY NOW
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
                            {isSold ? 'Final price' : 'Price'}
                          </div>
                          <div className="text-xl font-bold text-foreground">
                            ₱{(item.price || 0).toLocaleString()}
                          </div>
                        </div>
                        <span className={`text-xs px-2 py-1 rounded font-semibold ${isSold ? 'bg-red-500/10 text-red-400' : 'bg-primary/10 text-primary'}`}>
                          {isSold ? 'Sold' : 'Buy Now'}
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
