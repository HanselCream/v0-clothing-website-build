// app/admin/page.tsx
'use client'

import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import AdminPasswordModal from '@/app/components/AdminPasswordModal'
import AdminAuctionTab from '@/app/components/AdminAuctionTab'
import AdminFixedTab from '@/app/components/AdminFixedTab'

interface Item {
  id: string
  title: string
  type: 'fixed' | 'auction'
  auction_end_date?: string
  price?: number
  starting_price?: number
  status?: string
}

interface Bid {
  id: string
  item_id: string
  bidder_name: string
  bidder_email: string
  bidder_phone: string
  bidder_address: string
  amount: number
}

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [items, setItems] = useState<Item[]>([])
  const [bids, setBids] = useState<Bid[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'auctions' | 'fixed'>('auctions')

  const fetchData = useCallback(async () => {
    const { data: itemsData } = await supabase
      .from('items')
      .select('*')
      .order('created_at', { ascending: false })

    const { data: bidsData } = await supabase
      .from('bids')
      .select('*')

    if (itemsData) setItems(itemsData)
    if (bidsData) setBids(bidsData)
    setLoading(false)
  }, [])

  useEffect(() => {
    if (isAuthenticated) {
      fetchData()
    }
  }, [isAuthenticated, fetchData])

  if (!isAuthenticated) {
    return <AdminPasswordModal onSuccess={() => setIsAuthenticated(true)} />
  }

  const auctionItems = items.filter(item => item.type === 'auction')
  const fixedItems = items.filter(item => item.type === 'fixed')

  return (
    <main className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <header className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">
            Admin Dashboard
          </h1>
          <p className="text-muted-foreground">
            Manage auctions and fixed items
          </p>
        </header>

        {loading ? (
          <div className="text-center text-foreground">Loading...</div>
        ) : (
          <>
            <div className="flex gap-2 mb-8 border-b border-border">
              <button
                onClick={() => setActiveTab('auctions')}
                className={`px-4 py-2 font-semibold transition-colors ${
                  activeTab === 'auctions'
                    ? 'text-foreground border-b-2 border-primary'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Auctions ({auctionItems.length})
              </button>
              <button
                onClick={() => setActiveTab('fixed')}
                className={`px-4 py-2 font-semibold transition-colors ${
                  activeTab === 'fixed'
                    ? 'text-foreground border-b-2 border-primary'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Fixed Items ({fixedItems.length})
              </button>
            </div>

            {activeTab === 'auctions' ? (
              <AdminAuctionTab items={auctionItems} bids={bids} onDataChanged={fetchData} />
            ) : (
              <AdminFixedTab items={fixedItems} />
            )}
          </>
        )}
      </div>
    </main>
  )
}