import { supabaseAdmin as supabase } from '@/lib/supabase'
import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

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

    // Get top 3 unique bids by email
    const { data: allBids } = await supabase
      .from('bids')
      .select('*')
      .eq('item_id', item_id)
      .order('amount', { ascending: false })

    if (!allBids || allBids.length === 0) {
      return NextResponse.json(
        { error: 'No bids placed on this auction' },
        { status: 400 }
      )
    }

    // Get top 3 unique bidders (by email)
    const uniqueBidders = new Map<string, typeof allBids[0]>()
    allBids.forEach(bid => {
      if (!uniqueBidders.has(bid.bidder_email)) {
        uniqueBidders.set(bid.bidder_email, bid)
      }
    })

    const topThree = Array.from(uniqueBidders.values())
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 3)

    // Create Olympic podium result with full details
    const podium = topThree.map((bid, index) => ({
      rank: index + 1,
      bidder_name: bid.bidder_name,
      bidder_email: bid.bidder_email,
      bidder_phone: bid.bidder_phone,
      bidder_address: bid.bidder_address,
      amount: bid.amount,
    }))

    // Send email to admin
    if (process.env.ADMIN_EMAIL) {
      const emailBody = `
Auction Ended: ${item.title}

🥇 1st Place (Gold)
Name: ${podium[0]?.bidder_name}
Email: ${podium[0]?.bidder_email}
Phone: ${podium[0]?.bidder_phone}
Address: ${podium[0]?.bidder_address}
Amount: ₱${podium[0]?.amount.toLocaleString()}

${podium[1] ? `🥈 2nd Place (Silver)
Name: ${podium[1].bidder_name}
Email: ${podium[1].bidder_email}
Phone: ${podium[1].bidder_phone}
Address: ${podium[1].bidder_address}
Amount: ₱${podium[1].amount.toLocaleString()}

` : ''}
${podium[2] ? `🥉 3rd Place (Bronze)
Name: ${podium[2].bidder_name}
Email: ${podium[2].bidder_email}
Phone: ${podium[2].bidder_phone}
Address: ${podium[2].bidder_address}
Amount: ₱${podium[2].amount.toLocaleString()}

` : ''}
Contact winners via Facebook Messenger to arrange payment.
      `

      await resend.emails.send({
        from: 'noreply@resend.dev',
        to: process.env.ADMIN_EMAIL,
        subject: `Auction Ended — ${item.title}`,
        text: emailBody,
      })
    }

    // Mark item status as ended
    await supabase
      .from('items')
      .update({ status: 'ended' })
      .eq('id', item_id)

    return NextResponse.json({
      success: true,
      podium,
    })
  } catch (error) {
    console.error('End auction error:', error)
    return NextResponse.json(
      { error: 'Failed to end auction' },
      { status: 500 }
    )
  }
}
