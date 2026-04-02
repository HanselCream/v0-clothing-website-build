import { supabase } from '@/lib/supabase'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const item_id = searchParams.get('item_id')
    const email = searchParams.get('email')

    if (!item_id || !email) {
      return NextResponse.json(
        { error: 'Missing item_id or email' },
        { status: 400 }
      )
    }

    const { data: bid, error } = await supabase
      .from('bids')
      .select('amount')
      .eq('item_id', item_id)
      .eq('bidder_email', email)
      .single()

    if (error && error.code !== 'PGRST116') {
      // PGRST116 is "no rows found" - that's expected and fine
      console.error('Check bid error:', error)
      return NextResponse.json(
        { has_bid: false, amount: null },
        { status: 200 }
      )
    }

    return NextResponse.json({
      has_bid: !!bid,
      amount: bid?.amount || null,
    })
  } catch (error) {
    console.error('Check bid error:', error)
    return NextResponse.json(
      { has_bid: false, amount: null },
      { status: 200 }
    )
  }
}
