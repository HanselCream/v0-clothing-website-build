import { Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'

function SuccessContent() {
  const searchParams = useSearchParams()
  const itemId = searchParams.get('item_id')

  return (
    <main className="min-h-screen bg-background flex items-center justify-center">
      <div className="container mx-auto px-4">
        <div className="max-w-md mx-auto bg-card border border-border rounded-lg p-8 text-center">
          <div className="mb-6">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-500/10 mb-4">
              <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Success!</h1>
          <p className="text-muted-foreground mb-6">
            Your order has been confirmed. You will receive a confirmation email shortly.
          </p>
          <div className="space-y-3">
            {itemId && (
              <Link href={`/item/${itemId}`} className="inline-block bg-secondary text-foreground font-semibold py-2 px-4 rounded-lg hover:bg-secondary/80 transition-colors w-full">
                View Item
              </Link>
            )}
            <Link href="/" className="inline-block bg-primary text-primary-foreground font-semibold py-2 px-4 rounded-lg hover:bg-primary/90 transition-colors w-full">
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    </main>
  )
}

export default function SuccessPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-background flex items-center justify-center"><p className="text-foreground">Loading...</p></div>}>
      <SuccessContent />
    </Suspense>
  )
}