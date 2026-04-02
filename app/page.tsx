'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'
import ItemCard from './components/ItemCard'

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

export default function Home() {
  const [items, setItems] = useState<Item[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchItems = async () => {
      const { data, error } = await supabase
        .from('items')
        .select('*')
        .order('created_at', { ascending: false })

      if (!error && data) {
        setItems(data)
      }
      setLoading(false)
    }

    fetchItems()
  }, [])

  if (loading) {
    return (
      <main className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center text-foreground">Loading...</div>
        </div>
      </main>
    )
  }

  const fixedItems = items.filter(item => item.type === 'fixed')
  const auctionItems = items.filter(item => item.type === 'auction')

  return (
    <main className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <header className="mb-12">
          <h1 className="text-4xl font-bold text-foreground mb-2">
            Premium Auctions & Sales
          </h1>
          <p className="text-muted-foreground">
            Curated items available for auction or direct purchase
          </p>
        </header>

        {/* Fixed Price Items */}
        {fixedItems.length > 0 && (
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-foreground mb-6">
              Available for Purchase
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {fixedItems.map(item => (
                <ItemCard key={item.id} item={item} />
              ))}
            </div>
          </section>
        )}

        {/* Auction Items */}
        {auctionItems.length > 0 && (
          <section>
            <h2 className="text-2xl font-bold text-foreground mb-6">
              Active Auctions
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {auctionItems.map(item => (
                <ItemCard key={item.id} item={item} />
              ))}
            </div>
          </section>
        )}

        {items.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground text-lg">
              No items available at the moment
            </p>
          </div>
        )}
      </div>
    </main>
  )
}
