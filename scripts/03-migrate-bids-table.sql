-- Migration: Add bidder details to bids table and enforce unique constraint

-- Add new columns to bids table if they don't exist
ALTER TABLE bids
ADD COLUMN IF NOT EXISTS bidder_name TEXT DEFAULT 'Anonymous',
ADD COLUMN IF NOT EXISTS bidder_address TEXT DEFAULT 'Not provided',
ADD COLUMN IF NOT EXISTS bidder_phone TEXT DEFAULT 'Not provided';

-- Update existing bids with placeholder data (assumes name is email for existing bids)
UPDATE bids
SET bidder_name = COALESCE(bidder_name, 'Anonymous'),
    bidder_address = COALESCE(bidder_address, 'Not provided'),
    bidder_phone = COALESCE(bidder_phone, 'Not provided')
WHERE bidder_name IS NULL OR bidder_address IS NULL OR bidder_phone IS NULL;

-- Make the new columns NOT NULL
ALTER TABLE bids
ALTER COLUMN bidder_name SET NOT NULL,
ALTER COLUMN bidder_address SET NOT NULL,
ALTER COLUMN bidder_phone SET NOT NULL;

-- Add unique constraint on (item_id, bidder_email) if it doesn't exist
ALTER TABLE bids
ADD CONSTRAINT bids_item_email_unique UNIQUE (item_id, bidder_email);

-- Add columns to items table if they don't exist
ALTER TABLE items
ADD COLUMN IF NOT EXISTS current_bid DECIMAL(10, 2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS bid_count INTEGER DEFAULT 0;

-- Update existing items with bid counts
UPDATE items
SET bid_count = (SELECT COUNT(*) FROM bids WHERE bids.item_id = items.id),
    current_bid = COALESCE((SELECT amount FROM bids WHERE bids.item_id = items.id ORDER BY amount DESC LIMIT 1), 0)
WHERE type = 'auction';
