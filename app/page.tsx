"use client"

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'

interface Item {
  id: string
  title: string
  subtitle?: string       // ← ADD THIS LINE
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

const handleSignup = async (e: React.FormEvent) => {
  e.preventDefault()

if (!formData.nickname.trim() || formData.nickname.trim().length < 3) {
  setError('Nickname must be at least 3 characters')
  return
}

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
if (!emailRegex.test(formData.email.trim())) {
  setError('Please enter a valid email address')
  return
}

if (!formData.location.trim() || formData.location.trim().length < 3) {
  setError('Please enter a valid location')
  return
}

if (!formData.facebookName.trim() || formData.facebookName.trim().length < 3) {
  setError('Please enter your Facebook name')
  return
}

const phoneRegex = /^(09|\+639)\d{9}$/
if (!phoneRegex.test(formData.phoneNumber.trim())) {
  setError('Enter a valid PH number: 09XXXXXXXXX or +639XXXXXXXXX')
  return
}

  // Check if email already exists in Supabase
  const { data: existing } = await supabase
    .from('users')
    .select('email')
    .eq('email', formData.email)
    .single()

  if (existing) {
    setError('This email is already registered. Please login instead.')
    setIsSignup(false)       // auto-switch to Login tab
    setLoginEmail(formData.email) // pre-fill their email
    return
  }

  // Save to Supabase
  const { error } = await supabase.from('users').insert({
    nickname: formData.nickname,
    email: formData.email,
    location: formData.location,
    facebook_name: formData.facebookName,
    phone_number: formData.phoneNumber,
  })

  if (error) {
    console.error('Signup error:', error)
  }

  localStorage.setItem('user_credentials', JSON.stringify(formData))
  onLogin(formData)
}

const handleLogin = async (e: React.FormEvent) => {
  e.preventDefault()

  if (!loginEmail.trim() || !loginEmail.includes('@')) {
    setError('Valid email address is required')
    return
  }

  // Check localStorage first
  const storedUser = localStorage.getItem('user_credentials')
  if (storedUser) {
    const user = JSON.parse(storedUser)
    if (user.email === loginEmail) {
      onLogin(user)
      return
    }
  }

  // Fallback — check Supabase
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('email', loginEmail)
    .single()

  if (error || !data) {
    setError('No account found with this email. Please sign up first.')
    return
  }

  // Rebuild credentials from Supabase and save locally
  const credentials = {
    nickname: data.nickname,
    email: data.email,
    location: data.location,
    facebookName: data.facebook_name,
    phoneNumber: data.phone_number,
  }

  localStorage.setItem('user_credentials', JSON.stringify(credentials))
  onLogin(credentials)
}

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="bg-card border border-border rounded-lg p-8 w-full max-w-md">
        <div className="text-center mb-6">
<div className="mb-4">
  <img 
    src="/jopesh-logo.png" 
    alt="JOPESH" 
    className="w-auto h-20 sm:h-24 md:h-28 mx-auto"
  />
</div>
          <p className="text-base sm:text-lg text-muted-foreground">WEARABLE ART — CURATED & REWORKED</p>
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
  viewAllLink,
  isLoading
}: { 
  items: Item[], 
  title: string, 
  viewAllLink?: string,
  isLoading?: boolean
}) {
    const [currentIndex, setCurrentIndex] = useState(0)
    const [itemsPerPage, setItemsPerPage] = useState(3)

    useEffect(() => {
      const update = () => setItemsPerPage(window.innerWidth < 640 ? 2 : 3)
      update()
      window.addEventListener('resize', update)
      return () => window.removeEventListener('resize', update)
    }, [])

const totalPages = Math.ceil(items.length / itemsPerPage)
  const goToPage = (page: number) => setCurrentIndex(page)
  const nextSlide = () => currentIndex < totalPages - 1 && setCurrentIndex(currentIndex + 1)
  const prevSlide = () => currentIndex > 0 && setCurrentIndex(currentIndex - 1)

  const currentItems = items.slice(currentIndex * itemsPerPage, (currentIndex + 1) * itemsPerPage)

if (isLoading || items.length === 0) {
  return (
    <div className="mb-16">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl sm:text-3xl font-bold text-foreground">{title}</h2>
        {viewAllLink && (
          <Link href={viewAllLink} className="text-sm font-semibold px-4 py-2 border border-border rounded-lg text-foreground hover:bg-secondary transition-colors">
            View All →
          </Link>
        )}
      </div>
      {isLoading ? (
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-card border border-border rounded-lg overflow-hidden">
              <div className="w-full bg-secondary animate-pulse" style={{ aspectRatio: '1/1' }} />
              <div className="p-3 space-y-2">
                <div className="h-3 bg-secondary animate-pulse rounded w-3/4" />
                <div className="h-3 bg-secondary animate-pulse rounded w-1/2" />
                <div className="h-4 bg-secondary animate-pulse rounded w-1/3 mt-2" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-card rounded-lg border border-border">
          <p className="text-muted-foreground">No items available at the moment.</p>
        </div>
      )}
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

<div
        className="relative"
        onTouchStart={(e) => { (e.currentTarget as any)._touchStartX = e.touches[0].clientX }}
        onTouchEnd={(e) => {
          const diff = (e.currentTarget as any)._touchStartX - e.changedTouches[0].clientX
          if (Math.abs(diff) > 50) { if (diff > 0) nextSlide(); else prevSlide() }
        }}
      >
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6">
          {currentItems.map((item, idx) => {
            const isSold = item.status === 'ended'
            return (
              <Link href={`/item/${item.id}`} key={item.id}>

                <div className="bg-card border border-border rounded-lg overflow-hidden hover:shadow-lg transition-shadow cursor-pointer h-full flex flex-col relative group">
{isSold && item.type === 'auction' && (
  <div className="absolute inset-0 z-10 flex items-center justify-center pointer-events-none bg-black/50">
    <span className="text-white font-bold text-xl tracking-widest text-center">AUCTION<br />ENDED</span>
  </div>
)}
{isSold && item.type === 'fixed' && (
  <div className="absolute inset-0 z-10 flex items-center justify-center pointer-events-none bg-black/50">
    <span className="text-white font-bold text-2xl tracking-widest text-center">SOLD</span>
  </div>
)}
<div className="w-full bg-secondary overflow-hidden relative" style={{ aspectRatio: '1/1' }}>
  {item.images?.[0] ? (
    <img
      src={item.images[0]}
      alt={item.title}
      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
      loading={idx === 0 ? "eager" : undefined}
    />
  ) : (
    <div className="h-64 flex items-center justify-center text-muted-foreground">No image</div>
  )}
</div>
<div className="p-2 sm:p-4 flex-1 flex flex-col">

  <h3 className="text-xs sm:text-base font-semibold text-foreground mb-0.5 line-clamp-1">{item.title}</h3>
    {item.subtitle && (
      <p className="text-xs text-muted-foreground mb-1 tracking-wide line-clamp-1">
        {item.subtitle}
      </p>
    )}

<div className="flex justify-between items-center mt-auto">
  <div>
    {item.type === 'fixed' ? (
      item.price && item.price > 0 ? (
        <div className="text-sm sm:text-xl font-bold text-foreground">
          ₱{item.price.toLocaleString()}
        </div>
      ) : (
        <div className="text-xs text-muted-foreground italic"></div>
      )
    ) : (
      item.starting_price && item.starting_price > 0 ? (
        <>
          <div className="text-sm sm:text-xl font-bold text-foreground">
            ₱{item.starting_price.toLocaleString()}
          </div>
          {(item.bid_count ?? 0) > 0 && (
            <div className="text-xs text-muted-foreground mt-0.5">
              {item.bid_count} bid{item.bid_count !== 1 ? 's' : ''}
            </div>
          )}
        </>
      ) : (
        <div className="text-xs text-muted-foreground italic">—</div>
      )
    )}
  </div>
</div>
                  </div>
                </div>
              </Link>
            )
          })}
        </div>

{totalPages > 1 && (
  <div className="flex justify-center items-center gap-4 mt-6">
    <button
      onClick={prevSlide}
      disabled={currentIndex === 0}
      className="w-8 h-8 rounded-full border border-border text-foreground flex items-center justify-center disabled:opacity-20 hover:bg-secondary transition-all text-sm"
    >
      ←
    </button>
    <div className="flex items-center gap-2">
      {Array.from({ length: totalPages }).map((_, idx) => (
        <button
          key={idx}
          onClick={() => goToPage(idx)}
          className={`transition-all duration-300 rounded-full ${
            currentIndex === idx
              ? 'w-6 h-2 bg-primary'
              : 'w-2 h-2 bg-muted-foreground/30 hover:bg-muted-foreground'
          }`}
        />
      ))}
    </div>
    <button
      onClick={nextSlide}
      disabled={currentIndex === totalPages - 1}
      className="w-8 h-8 rounded-full border border-border text-foreground flex items-center justify-center disabled:opacity-20 hover:bg-secondary transition-all text-sm"
    >
      →
    </button>
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
  const raw = localStorage.getItem('user_credentials')
  if (raw) {
    setUserCredentials(JSON.parse(raw))
    setIsLoggedIn(true)
  }
  setLoading(false)
}, [])

useEffect(() => {
  if (isLoggedIn) {
    // Load from cache instantly
    const cachedFixed = sessionStorage.getItem('cache_fixed')
    const cachedAuction = sessionStorage.getItem('cache_auction')
    if (cachedFixed) setFixedItems(JSON.parse(cachedFixed))
    if (cachedAuction) setAuctionItems(JSON.parse(cachedAuction))
    if (cachedFixed && cachedAuction) setLoading(false)

    // Always refresh in background
    const fetchItems = async () => {
      const { data: fixedData } = await supabase
        .from('items')
        .select('*')
        .eq('type', 'fixed')
        .order('sort_order', { ascending: true })

      const { data: auctionData } = await supabase
        .from('items')
        .select('*')
        .eq('type', 'auction')
        .order('sort_order', { ascending: true })

      if (fixedData) {
        const sorted = [
          ...fixedData.filter(i => i.status !== 'ended'),
          ...fixedData.filter(i => i.status === 'ended')
        ]
        setFixedItems(sorted)
        sessionStorage.setItem('cache_fixed', JSON.stringify(sorted))
      }
      if (auctionData) {
        const sorted = [
          ...auctionData.filter(i => i.status !== 'ended'),
          ...auctionData.filter(i => i.status === 'ended')
        ]
        setAuctionItems(sorted)
        sessionStorage.setItem('cache_auction', JSON.stringify(sorted))
      }
      setLoading(false)
    }
    fetchItems()
  }
}, [isLoggedIn])

// Preload all images so carousel pages show instantly
  useEffect(() => {
    const allItems = [...fixedItems, ...auctionItems]
    allItems.forEach(item => {
      const src = item.images?.[0] ?? item.image_url
      if (src) {
        const img = new window.Image()
        img.src = src
      }
    })
  }, [fixedItems, auctionItems])

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

if (loading && fixedItems.length === 0 && auctionItems.length === 0) {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-6">
      <h1 className="text-4xl font-bold text-foreground tracking-widest">JOPESH</h1>
      <p className="text-sm text-muted-foreground tracking-widest uppercase">Wearable Art — Curated & Reworked</p>
      <div className="flex gap-2 mt-4">
        <span className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '0ms' }} />
        <span className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '150ms' }} />
        <span className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '300ms' }} />
      </div>
    </div>
  )
}

return (
  <main className="min-h-screen bg-background">
    <div className="container mx-auto px-4 sm:px-8 py-8">

      <header className="mb-10 text-center px-2">
<div className="mb-4">
  <img 
    src="/jopesh-logo.png" 
    alt="JOPESH" 
    className="w-auto h-20 sm:h-24 md:h-28 mx-auto"
  />
</div>
        <p className="text-base sm:text-lg text-muted-foreground">WEARABLE ART — CURATED & REWORKED</p>
      </header>

      <Carousel items={fixedItems} title="Collection" viewAllLink="/items" isLoading={fixedItems.length === 0} />
<Carousel items={auctionItems} title="Auctions" viewAllLink="/auctions" isLoading={auctionItems.length === 0} />
      <div className="mt-8 bg-card border border-border rounded-lg p-3 sm:p-4 flex flex-col sm:flex-row justify-between items-center gap-3">
        <div className="flex flex-wrap items-center gap-2 sm:gap-4">
          <span className="text-sm text-muted-foreground">Logged in as:</span>
          <span className="font-semibold text-foreground">{userCredentials?.nickname}</span>
          <div className="text-xs text-muted-foreground">📧 {userCredentials?.email}</div>
          <div className="text-xs text-muted-foreground hidden sm:block">📍 {userCredentials?.location}</div>
        </div>
        <button onClick={handleLogout} className="text-sm text-red-500 hover:text-red-400 font-semibold">Logout</button>
      </div>

    </div>
  </main>
)
}