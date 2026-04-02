'use client'

import { useState } from 'react'

interface Item {
  id: string
  title: string
  type: 'fixed' | 'auction'
  auction_end_date?: string
  starting_price?: number
  auction_ended?: boolean
}

interface Bid {
  id: string
  item_id: string
  bidder_name: string
  bidder_email: string
  bid_amount: number
}

interface AdminAuctionTabProps {
  items: Item[]
  bids: Bid[]
  onDataChanged: () => void
}

export default function AdminAuctionTab({
  items,
  bids,
  onDataChanged,
}: AdminAuctionTabProps) {
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [isError, setIsError] = useState(false)

  const endAuction = async (itemId: string) => {
    if (!confirm('Are you sure you want to end this auction?')) return

    setLoading(true)
    setMessage('')
    setIsError(false)

    try {
      const response = await fetch('/api/admin/end-auction', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          item_id: itemId,
          admin_password: process.env.NEXT_PUBLIC_ADMIN_PASSWORD,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        setIsError(true)
        setMessage(data.error || 'Failed to end auction')
      } else {
        setMessage(
          `Auction ended! Payment link sent to ${data.winner.email}`
        )
        onDataChanged()
      }
    } catch (error) {
      setIsError(true)
      setMessage('An error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {message && (
        <div
          className={`p-4 rounded-lg ${
            isError
              ? 'bg-red-500/10 text-red-500 border border-red-500/20'
              : 'bg-green-500/10 text-green-500 border border-green-500/20'
          }`}
        >
          {message}
        </div>
      )}

      {items.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          No auctions
        </div>
      ) : (
        <div className="space-y-4">
          {items.map((item) => {
            const itemBids = bids.filter((b) => b.item_id === item.id)
            const highestBid = itemBids[0]
            const endDate = item.auction_end_date
              ? new Date(item.auction_end_date)
              : null
            const isEnded =
              item.auction_ended || (endDate ? endDate < new Date() : false)

            return (
              <div
                key={item.id}
                className="bg-card border border-border rounded-lg p-6"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-semibold text-foreground">
                      {item.title}
                    </h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      Starting: ${item.starting_price?.toFixed(2)}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-foreground">
                      ${highestBid?.bid_amount.toFixed(2) || item.starting_price?.toFixed(2)}
                    </div>
                    <div
                      className={`text-sm font-semibold mt-1 ${
                        isEnded ? 'text-red-500' : 'text-green-500'
                      }`}
                    >
                      {isEnded ? 'Ended' : 'Active'}
                    </div>
                  </div>
                </div>

                {endDate && (
                  <p className="text-sm text-muted-foreground mb-4">
                    Ends: {endDate.toLocaleDateString()} at{' '}
                    {endDate.toLocaleTimeString()}
                  </p>
                )}

                <div className="mb-6 bg-secondary rounded-lg p-4">
                  <div className="text-sm font-semibold text-foreground mb-2">
                    Bids ({itemBids.length})
                  </div>
                  {itemBids.length > 0 ? (
                    <div className="space-y-2">
                      {itemBids.slice(0, 3).map((bid) => (
                        <div
                          key={bid.id}
                          className="flex justify-between text-sm"
                        >
                          <div className="text-muted-foreground">
                            {bid.bidder_name}
                          </div>
                          <div className="font-semibold text-foreground">
                            ${bid.bid_amount.toFixed(2)}
                          </div>
                        </div>
                      ))}
                      {itemBids.length > 3 && (
                        <div className="text-xs text-muted-foreground mt-2">
                          +{itemBids.length - 3} more bids
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-sm text-muted-foreground">
                      No bids yet
                    </div>
                  )}
                </div>

                {!isEnded && (
                  <button
                    onClick={() => endAuction(item.id)}
                    disabled={loading}
                    className="w-full bg-primary text-primary-foreground font-semibold py-2 rounded-lg hover:bg-primary/90 disabled:opacity-50 transition-colors"
                  >
                    {loading ? 'Processing...' : 'End Auction'}
                  </button>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
