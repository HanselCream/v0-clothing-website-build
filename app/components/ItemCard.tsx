'use client'

import Link from 'next/link'
import Image from 'next/image'

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

export default function ItemCard({ item }: { item: Item }) {
  const isAuction = item.type === 'auction'
  const endDate = isAuction && item.auction_end_date
    ? new Date(item.auction_end_date)
    : null
  const isEnded = endDate ? endDate < new Date() : false

  const timeRemaining = endDate ? (() => {
    const now = new Date()
    const diff = endDate.getTime() - now.getTime()
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const days = Math.floor(hours / 24)
    
    if (diff <= 0) return 'Ended'
    if (days > 0) return `${days}d ${hours % 24}h left`
    return `${hours}h left`
  })() : null

  return (
    <Link href={`/item/${item.id}`}>
      <div className="bg-card border border-border rounded-lg overflow-hidden hover:shadow-lg transition-shadow cursor-pointer">
        <div className="relative h-48 bg-secondary">
          {item.image_url ? (
            <Image
              src={item.image_url}
              alt={item.title}
              fill
              className="object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-muted-foreground">
              No image
            </div>
          )}
          {isAuction && (
            <div className="absolute top-2 right-2 bg-primary text-primary-foreground px-3 py-1 rounded text-sm font-semibold">
              AUCTION
            </div>
          )}
          {isEnded && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <span className="text-white font-bold text-lg">Ended</span>
            </div>
          )}
        </div>

        <div className="p-4">
          <h3 className="text-lg font-semibold text-foreground mb-2 line-clamp-2">
            {item.title}
          </h3>
          <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
            {item.description}
          </p>

          <div className="flex items-end justify-between">
            <div>
              {isAuction ? (
                <>
                  <div className="text-xs text-muted-foreground">Starting bid</div>
                  <div className="text-2xl font-bold text-foreground">
                    ${item.starting_price?.toFixed(2)}
                  </div>
                </>
              ) : (
                <>
                  <div className="text-xs text-muted-foreground">Price</div>
                  <div className="text-2xl font-bold text-foreground">
                    ${item.price.toFixed(2)}
                  </div>
                </>
              )}
            </div>
            <div className="text-right">
              {timeRemaining && (
                <div className={`text-sm font-semibold ${
                  isEnded ? 'text-red-500' : 'text-muted-foreground'
                }`}>
                  {timeRemaining}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Link>
  )
}
