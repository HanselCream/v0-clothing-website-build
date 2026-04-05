// app/page.tsx
'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import Image from 'next/image'

interface Item {
  id: string
  title: string
  description: string
  image_url: string
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

// Signup / Login Modal Component
function AuthModal({ onLogin }: { onLogin: (credentials: UserCredentials) => void }) {
  const [isSignup, setIsSignup] = useState(true) // true = signup, false = login
  const [formData, setFormData] = useState({
    nickname: '',
    email: '',
    location: '',
    facebookName: '',
    phoneNumber: ''
  })
  const [loginEmail, setLoginEmail] = useState('')
  const [error, setError] = useState('')

  // Handle Signup
  const handleSignup = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.nickname.trim()) {
      setError('Nickname is required')
      return
    }
    if (!formData.email.trim() || !formData.email.includes('@')) {
      setError('Valid email address is required')
      return
    }
    if (!formData.location.trim()) {
      setError('Location is required')
      return
    }
    if (!formData.facebookName.trim()) {
      setError('Facebook name is required')
      return
    }
    if (!formData.phoneNumber.trim()) {
      setError('Phone number is required')
      return
    }
    
    // Save to localStorage
    localStorage.setItem('user_credentials', JSON.stringify(formData))
    onLogin(formData)
  }

  // Handle Login
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!loginEmail.trim() || !loginEmail.includes('@')) {
      setError('Valid email address is required')
      return
    }
    
    // Check if user exists in localStorage
    const storedUser = localStorage.getItem('user_credentials')
    if (storedUser) {
      const user = JSON.parse(storedUser)
      if (user.email === loginEmail) {
        onLogin(user)
      } else {
        setError('No account found with this email. Please sign up first.')
      }
    } else {
      setError('No account found. Please sign up first.')
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="bg-card border border-border rounded-lg p-8 w-full max-w-md">
        <div className="text-center mb-6">
          <div className="text-5xl mb-4">👕👖👟</div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Premium Ukay & Fashion Finds</h1>
          <p className="text-muted-foreground">
            {isSignup ? 'Create an account to start bidding' : 'Login to your account'}
          </p>
        </div>

        {/* Toggle between Signup and Login */}
        <div className="flex gap-2 mb-6 bg-secondary rounded-lg p-1">
          <button
            onClick={() => {
              setIsSignup(true)
              setError('')
            }}
            className={`flex-1 py-2 rounded-md font-semibold transition-colors ${
              isSignup ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Sign Up
          </button>
          <button
            onClick={() => {
              setIsSignup(false)
              setError('')
            }}
            className={`flex-1 py-2 rounded-md font-semibold transition-colors ${
              !isSignup ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Login
          </button>
        </div>

        {isSignup ? (
          // Signup Form
          <form onSubmit={handleSignup} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Nickname / Username <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.nickname}
                onChange={(e) => setFormData({ ...formData, nickname: e.target.value })}
                placeholder="e.g., SneakerHead23"
                className="w-full px-4 py-2 bg-input border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                required
              />
              <p className="text-xs text-muted-foreground mt-1">This will appear on your bids</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Email Address <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="your@email.com"
                className="w-full px-4 py-2 bg-input border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Location <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                placeholder="City, Province"
                className="w-full px-4 py-2 bg-input border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Facebook Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.facebookName}
                onChange={(e) => setFormData({ ...formData, facebookName: e.target.value })}
                placeholder="Your Facebook profile name"
                className="w-full px-4 py-2 bg-input border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Phone Number <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                value={formData.phoneNumber}
                onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                placeholder="+63 XXX XXX XXXX"
                className="w-full px-4 py-2 bg-input border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                required
              />
            </div>

            {error && (
              <div className="p-3 rounded-lg text-sm bg-red-500/10 text-red-500 border border-red-500/20">
                {error}
              </div>
            )}

            <button
              type="submit"
              className="w-full bg-primary text-primary-foreground font-semibold py-3 rounded-lg hover:bg-primary/90 transition-colors"
            >
              Sign Up & Continue
            </button>
          </form>
        ) : (
          // Login Form
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Email Address <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                placeholder="your@email.com"
                className="w-full px-4 py-2 bg-input border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                required
              />
              <p className="text-xs text-muted-foreground mt-1">Enter the email you used to sign up</p>
            </div>

            {error && (
              <div className="p-3 rounded-lg text-sm bg-red-500/10 text-red-500 border border-red-500/20">
                {error}
              </div>
            )}

            <button
              type="submit"
              className="w-full bg-primary text-primary-foreground font-semibold py-3 rounded-lg hover:bg-primary/90 transition-colors"
            >
              Login & Continue
            </button>

            <p className="text-xs text-muted-foreground text-center mt-4">
              Don't have an account? Click "Sign Up" above to register.
            </p>
          </form>
        )}

        <p className="text-xs text-muted-foreground text-center mt-4 pt-4 border-t border-border">
          Your information is saved locally and only used for bidding and winner notification.
        </p>
      </div>
    </div>
  )
}

// Carousel Component
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

  const nextSlide = () => {
    if (currentIndex < totalPages - 1) {
      setCurrentIndex(currentIndex + 1)
    }
  }

  const prevSlide = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1)
    }
  }

  const startIndex = currentIndex * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentItems = items.slice(startIndex, endIndex)

  if (items.length === 0) {
    return (
      <div className="mb-16">
        <h2 className="text-3xl font-bold text-foreground mb-6">{title}</h2>
        <div className="text-center py-12 bg-card rounded-lg border border-border">
          <p className="text-muted-foreground">No items available at the moment.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="mb-16">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold text-foreground">
          {title} ({items.length})
        </h2>
        {viewAllLink && (
          <Link href={viewAllLink} className="text-primary hover:text-primary/80 font-semibold">
            View all →
          </Link>
        )}
      </div>

      <div className="relative">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {currentItems.map((item) => (
            <Link href={`/item/${item.id}`} key={item.id}>
              <div className="bg-card border border-border rounded-lg overflow-hidden hover:shadow-lg transition-shadow cursor-pointer h-full flex flex-col">
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
                  {item.type === 'fixed' ? (
                    <div className="absolute top-2 right-2 bg-green-500 text-white px-3 py-1 rounded text-sm font-semibold">
                      BUY NOW
                    </div>
                  ) : (
                    <div className="absolute top-2 right-2 bg-primary text-primary-foreground px-3 py-1 rounded text-sm font-semibold">
                      AUCTION
                    </div>
                  )}
                </div>
                <div className="p-4 flex-1 flex flex-col">
                  <h3 className="text-lg font-semibold text-foreground mb-2 line-clamp-1">
                    {item.title}
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4 line-clamp-2 flex-1">
                    {item.description || 'No description'}
                  </p>
                  {item.type === 'fixed' ? (
                    <div className="flex justify-between items-center mt-auto">
                      <div className="text-2xl font-bold text-foreground">
                        ₱{item.price?.toLocaleString()}
                      </div>
                      <span className="text-xs bg-green-500/10 text-green-500 px-2 py-1 rounded font-semibold">
                        Buy Now
                      </span>
                    </div>
                  ) : (
                    <div className="flex justify-between items-center mt-auto">
                      <div>
                        <div className="text-xs text-muted-foreground">Current Bid</div>
                        <div className="text-2xl font-bold text-foreground">
                          ₱{(item.current_bid || item.starting_price || 0).toLocaleString()}
                        </div>
                      </div>
                      <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded font-semibold">
                        {item.bid_count || 0} bids
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>

        {totalPages > 1 && (
          <>
            <button
              onClick={prevSlide}
              disabled={currentIndex === 0}
              className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center disabled:opacity-50"
            >
              ←
            </button>
            <button
              onClick={nextSlide}
              disabled={currentIndex === totalPages - 1}
              className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center disabled:opacity-50"
            >
              →
            </button>
          </>
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

  // Check if user is already logged in
  useEffect(() => {
    const storedUser = localStorage.getItem('user_credentials')
    if (storedUser) {
      setUserCredentials(JSON.parse(storedUser))
      setIsLoggedIn(true)
    }
    setLoading(false)
  }, [])

  // Fetch items only when logged in
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
          .eq('status', 'active')
          .order('created_at', { ascending: false })

        if (fixedData) setFixedItems(fixedData)
        if (auctionData) setAuctionItems(auctionData)
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

  // Show Auth Modal first - NO ITEMS VISIBLE UNTIL LOGGED IN
  if (!isLoggedIn) {
    return <AuthModal onLogin={handleLogin} />
  }

  // Show loading while fetching items
  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center text-foreground">Loading items...</div>
      </div>
    )
  }

  // Show main content after login
  return (
    <main className="min-h-screen bg-background">
      <div className="container mx-auto px-8 py-8">
        {/* User Info Bar */}
        <div className="bg-card border border-border rounded-lg p-4 mb-8 flex justify-between items-center flex-wrap gap-4">
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Bidding as:</span>
              <span className="font-semibold text-foreground text-lg">{userCredentials?.nickname}</span>
            </div>
            <div className="h-4 w-px bg-border hidden sm:block"></div>
            <div className="text-xs text-muted-foreground">📧 {userCredentials?.email}</div>
            <div className="text-xs text-muted-foreground">📍 {userCredentials?.location}</div>
          </div>
          <button
            onClick={handleLogout}
            className="text-sm text-red-500 hover:text-red-400 font-semibold"
          >
            Logout
          </button>
        </div>

        {/* Hero Section */}
        <header className="mb-12 text-center">
          <h1 className="text-5xl font-bold text-foreground mb-4">
            Premium Ukay & Fashion Finds
          </h1>
          <p className="text-xl text-muted-foreground">
            Curated thrift items available for auction or direct purchase
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            🤝 Welcome back, <span className="font-semibold text-primary">{userCredentials?.nickname}</span>!
            Your bids will appear with this nickname.
          </p>
        </header>

        {/* Available for Purchase */}
        <Carousel items={fixedItems} title="Available for Purchase" />

        {/* Active Auctions */}
        <Carousel items={auctionItems} title="Active Auctions" viewAllLink="/auctions" />
      </div>
    </main>
  )
}