"use client"

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'

interface Item {
  id: string
  title: string
  description: string
  image_url: string
  images?: string[]
  type: 'fixed' | 'auction'
  price?: number
  starting_price?: number
  current_bid?: number
  bid_count?: number
  auction_end_date?: string
  status?: string
}

interface UserCredentials {
  nickname: string
  email: string
  location: string
  facebookName: string
  phoneNumber: string
}

// Auth Modal Component
function AuthModal({ onLogin }: { onLogin: (credentials: UserCredentials) => void }) {
  const [isSignup, setIsSignup] = useState(true)
  const [formData, setFormData] = useState({
    nickname: '',
    email: '',
    location: '',
    facebookName: '',
    phoneNumber: ''
  })
  const [loginEmail, setLoginEmail] = useState('')
  const [error, setError] = useState('')

  const handleSignup = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.nickname.trim()) { setError('Nickname is required'); return }
    if (!formData.email.trim() || !formData.email.includes('@')) { setError('Valid email address is required'); return }
    if (!formData.location.trim()) { setError('Location is required'); return }
    if (!formData.facebookName.trim()) { setError('Facebook name is required'); return }
    if (!formData.phoneNumber.trim()) { setError('Phone number is required'); return }
    localStorage.setItem('user_credentials', JSON.stringify(formData))
    onLogin(formData)
  }

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    if (!loginEmail.trim() || !loginEmail.includes('@')) { setError('Valid email address is required'); return }
    const storedUser = localStorage.getItem('user_credentials')
    if (storedUser) {
      const user = JSON.parse(storedUser)
      if (user.email === loginEmail) { onLogin(user) }
      else { setError('No account found with this email. Please sign up first.') }
    } else { setError('No account found. Please sign up first.') }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="bg-card border border-border rounded-lg p-8 w-full max-w-md">
        <div className="text-center mb-6">
          <div className="text-5xl mb-4">👕👖👟</div>
          <h1 className="text-3xl font-bold text-foreground mb-2">JOPESH — Wear Yourself</h1>
          <p className="text-muted-foreground">{isSignup ? 'Create an account to start bidding' : 'Login to your account'}</p>
        </div>
        <div className="flex gap-2 mb-6 bg-secondary rounded-lg p-1">
          <button onClick={() => { setIsSignup(true); setError('') }} className={`flex-1 py-2 rounded-md font-semibold ${isSignup ? 'bg-primary text-primary-foreground' : 'text-muted-foreground'}`}>Sign Up</button>
          <button onClick={() => { setIsSignup(false); setError('') }} className={`flex-1 py-2 rounded-md font-semibold ${!isSignup ? 'bg-primary text-primary-foreground' : 'text-muted-foreground'}`}>Login</button>
        </div>
        {isSignup ? (
          <form onSubmit={handleSignup} className="space-y-4">
            <input type="text" value={formData.nickname} onChange={(e) => setFormData({ ...formData, nickname: e.target.value })} placeholder="Nickname" className="w-full px-4 py-2 bg-input border border-border rounded-lg" required />
            <input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} placeholder="Email" className="w-full px-4 py-2 bg-input border border-border rounded-lg" required />
            <input type="text" value={formData.location} onChange={(e) => setFormData({ ...formData, location: e.target.value })} placeholder="Location" className="w-full px-4 py-2 bg-input border border-border rounded-lg" required />
            <input type="text" value={formData.facebookName} onChange={(e) => setFormData({ ...formData, facebookName: e.target.value })} placeholder="Facebook Name" className="w-full px-4 py-2 bg-input border border-border rounded-lg" required />
            <input type="tel" value={formData.phoneNumber} onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })} placeholder="Phone Number" className="w-full px-4 py-2 bg-input border border-border rounded-lg" required />
            {error && <div className="text-red-500 text-sm">{error}</div>}
            <button type="submit" className="w-full bg-primary text-primary-foreground font-semibold py-3 rounded-lg">Sign Up & Continue</button>
          </form>
        ) : (
          <form onSubmit={handleLogin} className="space-y-4">
            <input type="email" value={loginEmail} onChange={(e) => setLoginEmail(e.target.value)} placeholder="Email address" className="w-full px-4 py-2 bg-input border border-border rounded-lg" required />
            {error && <div className="text-red-500 text-sm">{error}</div>}
            <button type="submit" className="w-full bg-primary text-primary-foreground font-semibold py-3 rounded-lg">Login & Continue</button>
          </form>
        )}
      </div>
    </div>
  )
}

// Carousel Component with Cool Dot Pagination
function Carousel({ 
  items, 
  title, 
  viewAllLink 
}: { 
  items: Item[], 
  title: string, 
  viewAllLink?: string 
}) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const itemsPerPage = 3
  const totalPages = Math.ceil(items.length / itemsPerPage)

  const goToPage = (page: number) => setCurrentIndex(page)
  const nextSlide = () => currentIndex < totalPages - 1 && setCurrentIndex(currentIndex + 1)
  const prevSlide = () => currentIndex > 0 && setCurrentIndex(currentIndex - 1)

  const currentItems = items.slice(currentIndex * itemsPerPage, (currentIndex + 1) * itemsPerPage)

  if (items.length === 0) {
    return (
      <div className="mb-16">
        <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-6">{title}</h2>
        <div className="text-center py-12 bg-card rounded-lg border border-border">
          <p className="text-muted-foreground">No items available at the moment.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="mb-16">
      <div className="flex justify-between items-center mb-6 flex-wrap gap-2">
        <h2 className="text-2xl sm:text-3xl font-bold text-foreground">
          {title} <span className="text-muted-foreground text-xl">({items.length})</span>
        </h2>
        {viewAllLink && (
          <Link href={viewAllLink} className="text-sm font-semibold px-4 py-2 border border-border rounded-lg text-foreground hover:bg-secondary transition-colors">
            View All →
          </Link>
        )}
      </div>

      <div className="relative">
        {totalPages > 1 && (
          <button
            onClick={prevSlide}
            disabled={currentIndex === 0}
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-3 sm:-translate-x-5 z-10 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-primary/80 text-primary-foreground flex items-center justify-center shadow-lg disabled:opacity-30 hover:bg-primary transition-all"
          >
            ←
          </button>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {currentItems.map((item, idx) => {
            const isSold = item.status === 'ended'
            return (
              <Link href={`/item/${item.id}`} key={item.id}>
                <div className="bg-card border border-border rounded-lg overflow-hidden hover:shadow-lg transition-shadow cursor-pointer h-full flex flex-col relative group">
                  {isSold && (
                    <div className="absolute inset-0 z-10 flex items-center justify-center pointer-events-none">
                      <div className="bg-black/70 rounded-full px-5 py-2 border-2 border-red-500">
                        <span className="text-white font-bold text-lg tracking-widest">SOLD</span>
                      </div>
                    </div>
                  )}
                  <div className="relative h-48 bg-secondary overflow-hidden">
{item.images?.[0] ? (
  <Image
    src={item.images[0]}
    alt={item.title}
    fill
    className={`object-cover transition-transform duration-300 group-hover:scale-105 ${isSold ? 'opacity-50' : ''}`}
    loading={idx === 0 ? "eager" : undefined}
    unoptimized={true}
  />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-muted-foreground">No image</div>
                    )}
                    <div className="absolute top-2 right-2 px-3 py-1 rounded text-xs font-semibold bg-primary text-primary-foreground">
                      {item.type === 'fixed' ? 'BUY NOW' : 'AUCTION'}
                    </div>
                  </div>
                  <div className="p-4 flex-1 flex flex-col">
                    <h3 className="text-base font-semibold text-foreground mb-1 line-clamp-1">{item.title}</h3>
                    <p className="text-xs text-muted-foreground mb-3 line-clamp-2 flex-1">
                      {item.description?.substring(0, 100) || 'No description'}...
                    </p>
                    <div className="flex justify-between items-center mt-auto">
                      <div>
                        <div className="text-xs text-muted-foreground">{isSold ? 'Final price' : item.type === 'fixed' ? 'Price' : 'Current bid'}</div>
                        <div className="text-xl font-bold text-foreground">
                          ₱{(item.current_bid || item.starting_price || item.price || 0).toLocaleString()}
                        </div>
                      </div>
                      <span className={`text-xs px-2 py-1 rounded font-semibold ${isSold ? 'bg-red-500/10 text-red-400' : 'bg-primary/10 text-primary'}`}>
                        {isSold ? 'Sold' : item.type === 'fixed' ? 'Buy Now' : `${item.bid_count || 0} bids`}
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            )
          })}
        </div>

        {totalPages > 1 && (
          <button
            onClick={nextSlide}
            disabled={currentIndex === totalPages - 1}
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-3 sm:translate-x-5 z-10 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-primary/80 text-primary-foreground flex items-center justify-center shadow-lg disabled:opacity-30 hover:bg-primary transition-all"
          >
            →
          </button>
        )}

        {totalPages > 1 && (
          <div className="flex justify-center gap-2 mt-8">
            {Array.from({ length: totalPages }).map((_, idx) => (
              <button
                key={idx}
                onClick={() => goToPage(idx)}
                className={`transition-all duration-300 rounded-full ${
                  currentIndex === idx 
                    ? 'w-8 h-2 bg-primary' 
                    : 'w-2 h-2 bg-muted-foreground/50 hover:bg-muted-foreground'
                }`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default function HomePage() {
  const [fixedItems, setFixedItems] = useState<Item[]>([])
  const [auctionItems, setAuctionItems] = useState<Item[]>([])
  const [loading, setLoading] = useState(true)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [userCredentials, setUserCredentials] = useState<UserCredentials | null>(null)

  useEffect(() => {
    const storedUser = localStorage.getItem('user_credentials')
    if (storedUser) {
      setUserCredentials(JSON.parse(storedUser))
      setIsLoggedIn(true)
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    if (isLoggedIn) {
      const fetchItems = async () => {
        const { data: fixedData } = await supabase
          .from('items')
          .select('*')
          .eq('type', 'fixed')
          .order('created_at', { ascending: false })

        const { data: auctionData } = await supabase
          .from('items')
          .select('*')
          .eq('type', 'auction')
          .order('created_at', { ascending: false })

        if (fixedData) setFixedItems(fixedData)
        if (auctionData) setAuctionItems(auctionData)
        setLoading(false)
      }
      fetchItems()
    }
  }, [isLoggedIn])

  const handleLogin = (credentials: UserCredentials) => {
    setUserCredentials(credentials)
    setIsLoggedIn(true)
  }

  const handleLogout = () => {
    localStorage.removeItem('user_credentials')
    setIsLoggedIn(false)
    setUserCredentials(null)
  }

  if (!isLoggedIn) {
    return <AuthModal onLogin={handleLogin} />
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center text-foreground">Loading items...</div>
      </div>
    )
  }

  return (
    <main className="min-h-screen bg-background">
      <div className="container mx-auto px-4 sm:px-8 py-8">
        <div className="bg-card border border-border rounded-lg p-3 sm:p-4 mb-8 flex flex-col sm:flex-row justify-between items-center gap-3">
          <div className="flex flex-wrap items-center gap-2 sm:gap-4">
            <span className="text-sm text-muted-foreground">Bidding as:</span>
            <span className="font-semibold text-foreground">{userCredentials?.nickname}</span>
            <div className="text-xs text-muted-foreground">📧 {userCredentials?.email}</div>
            <div className="text-xs text-muted-foreground hidden sm:block">📍 {userCredentials?.location}</div>
          </div>
          <button onClick={handleLogout} className="text-sm text-red-500 hover:text-red-400 font-semibold">Logout</button>
        </div>

        <header className="mb-10 text-center px-2">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-3">JOPESH — Wear Yourself</h1>
          <p className="text-base sm:text-xl text-muted-foreground">Curated thrift items available for auction or direct purchase</p>
          <p className="text-xs sm:text-sm text-muted-foreground mt-2">🤝 Welcome back, <span className="font-semibold text-primary">{userCredentials?.nickname}</span>! Your bids will appear with this nickname.</p>
        </header>

        <Carousel items={fixedItems} title="Available for Purchase" viewAllLink="/items" />
        <Carousel items={auctionItems} title="Active Auctions" viewAllLink="/auctions" />
      </div>
    </main>
  )
}