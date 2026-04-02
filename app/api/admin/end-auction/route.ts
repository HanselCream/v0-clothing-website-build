import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: NextRequest) {
  try {
    const { item_id, admin_password } = await req.json()

    // Validate admin password
    if (admin_password !== process.env.ADMIN_PASSWORD) {
      return NextResponse.json(
        { error: 'Invalid admin password' },
        { status: 401 }
      )
    }

    if (!item_id) {
      return NextResponse.json(
        { error: 'Missing item_id' },
        { status: 400 }
      )
    }

    // Fetch the item
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

    // Get highest bid
    const { data: highestBid } = await supabase
      .from('bids')
      .select('*')
      .eq('item_id', item_id)
      .order('bid_amount', { ascending: false })
      .limit(1)
      .single()

    if (!highestBid) {
      return NextResponse.json(
        { error: 'No bids placed on this auction' },
        { status: 400 }
      )
    }

    // Create payment link using Stripe
    const paymentLink = await stripe.paymentLinks.create({
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: `${item.title} (Auction Winner)`,
              description: `Final winning bid for auction item`,
            },
            unit_amount: Math.round(highestBid.bid_amount * 100),
          },
          quantity: 1,
        },
      ],
      after_completion: {
        type: 'redirect',
        redirect: {
          url: `${process.env.NEXT_PUBLIC_BASE_URL}/success?item_id=${item_id}`,
        },
      },
    })

    // Create order record for the auction winner
    await supabase.from('orders').insert([
      {
        item_id,
        customer_name: highestBid.bidder_name,
        customer_email: highestBid.bidder_email,
        total_price: highestBid.bid_amount,
        stripe_payment_link: paymentLink.url,
        created_at: new Date().toISOString(),
      },
    ])

    // Update item to mark auction as ended
    await supabase
      .from('items')
      .update({ auction_ended: true })
      .eq('id', item_id)

    return NextResponse.json({
      success: true,
      paymentLink: paymentLink.url,
      winner: {
        name: highestBid.bidder_name,
        email: highestBid.bidder_email,
        bid: highestBid.bid_amount,
      },
    })
  } catch (error) {
    console.error('End auction error:', error)
    return NextResponse.json(
      { error: 'Failed to end auction' },
      { status: 500 }
    )
  }
}
