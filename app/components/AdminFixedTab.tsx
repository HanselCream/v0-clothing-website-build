// app/components/AdminFixedTab.tsx
'use client'

import Image from 'next/image'

interface Item {
  id: string
  title: string
  type: 'fixed' | 'auction'
  price?: number
  description?: string
  image_url?: string
}

interface AdminFixedTabProps {
  items: Item[]
}

export default function AdminFixedTab({ items }: AdminFixedTabProps) {
  return (
    <div className="space-y-6">
      {items.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          No fixed items available
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((item) => (
            <div
              key={item.id}
              className="bg-card border border-border rounded-lg overflow-hidden hover:shadow-lg transition-shadow"
            >
              {/* Image */}
              {item.image_url && (
                <div className="relative h-48 bg-secondary">
                  <Image
                    src={item.image_url}
                    alt={item.title}
                    fill
                    className="object-cover"
                  />
                </div>
              )}
              
              {/* Content */}
              <div className="p-6">
                <h3 className="font-semibold text-foreground mb-2 text-xl">
                  {item.title}
                </h3>
                {item.description && (
                  <p className="text-sm text-muted-foreground mb-4 line-clamp-3">
                    {item.description}
                  </p>
                )}
                <div className="text-3xl font-bold text-foreground mb-4">
                  ₱{item.price?.toLocaleString()}
                </div>
                <div className="text-xs text-muted-foreground p-3 bg-secondary rounded-lg">
                  <p className="font-semibold mb-1">📱 Payment Instructions:</p>
                  <p>Contact Jopesh via Messenger to arrange payment and delivery.</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}