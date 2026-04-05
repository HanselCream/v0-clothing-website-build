// lib/supabase.mock.ts
// Mock Supabase client for development without credentials

class MockSupabaseClient {
  private data = {
    items: [
      {
        id: '1',
        title: 'Vintage Rolex Watch',
        description: 'Rare 1960s Rolex Submariner in excellent condition',
        type: 'auction',
        price: 5000,
        starting_price: 5000,
        current_bid: 7500,
        bid_count: 12,
        image_url: 'https://picsum.photos/id/20/400/300',
        auction_end_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'active',
        created_at: new Date().toISOString(),
      },
      {
        id: '2',
        title: 'Original Picasso Sketch',
        description: 'Authenticated pencil sketch from 1952',
        type: 'auction',
        price: 25000,
        starting_price: 25000,
        current_bid: 32000,
        bid_count: 8,
        image_url: 'https://picsum.photos/id/30/400/300',
        auction_end_date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'active',
        created_at: new Date().toISOString(),
      },
      {
        id: '3',
        title: 'Signed Michael Jordan Jersey',
        description: 'Authentic jersey signed by MJ himself with COA',
        type: 'auction',
        price: 1500,
        starting_price: 1500,
        current_bid: 2800,
        bid_count: 23,
        image_url: 'https://picsum.photos/id/100/400/300',
        auction_end_date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'active',
        created_at: new Date().toISOString(),
      },
      {
        id: '4',
        title: 'Louis Vuitton Limited Bag',
        description: 'Limited edition, never used, original packaging',
        type: 'fixed',
        price: 1200,
        image_url: 'https://picsum.photos/id/21/400/300',
        created_at: new Date().toISOString(),
      },
      {
        id: '5',
        title: 'iPhone 15 Pro Max',
        description: 'Brand new, sealed, 512GB',
        type: 'fixed',
        price: 1300,
        image_url: 'https://picsum.photos/id/0/400/300',
        created_at: new Date().toISOString(),
      },
    ],
    bids: [
      {
        id: 'b1',
        item_id: '1',
        bidder_name: 'John Smith',
        bidder_email: 'john@example.com',
        bidder_phone: '+1234567890',
        bidder_address: '123 Main St, NY',
        amount: 7500,
        created_at: new Date().toISOString(),
      },
      {
        id: 'b2',
        item_id: '1',
        bidder_name: 'Jane Doe',
        bidder_email: 'jane@example.com',
        bidder_phone: '+1234567891',
        bidder_address: '456 Oak Ave, CA',
        amount: 7000,
        created_at: new Date().toISOString(),
      },
      {
        id: 'b3',
        item_id: '1',
        bidder_name: 'Bob Wilson',
        bidder_email: 'bob@example.com',
        bidder_phone: '+1234567892',
        bidder_address: '789 Pine Rd, TX',
        amount: 6500,
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

  async then(success: any, error?: any) {
    let result = this.data[this.table] || []
    
    // Apply filters
    Object.entries(this.filters).forEach(([key, value]) => {
      result = result.filter((item: any) => item[key] === value)
    })
    
    // Apply ordering
    if (this.orderBy) {
      result = [...result].sort((a, b) => {
        const aVal = a[this.orderBy!.column]
        const bVal = b[this.orderBy!.column]
        return this.orderBy!.ascending ? aVal - bVal : bVal - aVal
      })
    }
    
    // Handle single mode
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

// Create mock instance
export const supabase = new MockSupabaseClient() as any

// For debugging
console.log('🚀 Using MOCK Supabase client - no credentials needed')