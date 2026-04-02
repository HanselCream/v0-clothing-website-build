# Auction Website - Updated Requirements

## Major Changes

### 1. Removed Stripe Integration
- ❌ Deleted `/api/checkout/route.ts` - no longer accepting online payments
- ❌ Deleted `/api/webhook/route.ts` - Stripe webhooks removed
- ❌ Deleted `CheckoutForm` component
- ❌ Removed `@stripe/js` and `stripe` packages
- ✅ Added `resend` package for email notifications

### 2. Payment Model Changed
- **Fixed Items**: No online checkout - displayed for browsing only. Buyers contact via Messenger for payment.
- **Auction Items**: Winners determined, contacted manually via Messenger to arrange payment.

### 3. Olympic Podium Results (NEW)
When admin clicks "End Auction":
- System queries **top 3 unique bidders by email**
- Displays results on admin dashboard styled as Olympic podium:
  - 🥇 **Gold** - 1st place (#FFD700)
  - 🥈 **Silver** - 2nd place (#C0C0C0)
  - 🥉 **Bronze** - 3rd place (#CD7F32)
- Shows: rank, bidder email, winning bid amount
- Sends summary email to admin via Resend with all 3 winners

### 4. Public Bidding Display
- **Before**: Bid history showed bidder names
- **After**: Bid history shows only bid amounts and dates (no bidder emails)
- Public pages show: current highest bid amount + total bid count
- Auction ended banner: "This auction has ended. Winners will be contacted via Messenger."

### 5. Database Schema
**Removed**: `orders` table (no longer needed)

**Updated `items` table**:
- Removed: `current_bid`, `bid_count`, `measurements`, `drop_month`
- Simplified fields: `price` (for fixed items), `starting_price` (for auctions)
- Status values: `'active' | 'inactive' | 'ended'` (removed 'sold')

**`bids` table** - unchanged:
- Stores: `item_id`, `bidder_email`, `amount`, `placed_at`

## Required Environment Variables

Add these to your project settings (Vars section):

```
NEXT_PUBLIC_SUPABASE_URL=<your-supabase-url>
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-supabase-anon-key>
SUPABASE_SERVICE_ROLE_KEY=<your-service-role-key>
RESEND_API_KEY=<your-resend-api-key>
ADMIN_PASSWORD=<create-a-strong-password>
ADMIN_EMAIL=<your-email-for-auction-notifications>
NEXT_PUBLIC_SITE_URL=<your-domain-url>
```

**Removed ENV Variables**:
- ❌ `STRIPE_SECRET_KEY`
- ❌ `STRIPE_WEBHOOK_SECRET`
- ❌ `STRIPE_PUBLISHABLE_KEY`
- ❌ `NEXT_PUBLIC_BASE_URL` (replaced with `NEXT_PUBLIC_SITE_URL`)

## Files Changed

### Deleted
- `/app/api/checkout/route.ts`
- `/app/api/webhook/route.ts`
- `/app/components/CheckoutForm.tsx`

### Updated
- `/app/api/admin/end-auction/route.ts` - Now uses Resend, returns podium data
- `/app/item/[id]/page.tsx` - Hides bidder emails, shows auction ended banner
- `/app/components/AdminAuctionTab.tsx` - Displays Olympic podium results
- `/app/components/AdminFixedTab.tsx` - Simplified (no checkout, no orders)
- `/scripts/01-create-schema.sql` - Removed orders table
- `/package.json` - Removed Stripe, added Resend

## Admin Workflow

1. Navigate to `/admin`
2. Enter password (from `ADMIN_PASSWORD` env var)
3. View auctions in "Auctions" tab
4. Click "End Auction" button on any active auction
5. System automatically:
   - Identifies top 3 unique bidders by email
   - Displays podium results in admin dashboard
   - Sends email to `ADMIN_EMAIL` with winner details
   - Marks item status as 'ended'

## Public Workflow

1. Browse auctions and fixed items on homepage
2. Click item to view details
3. **For Auctions**:
   - See current highest bid and bid count
   - Place bids (if auction still active)
   - See "This auction has ended" message after admin ends it
4. **For Fixed Items**:
   - View price and details
   - Note: "Payment handled manually"
   - Contact admin via Messenger to purchase

## Migration Notes

⚠️ **Important**: The database schema has changed:
- The `orders` table has been completely removed
- If you have existing orders data, back it up before running the new schema script
- The `items` table structure has been simplified

Run the migration scripts in order:
1. `/scripts/01-create-schema.sql` - Creates new schema
2. `/scripts/02-seed-data.sql` - Populates test data

