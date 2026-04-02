-- Create items table
CREATE TABLE items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type TEXT NOT NULL CHECK (type IN ('fixed', 'auction')),
  title TEXT NOT NULL,
  description TEXT,
  measurements JSONB,
  price DECIMAL(10, 2),
  current_bid DECIMAL(10, 2) DEFAULT 0,
  bid_count INTEGER DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'sold', 'ended')),
  image_url TEXT,
  drop_month TEXT,
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

-- Create orders table
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  item_id UUID NOT NULL REFERENCES items(id) ON DELETE CASCADE,
  buyer_email TEXT NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('fixed', 'auction')),
  stripe_session_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX idx_items_status ON items(status);
CREATE INDEX idx_items_type ON items(type);
CREATE INDEX idx_items_drop_month ON items(drop_month);
CREATE INDEX idx_bids_item_id ON bids(item_id);
CREATE INDEX idx_bids_placed_at ON bids(placed_at);
CREATE INDEX idx_orders_item_id ON orders(item_id);
CREATE INDEX idx_orders_created_at ON orders(created_at);
