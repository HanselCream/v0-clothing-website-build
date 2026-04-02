import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: NextRequest) {
  try {
    const body = await req.text()
    const signature = req.headers.get('stripe-signature')!

    const event = stripe.webhooks.constructEvent(body, signature, webhookSecret)

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session
      const itemId = session.metadata?.item_id
      const customerName = session.metadata?.customer_name

      if (itemId && session.payment_status === 'paid') {
        // Create order record
        await supabase.from('orders').insert([
          {
            item_id: itemId,
            customer_name: customerName || session.customer_email,
            customer_email: session.customer_email,
            total_price: (session.amount_total || 0) / 100,
            stripe_session_id: session.id,
            created_at: new Date().toISOString(),
          },
        ])
      }
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Webhook error:', error)
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 400 }
    )
  }
}
