'use client'

interface Item {
  id: string
  title: string
  type: 'fixed' | 'auction'
  price?: number
  description?: string
}

interface AdminFixedTabProps {
  items: Item[]
}

export default function AdminFixedTab({ items }: AdminFixedTabProps) {
  return (
    <div className="space-y-6">
      {items.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          No fixed items
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map((item) => (
            <div
              key={item.id}
              className="bg-card border border-border rounded-lg p-6"
            >
              <h3 className="font-semibold text-foreground mb-2 text-lg">
                {item.title}
              </h3>
              {item.description && (
                <p className="text-sm text-muted-foreground mb-4">
                  {item.description}
                </p>
              )}
              <div className="text-2xl font-bold text-foreground">
                ${item.price?.toFixed(2)}
              </div>
              <div className="text-xs text-muted-foreground mt-4 p-2 bg-secondary rounded">
                <p>Payment handled manually via Messenger</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
