// lib/supabase.ts
// MOCK Supabase client for development - no credentials needed!

class MockSupabaseClient {
  private data = {
    items: [
      // ===== FIXED PRICE ITEMS (Available for Purchase) =====
      {
        id: 'fixed1',
        title: 'Vintage Levi\'s 501 Jeans',
        description: 'Authentic 90s Levi\'s 501 raw denim jeans. Perfectly faded, rare find from Japan ukay.',
        type: 'fixed',
        price: 850,
        image_url: 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=500&h=400&fit=crop',
        created_at: new Date().toISOString(),
      },
      {
        id: 'fixed2',
        title: 'Nike Air Jordan 1 Mid',
        description: 'Pre-loved good condition, size 42. From Korea ukay. Slight crease but no major flaws.',
        type: 'fixed',
        price: 3200,
        image_url: 'https://images.unsplash.com/photo-1600185365483-26d7a4cc7519?w=500&h=400&fit=crop',
        created_at: new Date().toISOString(),
      },
      {
        id: 'fixed3',
        title: 'Zara Oversized Blazer',
        description: 'Like new wool-blend blazer, size M. Perfect for office or casual wear.',
        type: 'fixed',
        price: 550,
        image_url: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=500&h=400&fit=crop',
        created_at: new Date().toISOString(),
      },
      {
        id: 'fixed4',
        title: 'Carhartt WIP Hoodie',
        description: 'Original Carhartt hoodie, thick cotton, faded black. Good condition, no holes.',
        type: 'fixed',
        price: 1200,
        image_url: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=500&h=400&fit=crop',
        created_at: new Date().toISOString(),
      },
      {
        id: 'fixed5',
        title: 'Uniqlo U Crewneck',
        description: 'Minimalist crewneck from Uniqlo U collection. Size L, cream white, worn twice.',
        type: 'fixed',
        price: 350,
        image_url: 'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=500&h=400&fit=crop',
        created_at: new Date().toISOString(),
      },
      {
        id: 'fixed6',
        title: 'Polo Ralph Lauren Long Sleeve',
        description: 'Vintage Polo RL, classic fit, navy blue. Made in USA tag, excellent condition.',
        type: 'fixed',
        price: 450,
        image_url: 'https://images.unsplash.com/photo-1646159376463-9446e779a97f?w=500&h=400&fit=crop',
        created_at: new Date().toISOString(),
      },
      {
        id: 'fixed7',
        title: 'Adidas Samba OG',
        description: 'Japan ukay find! Original Sambas, size 43. Needs cleaning but very wearable.',
        type: 'fixed',
        price: 1800,
        image_url: 'https://images.unsplash.com/photo-1607522370275-f14206abe5d3?w=500&h=400&fit=crop',
        created_at: new Date().toISOString(),
      },
      {
        id: 'fixed8',
        title: 'H&M Studio Oversized Shirt',
        description: 'Limited H&M Studio piece, oversized fit, size M. Never worn with tags.',
        type: 'fixed',
        price: 650,
        image_url: 'https://images.unsplash.com/photo-1583744946564-b52ac1c389c8?w=500&h=400&fit=crop',
        created_at: new Date().toISOString(),
      },

      // ===== AUCTION ITEMS =====
      {
        id: 'auction1',
        title: 'Vintage Tommy Hilfiger Jacket',
        description: '90s Tommy Hilfiger denim jacket, great condition, rare colorway. Ukay gold from Seoul.',
        type: 'auction',
        starting_price: 800,
        current_bid: 1250,
        bid_count: 7,
        image_url: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=500&h=400&fit=crop',
        auction_end_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'active',
        created_at: new Date().toISOString(),
      },
      {
        id: 'auction2',
        title: 'Authentic Gucci GG Belt',
        description: 'Real Gucci belt, size 85, comes with box and dust bag. Slightly used from Japan surplus.',
        type: 'auction',
        starting_price: 5000,
        current_bid: 6800,
        bid_count: 12,
        image_url: 'https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?w=500&h=400&fit=crop',
        auction_end_date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'active',
        created_at: new Date().toISOString(),
      },
      {
        id: 'auction3',
        title: 'Yeezy 350 V2 Zebra',
        description: 'Legit Yeezy 350 V2 Zebra, size 44, with box. Minor wear, from US ukay.',
        type: 'auction',
        starting_price: 4000,
        current_bid: 5500,
        bid_count: 15,
        image_url: 'https://images.unsplash.com/photo-1600185365926-3a2ce3cdb9eb?w=500&h=400&fit=crop',
        auction_end_date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'active',
        created_at: new Date().toISOString(),
      },
      {
        id: 'auction4',
        title: 'Supreme Box Logo Hoodie',
        description: '2018 FW Supreme hoodie, black/red, size L. Authentic, light use.',
        type: 'auction',
        starting_price: 8000,
        current_bid: 10200,
        bid_count: 23,
        image_url: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=500&h=400&fit=crop',
        auction_end_date: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'active',
        created_at: new Date().toISOString(),
      },
      {
        id: 'auction5',
        title: 'Nike SB Dunk Low Chunky Dunky',
        description: 'Rare Nike SB Dunk Low, size 42.5, from Thailand ukay. Needs cleaning but legit.',
        type: 'auction',
        starting_price: 15000,
        current_bid: 18500,
        bid_count: 9,
        image_url: 'https://images.unsplash.com/photo-1600185365483-26d7a4cc7519?w=500&h=400&fit=crop',
        auction_end_date: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'active',
        created_at: new Date().toISOString(),
      },
      {
        id: 'auction6',
        title: 'Stussy 8-Ball Fleece Jacket',
        description: 'Vintage Stussy fleece jacket, 8-ball design on back. Rare piece from LA ukay.',
        type: 'auction',
        starting_price: 1200,
        current_bid: 2100,
        bid_count: 18,
        image_url: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=500&h=400&fit=crop',
        auction_end_date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'active',
        created_at: new Date().toISOString(),
      },
      {
        id: 'auction7',
        title: 'Balenciaga Speed Trainer',
        description: 'Authentic Balenciaga Speed Trainer, size 41, from Korea surplus. Good condition.',
        type: 'auction',
        starting_price: 12000,
        current_bid: 15500,
        bid_count: 6,
        image_url: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500&h=400&fit=crop',
        auction_end_date: new Date(Date.now() + 8 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'active',
        created_at: new Date().toISOString(),
      },
      {
        id: 'auction8',
        title: 'Vintage Nike Windbreaker',
        description: '90s Nike windbreaker, purple/teal colorway. Great condition, from Japan ukay.',
        type: 'auction',
        starting_price: 600,
        current_bid: 950,
        bid_count: 14,
        image_url: 'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=500&h=400&fit=crop',
        auction_end_date: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'active',
        created_at: new Date().toISOString(),
      },
      {
        id: 'auction9',
        title: 'Louis Vuitton Keepall 55',
        description: 'Authentic LV Keepall 55, monogram canvas, from Japan. Slight patina, great condition.',
        type: 'auction',
        starting_price: 35000,
        current_bid: 42000,
        bid_count: 5,
        image_url: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=500&h=400&fit=crop',
        auction_end_date: new Date(Date.now() + 12 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'active',
        created_at: new Date().toISOString(),
      },
      {
        id: 'auction10',
        title: 'Chanel Classic Flap Bag',
        description: 'Vintage Chanel flap bag, caviar leather, gold hardware. With authenticity card.',
        type: 'auction',
        starting_price: 85000,
        current_bid: 95000,
        bid_count: 8,
        image_url: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=500&h=400&fit=crop',
        auction_end_date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'active',
        created_at: new Date().toISOString(),
      },
    ],
    bids: [
      {
        id: 'b1',
        item_id: 'auction1',
        bidder_name: 'Marco Santos',
        bidder_email: 'marco@example.com',
        bidder_phone: '+639171234567',
        bidder_address: '123 Makati Ave, Manila',
        amount: 1250,
        created_at: new Date().toISOString(),
      },
      {
        id: 'b2',
        item_id: 'auction1',
        bidder_name: 'Lisa Gomez',
        bidder_email: 'lisa@example.com',
        bidder_phone: '+639172345678',
        bidder_address: '45 BGC, Taguig',
        amount: 1100,
        created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: 'b3',
        item_id: 'auction2',
        bidder_name: 'Sofia Cruz',
        bidder_email: 'sofia@example.com',
        bidder_phone: '+639174567890',
        bidder_address: '12 Alabang, Muntinlupa',
        amount: 6800,
        created_at: new Date().toISOString(),
      },
      {
        id: 'b4',
        item_id: 'auction3',
        bidder_name: 'Kyle Mendoza',
        bidder_email: 'kyle@example.com',
        bidder_phone: '+639176789012',
        bidder_address: '90 Mandaluyong',
        amount: 5500,
        created_at: new Date().toISOString(),
      },
      {
        id: 'b5',
        item_id: 'auction4',
        bidder_name: 'Rafael Domingo',
        bidder_email: 'rafael@example.com',
        bidder_phone: '+639179012345',
        bidder_address: '23 Cainta, Rizal',
        amount: 10200,
        created_at: new Date().toISOString(),
      },
    ],
  }

  from(table: string) {
    return new MockQueryBuilder(table, this.data)
  }

  channel(name: string) {
    return new MockChannel(name)
  }
}

class MockQueryBuilder {
  private table: string
  private data: any
  private filters: any = {}
  private singleMode = false
  private orderBy: { column: string; ascending: boolean } | null = null

  constructor(table: string, data: any) {
    this.table = table
    this.data = data
  }

  select(columns: string) {
    return this
  }

  eq(column: string, value: any) {
    this.filters[column] = value
    return this
  }

  single() {
    this.singleMode = true
    return this
  }

  order(column: string, options: { ascending: boolean }) {
    this.orderBy = { column, ascending: options.ascending }
    return this
  }

  update(data: any) {
    return new MockUpdateBuilder(this.table, this.data, this.filters, data)
  }

  insert(data: any) {
    return new MockInsertBuilder(this.table, this.data, data)
  }

  async then(success: any, error?: any) {
    let result = this.data[this.table] || []
    
    Object.entries(this.filters).forEach(([key, value]) => {
      result = result.filter((item: any) => item[key] === value)
    })
    
    if (this.orderBy) {
      result = [...result].sort((a, b) => {
        const aVal = a[this.orderBy!.column]
        const bVal = b[this.orderBy!.column]
        return this.orderBy!.ascending ? aVal - bVal : bVal - aVal
      })
    }
    
    if (this.singleMode) {
      result = result[0] || null
      return success({ data: result, error: null })
    }
    
    return success({ data: result, error: null })
  }

  catch(callback: any) {
    return this
  }
}

class MockUpdateBuilder {
  private table: string
  private data: any
  private filters: any
  private updateData: any

  constructor(table: string, data: any, filters: any, updateData: any) {
    this.table = table
    this.data = data
    this.filters = filters
    this.updateData = updateData
  }

  async then(success: any, error?: any) {
    let items = this.data[this.table] || []
    
    items = items.map((item: any) => {
      let matches = true
      Object.entries(this.filters).forEach(([key, value]) => {
        if (item[key] !== value) matches = false
      })
      if (matches) {
        return { ...item, ...this.updateData }
      }
      return item
    })
    
    this.data[this.table] = items
    return success({ data: null, error: null })
  }

  catch(callback: any) {
    return this
  }
}

class MockInsertBuilder {
  private table: string
  private data: any
  private insertData: any

  constructor(table: string, data: any, insertData: any) {
    this.table = table
    this.data = data
    this.insertData = insertData
  }

  async then(success: any, error?: any) {
    const newItem = {
      id: Date.now().toString(),
      ...this.insertData,
      created_at: new Date().toISOString(),
    }
    
    if (!this.data[this.table]) {
      this.data[this.table] = []
    }
    
    this.data[this.table].push(newItem)
    return success({ data: newItem, error: null })
  }

  catch(callback: any) {
    return this
  }
}

class MockChannel {
  private events: any[] = []
  private subscribed = false

  constructor(name: string) {}

  on(event: string, options: any, callback: any) {
    this.events.push({ event, options, callback })
    return this
  }

  subscribe() {
    this.subscribed = true
    return this
  }

  unsubscribe() {
    this.subscribed = false
    return this
  }
}

export const supabase = new MockSupabaseClient()

console.log('✅ MOCK Supabase loaded with:', {
  fixed: (supabase as any).data.items.filter((i: any) => i.type === 'fixed').length,
  auction: (supabase as any).data.items.filter((i: any) => i.type === 'auction').length,
  total: (supabase as any).data.items.length
})