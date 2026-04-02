import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: NextRequest) {
  try {
    const { item_id, bidder_name, bidder_email, bid_amount } = await req.json()

    // Validate input
    if (!item_id || !bidder_name || !bidder_email || !bid_amount) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Fetch the item to check if it's an auction and validate bid
    const { data: item, error: itemError } = await supabase
      .from('items')
      .select('*')
      .eq('id', item_id)
      .single()

    if (itemError || !item) {
      return NextResponse.json(
        { error: 'Item not found' },
        { status: 404 }
      )
    }

    if (item.type !== 'auction') {
      return NextResponse.json(
        { error: 'Item is not an auction' },
        { status: 400 }
      )
    }

    // Check if auction is still active
    const now = new Date()
    if (new Date(item.auction_end_date) < now) {
      return NextResponse.json(
        { error: 'Auction has ended' },
        { status: 400 }
      )
    }

    // Check if bid is higher than current highest bid
    const { data: highestBid } = await supabase
      .from('bids')
      .select('bid_amount')
      .eq('item_id', item_id)
      .order('bid_amount', { ascending: false })
      .limit(1)
      .single()

    const minimumBid = highestBid?.bid_amount ? highestBid.bid_amount + 1 : item.starting_price
    if (bid_amount < minimumBid) {
      return NextResponse.json(
        { error: `Bid must be at least $${minimumBid}` },
        { status: 400 }
      )
    }

    // Insert the bid
    const { data: bid, error: bidError } = await supabase
      .from('bids')
      .insert([
        {
          item_id,
          bidder_name,
          bidder_email,
          bid_amount,
          created_at: new Date().toISOString(),
        },
      ])
      .select()
      .single()

    if (bidError) {
      return NextResponse.json(
        { error: 'Failed to place bid' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true, bid })
  } catch (error) {
    console.error('Bid error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
