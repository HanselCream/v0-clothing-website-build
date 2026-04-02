'use client'

import { useState } from 'react'

interface Item {
  id: string
  title: string
  type: 'fixed' | 'auction'
  auction_end_date?: string
  starting_price?: number
  status?: string
}

interface Bid {
  id: string
  item_id: string
  bidder_email: string
  amount: number
}

interface PodiumResult {
  rank: number
  bidder_email: string
  amount: number
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
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [isError, setIsError] = useState(false)
  const [podiumResults, setPodiumResults] = useState<Record<string, PodiumResult[]>>({})

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
        setPodiumResults(prev => ({
          ...prev,
          [itemId]: data.podium
        }))
        setMessage('Auction ended! Email sent to admin with winner details.')
        onDataChanged()
      }
    } catch (error) {
      setIsError(true)
      setMessage('An error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const getPodiumColor = (rank: number) => {
    switch(rank) {
      case 1: return '#FFD700' // Gold
      case 2: return '#C0C0C0' // Silver
      case 3: return '#CD7F32' // Bronze
      default: return '#ffffff'
    }
  }

  const getPodiumLabel = (rank: number) => {
    switch(rank) {
      case 1: return '🥇 Gold'
      case 2: return '🥈 Silver'
      case 3: return '🥉 Bronze'
      default: return ''
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
            const endDate = item.auction_end_date
              ? new Date(item.auction_end_date)
              : null
            const isEnded = item.status === 'ended' || (endDate ? endDate < new Date() : false)
            const podium = podiumResults[item.id]
            
            // Get highest unique bid by email
            const uniqueBidderMap = new Map<string, Bid>()
            itemBids.forEach(bid => {
              if (!uniqueBidderMap.has(bid.bidder_email) || bid.amount > (uniqueBidderMap.get(bid.bidder_email)?.amount || 0)) {
                uniqueBidderMap.set(bid.bidder_email, bid)
              }
            })
            const highestBid = Array.from(uniqueBidderMap.values()).sort((a, b) => b.amount - a.amount)[0]

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
                      ${highestBid?.amount.toFixed(2) || item.starting_price?.toFixed(2)}
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

                {/* Olympic Podium Results */}
                {podium && podium.length > 0 ? (
                  <div className="mb-6 bg-secondary rounded-lg p-4 border-2 border-primary">
                    <div className="text-sm font-semibold text-foreground mb-4">
                      🏆 Olympic Podium Results
                    </div>
                    <div className="space-y-3">
                      {podium.map((result) => (
                        <div
                          key={result.rank}
                          className="p-3 rounded-lg"
                          style={{ backgroundColor: getPodiumColor(result.rank) + '20', borderLeft: `4px solid ${getPodiumColor(result.rank)}` }}
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="font-semibold text-foreground">
                                {getPodiumLabel(result.rank)}
                              </div>
                              <div className="text-sm text-muted-foreground">
                                {result.bidder_email}
                              </div>
                            </div>
                            <div className="text-right font-bold text-foreground text-lg">
                              ${result.amount.toFixed(2)}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                    <p className="text-xs text-muted-foreground mt-4">
                      Winners contacted via Messenger
                    </p>
                  </div>
                ) : (
                  <div className="mb-6 bg-secondary rounded-lg p-4">
                    <div className="text-sm font-semibold text-foreground mb-2">
                      Bids ({itemBids.length})
                    </div>
                    {itemBids.length > 0 ? (
                      <div className="space-y-2">
                        {Array.from(uniqueBidderMap.values()).sort((a, b) => b.amount - a.amount).slice(0, 3).map((bid) => (
                          <div
                            key={bid.id}
                            className="flex justify-between text-sm"
                          >
                            <div className="text-muted-foreground text-xs">
                              {bid.bidder_email}
                            </div>
                            <div className="font-semibold text-foreground">
                              ${bid.amount.toFixed(2)}
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
                )}

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
