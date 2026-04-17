'use client'

import { useEffect, useState, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import Image from 'next/image'

interface Item {
  id: string
  title: string
  description: string
  price: number
  type: 'fixed' | 'auction'
  image_url: string
  images?: string[]
  auction_end_date?: string
  starting_price?: number
  current_bid: number
  bid_count: number
  status: string
}

export default function ItemPage() {
  const params = useParams()
  const router = useRouter()
  const id = params.id as string

  const [item, setItem] = useState<Item | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [userCredentials, setUserCredentials] = useState<any>(null)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [allImages, setAllImages] = useState<string[]>([])
  const [isZoomed, setIsZoomed] = useState(false)
const [zoomOrigin, setZoomOrigin] = useState('center center')

const fetchItem = useCallback(async () => {
  const { data, error: itemError } = await supabase
    .from('items')
    .select('*')
    .eq('id', id)
    .single()

  if (itemError || !data) {
    setError('Item not found')
    setLoading(false)
    return
  }

  setItem(data)
  
  // Use the images array from database - already has correct URLs
  if (data.images && Array.isArray(data.images) && data.images.length > 0) {
    setAllImages(data.images)
  } else {
    // Fallback to single image
    setAllImages([data.image_url])
  }
  
  setLoading(false)
}, [id])

  useEffect(() => {
    const storedUser = localStorage.getItem('user_credentials')
    if (storedUser) {
      setUserCredentials(JSON.parse(storedUser))
    }
    fetchItem()
  }, [id, fetchItem])

  const nextImage = () => {
    if (currentImageIndex < allImages.length - 1) {
      setCurrentImageIndex(currentImageIndex + 1)
    }
  }

  const prevImage = () => {
    if (currentImageIndex > 0) {
      setCurrentImageIndex(currentImageIndex - 1)
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center text-foreground">Loading...</div>
        </div>
      </main>
    )
  }

  if (error || !item) {
    return (
      <main className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="text-destructive">{error || 'Item not found'}</div>
        </div>
      </main>
    )
  }

  const isAuction = item.type === 'auction'
  const hasMultipleImages = allImages.length > 1

  return (
    <main className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Back Button */}
        <button
          onClick={() => router.push('/')}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 transition-colors group"
        >
          <span className="text-xl group-hover:-translate-x-1 transition-transform">←</span>
          <span>Back to JOPESH</span>
        </button>

        {/* User Info Bar */}
        {userCredentials && (
          <div className="bg-card border border-border rounded-lg p-3 mb-6 flex items-center gap-4 text-sm">
            <span className="text-muted-foreground">Viewing as:</span>
            <span className="font-semibold text-foreground">{userCredentials.nickname}</span>
            <span className="text-muted-foreground">|</span>
            <span className="text-muted-foreground">{userCredentials.email}</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
{/* Image Gallery Section */}
<div className="space-y-4">
  {/* Main Image */}
  <div
    className="relative bg-secondary rounded-lg overflow-hidden select-none"
    style={{ aspectRatio: '1 / 1' }}
    onTouchStart={(e) => { (e.currentTarget as any)._touchStartX = e.touches[0].clientX }}
    onTouchEnd={(e) => {
      const diff = (e.currentTarget as any)._touchStartX - e.changedTouches[0].clientX
      if (Math.abs(diff) > 50) { if (diff > 0) nextImage(); else prevImage() }
    }}
  >
    {allImages[currentImageIndex] ? (
      <div
        className="relative w-full h-full cursor-zoom-in"
        style={{ aspectRatio: '1 / 1', transform: isZoomed ? 'scale(2)' : 'scale(1)', transition: 'transform 0.3s ease', transformOrigin: zoomOrigin }}
        onClick={(e) => {
          if (!isZoomed) {
            const rect = e.currentTarget.getBoundingClientRect()
            setZoomOrigin(`${((e.clientX - rect.left) / rect.width) * 100}% ${((e.clientY - rect.top) / rect.height) * 100}%`)
          }
          setIsZoomed(!isZoomed)
        }}
      >
        <Image
          src={allImages[currentImageIndex]}
          alt={`${item.title} - image ${currentImageIndex + 1}`}
          fill
          className="object-contain p-2"
          sizes="(max-width: 768px) 100vw, 50vw"
          priority={currentImageIndex === 0}
          unoptimized
        />
      </div>
    ) : (
      <div className="w-full h-full flex items-center justify-center text-muted-foreground">No image available</div>
    )}

    {/* SOLD overlay */}
    <div className="absolute inset-0 z-20 flex items-center justify-center pointer-events-none">
      <div className="bg-black/70 rounded-full px-6 py-3 border-2 border-red-500 rotate-12">
        <span className="text-white font-bold text-2xl tracking-widest">SOLD</span>
      </div>
    </div>

    {/* Arrows — hidden when zoomed */}
    {hasMultipleImages && !isZoomed && (
      <>
        <button onClick={prevImage} disabled={currentImageIndex === 0}
          className="absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-black/70 disabled:opacity-30 z-30">←</button>
        <button onClick={nextImage} disabled={currentImageIndex === allImages.length - 1}
          className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-black/70 disabled:opacity-30 z-30">→</button>
      </>
    )}

    {/* Counter */}
    {hasMultipleImages && (
      <div className="absolute bottom-2 right-2 bg-black/50 text-white text-xs px-3 py-1 rounded-full z-30">
        {currentImageIndex + 1} / {allImages.length}
      </div>
    )}

    {/* Zoom hint */}
    <div className="absolute bottom-2 left-2 bg-black/40 text-white text-xs px-2 py-1 rounded-full z-30">
      {isZoomed ? 'tap to zoom out' : 'tap to zoom'}
    </div>
  </div>

  {/* Thumbnails */}
  {hasMultipleImages && (
    <div className="flex gap-2 overflow-x-auto pb-2">
      {allImages.map((img, idx) => (
        <button key={idx} onClick={() => { setCurrentImageIndex(idx); setIsZoomed(false) }}
          className={`relative w-16 h-16 rounded-lg overflow-hidden border-2 flex-shrink-0 transition-all ${
            currentImageIndex === idx ? 'border-primary ring-2 ring-primary/50' : 'border-transparent opacity-60 hover:opacity-100'
          }`}>
          <Image src={img} alt={`thumbnail ${idx + 1}`} fill className="object-cover" unoptimized />
        </button>
      ))}
    </div>
  )}
</div>

          {/* Details Section */}
          <div className="flex flex-col justify-between">
            <div>
              <div className="mb-4">
                <span className="inline-block bg-primary text-primary-foreground px-3 py-1 rounded text-sm font-semibold mb-4">
                  {isAuction ? 'AUCTION' : 'FIXED PRICE'}
                </span>
              </div>

              <h1 className="text-4xl font-bold text-foreground mb-4">
                {item.title}
              </h1>

              <p className="text-lg text-muted-foreground mb-6 whitespace-pre-line">
                {item.description}
              </p>

              {/* Pricing Info */}
              <div className="bg-card border border-border rounded-lg p-6 mb-6">
                {isAuction ? (
                  <>
                    <div className="mb-4">
                      <div className="text-sm text-muted-foreground mb-1">Starting bid</div>
                      <div className="text-3xl font-bold text-foreground">
                        ₱{(item.starting_price || 0).toLocaleString()}
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="text-sm text-muted-foreground mb-1">Original Price</div>
                    <div className="text-3xl font-bold text-foreground">
                      ₱{item.price?.toLocaleString() || 0}
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* SOLD Message - No bidding available */}
            <div className="bg-card border border-border rounded-lg p-8 text-center">
              <div className="text-6xl mb-4">🔴</div>
              <p className="text-foreground font-bold text-2xl mb-2">SOLD</p>
              <p className="text-muted-foreground">This item has been sold. Thank you for your interest!</p>
              <p className="text-xs text-muted-foreground mt-4">Check back soon for new collections.</p>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}