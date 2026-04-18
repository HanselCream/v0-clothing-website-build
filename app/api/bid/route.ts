import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const supabase = createClient(  // ← moved inside
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  try {
    const { item_id, name, address, phone, email, amount } = await req.json()

    if (!item_id || !name || !address || !phone || !email || !amount) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const { data: existingBid } = await supabase
      .from('bids').select('*').eq('item_id', item_id).eq('bidder_email', email).single()

    if (existingBid) {
      return NextResponse.json({ error: 'You have already bid on this item' }, { status: 400 })
    }

    const { data: item, error: itemError } = await supabase
      .from('items').select('*').eq('id', item_id).single()

    if (itemError || !item) {
      return NextResponse.json({ error: 'Item not found' }, { status: 404 })
    }

    if (amount <= item.current_bid) {
      return NextResponse.json({ error: 'Bid must exceed current highest bid' }, { status: 400 })
    }

    const { error: bidError } = await supabase.from('bids').insert([{
      item_id,
      bidder_name: name,
      bidder_address: address,
      bidder_phone: phone,
      bidder_email: email,
      amount,
    }])

    if (bidError) {
      console.error('Bid insert error:', bidError)
      return NextResponse.json({ error: 'Failed to place bid' }, { status: 500 })
    }

    const { error: updateError } = await supabase
      .from('items')
      .update({ current_bid: amount, bid_count: (item.bid_count || 0) + 1 })
      .eq('id', item_id)

    if (updateError) console.error('Item update error:', updateError)

    return NextResponse.json({ success: true, amount })
  } catch (error) {
    console.error('Bid error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}