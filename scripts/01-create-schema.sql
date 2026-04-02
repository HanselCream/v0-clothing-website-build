-- Create items table
CREATE TABLE items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type TEXT NOT NULL CHECK (type IN ('fixed', 'auction')),
  title TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10, 2),
  starting_price DECIMAL(10, 2),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'ended')),
  image_url TEXT,
  auction_end_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create bids table
CREATE TABLE bids (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  item_id UUID NOT NULL REFERENCES items(id) ON DELETE CASCADE,
  bidder_email TEXT NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  placed_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX idx_items_status ON items(status);
CREATE INDEX idx_items_type ON items(type);
CREATE INDEX idx_items_auction_end_date ON items(auction_end_date);
CREATE INDEX idx_bids_item_id ON bids(item_id);
CREATE INDEX idx_bids_item_id_amount ON bids(item_id, amount DESC);
CREATE INDEX idx_bids_placed_at ON bids(placed_at);
