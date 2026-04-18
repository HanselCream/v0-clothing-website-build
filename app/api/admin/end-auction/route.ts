import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  try {
    const { item_id, admin_password } = await req.json()

    if (admin_password !== process.env.ADMIN_PASSWORD) {
      return NextResponse.json({ error: 'Invalid admin password' }, { status: 401 })
    }

    if (!item_id) {
      return NextResponse.json({ error: 'Missing item_id' }, { status: 400 })
    }

    const { data: item, error: itemError } = await supabase
      .from('items').select('*').eq('id', item_id).single()

    if (itemError || !item) {
      return NextResponse.json({ error: 'Item not found' }, { status: 404 })
    }

    if (item.type !== 'auction') {
      return NextResponse.json({ error: 'Item is not an auction' }, { status: 400 })
    }

    const { data: allBids } = await supabase
      .from('bids').select('*').eq('item_id', item_id).order('amount', { ascending: false })

    if (!allBids || allBids.length === 0) {
      return NextResponse.json({ error: 'No bids placed on this auction' }, { status: 400 })
    }

    const uniqueBidders = new Map<string, typeof allBids[0]>()
    allBids.forEach(bid => {
      if (!uniqueBidders.has(bid.bidder_email)) {
        uniqueBidders.set(bid.bidder_email, bid)
      }
    })

    const topThree = Array.from(uniqueBidders.values())
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 3)

    const podium = topThree.map((bid, index) => ({
      rank: index + 1,
      bidder_name: bid.bidder_name,
      bidder_email: bid.bidder_email,
      bidder_phone: bid.bidder_phone,
      bidder_address: bid.bidder_address,
      amount: bid.amount,
    }))

    if (process.env.ADMIN_EMAIL && process.env.RESEND_API_KEY) {
      const emailBody = `Auction Ended: ${item.title}\n\n🥇 1st Place\nName: ${podium[0]?.bidder_name}\nEmail: ${podium[0]?.bidder_email}\nPhone: ${podium[0]?.bidder_phone}\nAmount: ₱${podium[0]?.amount.toLocaleString()}`

      await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: 'onboarding@resend.dev',
          to: process.env.ADMIN_EMAIL,
          subject: `Auction Ended — ${item.title}`,
          text: emailBody,
        }),
      })
    }

    await supabase.from('items').update({ status: 'ended' }).eq('id', item_id)

    return NextResponse.json({ success: true, podium })
  } catch (error) {
    console.error('End auction error:', error)
    return NextResponse.json({ error: 'Failed to end auction' }, { status: 500 })
  }
}