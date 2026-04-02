# Setup Guide - Updated Auction Website

## Step 1: Update Environment Variables

You need to update your environment variables in project settings (Vars section). Replace the old Stripe variables with:

### Required Variables

```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
RESEND_API_KEY
ADMIN_PASSWORD
ADMIN_EMAIL
NEXT_PUBLIC_SITE_URL
```

### How to Get Each Variable

#### Supabase Keys
1. Go to your Supabase project dashboard
2. Settings → API
3. Copy `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
4. Copy `anon public` key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
5. Copy `service_role` key → `SUPABASE_SERVICE_ROLE_KEY`

#### Resend API Key
1. Sign up at [resend.com](https://resend.com)
2. Go to API keys section
3. Create a new API key → `RESEND_API_KEY`

#### Admin Settings
- `ADMIN_PASSWORD`: Create a strong password for `/admin` access
- `ADMIN_EMAIL`: Your email address (where auction notifications will be sent)
- `NEXT_PUBLIC_SITE_URL`: Your website URL (e.g., `https://yourdomain.com`)

## Step 2: Run Database Migrations

The database schema has been simplified. You need to:

1. **Important**: If you have existing data, back it up first
2. Run migration: `/scripts/01-create-schema.sql`
   - This creates the `items` and `bids` tables (removes `orders` table)
3. Run seed data: `/scripts/02-seed-data.sql`
   - This populates test data with 3 fixed items and 2 auctions

## Step 3: Test the Setup

1. Go to `/admin`
2. Enter your `ADMIN_PASSWORD`
3. You should see:
   - "Auctions" tab with 2 test auction items
   - "Fixed Items" tab with 3 test items

## Step 4: Test Auction Ending

1. In Admin → Auctions tab
2. Click "End Auction" on any auction
3. You should see the Olympic podium results displayed
4. Check your `ADMIN_EMAIL` for the notification email (may take a few seconds)

## Troubleshooting

### Email Not Sending
- Check `ADMIN_EMAIL` is correct
- Check `RESEND_API_KEY` is valid
- Check browser console for API errors
- Verify the `ADMIN_EMAIL` domain is verified in Resend

### Admin Dashboard Not Loading
- Check `ADMIN_PASSWORD` matches the env var exactly
- Verify Supabase keys are correct
- Check browser dev tools for any errors

### Database Errors
- Ensure you ran both migration scripts in order
- Verify `SUPABASE_SERVICE_ROLE_KEY` has permission to create tables
- Check if tables already exist (may need to drop old schema first)

## What's New

✨ **Key Features**:
- Olympic podium display for auction winners
- Email notifications to admin with winner details
- Public bid history hides bidder emails (privacy)
- Simplified fixed items display (no online checkout)
- All payments handled manually via Messenger

🗑️ **Removed**:
- Stripe checkout integration
- Online payment processing
- Orders table from database
- Customer payment links

## Next Steps

1. Set all environment variables ✓
2. Run database migrations ✓
3. Test the admin dashboard ✓
4. Add your items to the database
5. Customize homepage if needed

Enjoy your auction website! 🎉
