-- Insert fixed price items for April 2026
INSERT INTO items (type, title, description, measurements, price, status, image_url, drop_month)
VALUES 
  (
    'fixed',
    'Minimal Black Oversized Tee',
    'Premium heavyweight cotton. Oversized fit with dropped shoulders. Perfect for layering or standalone wear.',
    '{"chest": "56cm", "length": "75cm", "shoulders": "56cm", "sleeve": "25cm"}',
    120.00,
    'active',
    '/images/tee-black.jpg',
    '2026-04'
  ),
  (
    'fixed',
    'Monochrome Cargo Pants',
    'Structured 100% cotton canvas. Multiple utility pockets. Straight leg silhouette with reinforced seams.',
    '{"waist": "34in", "length": "32in", "inseam": "32in"}',
    180.00,
    'active',
    '/images/cargo-gray.jpg',
    '2026-04'
  ),
  (
    'fixed',
    'Essential Minimal Hoodie',
    'Organic cotton blend. Drawstring details. Contemporary fit with textured ribbing.',
    '{"chest": "54cm", "length": "70cm", "shoulders": "52cm", "sleeve": "65cm"}',
    150.00,
    'active',
    '/images/hoodie-white.jpg',
    '2026-04'
  );

-- Insert auction items
INSERT INTO items (type, title, description, measurements, current_bid, bid_count, status, image_url, drop_month)
VALUES 
  (
    'auction',
    'Vintage Rare Denim Jacket',
    'One-of-a-kind vintage 1980s Japanese indigo denim. Hand-stitched details. Minimal wear, exceptional patina.',
    '{"chest": "50cm", "length": "62cm", "shoulders": "48cm", "sleeve": "63cm"}',
    250.00,
    3,
    'active',
    '/images/denim-vintage.jpg',
    '2026-04'
  ),
  (
    'auction',
    'Rare Monochrome Linen Shirt',
    'Handwoven European linen. Statement collar. Limited production piece from 2015. Original condition.',
    '{"chest": "52cm", "length": "73cm", "shoulders": "50cm", "sleeve": "64cm"}',
    150.00,
    2,
    'active',
    '/images/linen-shirt.jpg',
    '2026-04'
  );
