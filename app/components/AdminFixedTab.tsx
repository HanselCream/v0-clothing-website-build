'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

interface Item {
  id: string
  title: string
  type: 'fixed' | 'auction'
  price?: number
}

interface Order {
  id: string
  item_id: string
  customer_name: string
  customer_email: string
  total_price: number
  created_at: string
}

interface AdminFixedTabProps {
  items: Item[]
}

export default function AdminFixedTab({ items }: AdminFixedTabProps) {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchOrders = async () => {
      const { data } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false })

      if (data) {
        setOrders(data)
      }
      setLoading(false)
    }

    fetchOrders()

    // Subscribe to order changes
    const subscription = supabase
      .channel('orders-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'orders',
        },
        (payload) => {
          const newOrder = payload.new as Order
          setOrders((prev) => [newOrder, ...prev])
        }
      )
      .subscribe()

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  if (loading) {
    return <div className="text-center text-foreground">Loading orders...</div>
  }

  const fixedItemOrders = orders.filter((order) => {
    const item = items.find((i) => i.id === order.item_id)
    return item?.type === 'fixed'
  })

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground mb-4">
          Items ({items.length})
        </h2>
        {items.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            No fixed items
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {items.map((item) => (
              <div
                key={item.id}
                className="bg-card border border-border rounded-lg p-4"
              >
                <h3 className="font-semibold text-foreground mb-2">
                  {item.title}
                </h3>
                <div className="text-2xl font-bold text-foreground">
                  ${item.price?.toFixed(2)}
                </div>
                <div className="text-xs text-muted-foreground mt-2">
                  {fixedItemOrders.filter((o) => o.item_id === item.id)
                    .length > 0 && (
                    <span>
                      {fixedItemOrders.filter((o) => o.item_id === item.id)
                        .length}{' '}
                      order(s)
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="border-t border-border pt-6">
        <h2 className="text-2xl font-bold text-foreground mb-4">
          Orders ({fixedItemOrders.length})
        </h2>
        {fixedItemOrders.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            No orders yet
          </div>
        ) : (
          <div className="bg-card border border-border rounded-lg overflow-hidden">
            <div className="divide-y divide-border">
              {fixedItemOrders.map((order) => {
                const item = items.find((i) => i.id === order.item_id)
                return (
                  <div key={order.id} className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <div className="font-semibold text-foreground">
                          {order.customer_name}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {order.customer_email}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold text-foreground">
                          ${order.total_price.toFixed(2)}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {item?.title}
                        </div>
                      </div>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {new Date(order.created_at).toLocaleDateString()} at{' '}
                      {new Date(order.created_at).toLocaleTimeString()}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
