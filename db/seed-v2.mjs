import { createConnection } from "mysql2/promise";
import dotenv from "dotenv";
dotenv.config();

const conn = await createConnection(process.env.DATABASE_URL);

// Seed brands
const [existingBrands] = await conn.execute("SELECT COUNT(*) as c FROM brands");
if (existingBrands[0].c === 0) {
  await conn.execute(`
    INSERT INTO brands (name, slug, logo) VALUES
    ('Sony', 'sony', '/brands/sony.svg'),
    ('Apple', 'apple', '/brands/apple.svg'),
    ('Samsung', 'samsung', '/brands/samsung.svg'),
    ('Bose', 'bose', '/brands/bose.svg'),
    ('Nike', 'nike', '/brands/nike.svg'),
    ('Adidas', 'adidas', '/brands/adidas.svg'),
    ('Herschel', 'herschel', '/brands/herschel.svg'),
    ('Ray-Ban', 'ray-ban', '/brands/rayban.svg'),
    ('Philips', 'philips', '/brands/philips.svg'),
    ('Dyson', 'dyson', '/brands/dyson.svg'),
    ('Lululemon', 'lululemon', '/brands/lululemon.svg'),
    ('The Ordinary', 'the-ordinary', '/brands/the-ordinary.svg')
  `);
  console.log("Seeded 12 brands");
}

// Get brand IDs
const [brandRows] = await conn.execute("SELECT id, slug FROM brands");
const brandMap = {};
for (const b of brandRows) {
  brandMap[b.slug] = b.id;
}

// Update products with ratings, colors, and brandIds
const productUpdates = [
  { slug: "wireless-noise-cancelling-headphones", rating: 4.8, reviewCount: 124, colors: 'Black,Silver,Blue', brandId: brandMap['sony'] },
  { slug: "portable-bluetooth-speaker", price: "0.50", moq: 10, rating: 4.5, reviewCount: 89, colors: 'Black,Blue,Red', brandId: brandMap['bose'] },
  { slug: "true-wireless-earbuds-pro", rating: 4.6, reviewCount: 203, colors: 'White,Black,Navy', brandId: brandMap['apple'] },
  { slug: "smart-watch-pro", rating: 4.7, reviewCount: 156, colors: 'Black,Silver,Rose Gold', brandId: brandMap['apple'] },
  { slug: "fitness-tracker-band", rating: 4.3, reviewCount: 78, colors: 'Black,Blue,Pink', brandId: brandMap['samsung'] },
  { slug: "4k-action-camera", rating: 4.4, reviewCount: 45, colors: 'Black,Silver', brandId: brandMap['sony'] },
  { slug: "usb-c-hub-7-in-1", rating: 4.6, reviewCount: 312, colors: 'Silver,Space Gray', brandId: brandMap['apple'] },
  { slug: "minimalist-leather-backpack", rating: 4.9, reviewCount: 67, colors: 'Brown,Black,Tan', brandId: brandMap['herschel'] },
  { slug: "canvas-weekender-tote", rating: 4.4, reviewCount: 34, colors: 'Olive,Navy,Beige', brandId: brandMap['herschel'] },
  { slug: "polarized-sunglasses-aviator", rating: 4.7, reviewCount: 92, colors: 'Gold,Silver,Black', brandId: brandMap['ray-ban'] },
  { slug: "blue-light-blocking-glasses", rating: 4.3, reviewCount: 156, colors: 'Tortoise,Black,Clear', brandId: brandMap['ray-ban'] },
  { slug: "wool-knit-beanie", rating: 4.5, reviewCount: 48, colors: 'Charcoal,Navy,Cream', brandId: brandMap['nike'] },
  { slug: "classic-baseball-cap", rating: 4.2, reviewCount: 73, colors: 'Navy,Black,White,Olive', brandId: brandMap['adidas'] },
  { slug: "premium-cotton-t-shirt", rating: 4.6, reviewCount: 215, colors: 'White,Black,Gray,Navy,Olive', brandId: brandMap['nike'] },
  { slug: "ceramic-table-lamp", rating: 4.8, reviewCount: 38, colors: 'White,Cream', brandId: brandMap['philips'] },
  { slug: "led-strip-lights-5m", rating: 4.4, reviewCount: 127, colors: 'RGB', brandId: brandMap['philips'] },
  { slug: "scented-candle-collection", rating: 4.7, reviewCount: 89, colors: 'Variety', brandId: brandMap['dyson'] },
  { slug: "reed-diffuser-set", rating: 4.5, reviewCount: 56, colors: 'Clear', brandId: brandMap['dyson'] },
  { slug: "geometric-ceramic-vase", rating: 4.6, reviewCount: 42, colors: 'White,Black', brandId: brandMap['dyson'] },
  { slug: "chunky-knit-throw-blanket", rating: 4.8, reviewCount: 63, colors: 'Cream,Gray,Blush', brandId: brandMap['dyson'] },
  { slug: "yoga-mat-premium", rating: 4.5, reviewCount: 178, colors: 'Teal,Purple,Black', brandId: brandMap['lululemon'] },
  { slug: "resistance-bands-set", rating: 4.3, reviewCount: 94, colors: 'Multi', brandId: brandMap['nike'] },
  { slug: "stainless-steel-water-bottle", rating: 4.6, reviewCount: 245, colors: 'Black,White,Silver', brandId: brandMap['nike'] },
  { slug: "collapsible-silicone-bottle", rating: 4.1, reviewCount: 37, colors: 'Teal,Gray,Pink', brandId: brandMap['lululemon'] },
  { slug: "foldable-camping-chair", rating: 4.4, reviewCount: 28, colors: 'Olive,Gray', brandId: brandMap['nike'] },
  { slug: "foam-roller-high-density", rating: 4.5, reviewCount: 112, colors: 'Black,Blue', brandId: brandMap['lululemon'] },
  { slug: "vitamin-c-serum", rating: 4.8, reviewCount: 324, colors: null, brandId: brandMap['the-ordinary'] },
  { slug: "organic-face-moisturizer", rating: 4.6, reviewCount: 187, colors: null, brandId: brandMap['the-ordinary'] },
  { slug: "retinol-night-cream", rating: 4.7, reviewCount: 156, colors: null, brandId: brandMap['the-ordinary'] },
  { slug: "dead-sea-salt-body-scrub", rating: 4.5, reviewCount: 89, colors: null, brandId: brandMap['the-ordinary'] },
  { slug: "argan-oil-hair-treatment", rating: 4.4, reviewCount: 134, colors: null, brandId: brandMap['the-ordinary'] },
  { slug: "jade-facial-roller-gua-sha", rating: 4.3, reviewCount: 67, colors: 'Green', brandId: brandMap['the-ordinary'] },
];

for (const update of productUpdates) {
  const fields = [];
  const values = [];

  if (update.price !== undefined) { fields.push("price = ?"); values.push(update.price); }
  if (update.moq !== undefined) { fields.push("moq = ?"); values.push(update.moq); }
  if (update.rating !== undefined) { fields.push("rating = ?"); values.push(update.rating); }
  if (update.reviewCount !== undefined) { fields.push("reviewCount = ?"); values.push(update.reviewCount); }
  if (update.colors !== undefined) { fields.push("colors = ?"); values.push(update.colors); }
  if (update.brandId !== undefined) { fields.push("brandId = ?"); values.push(update.brandId); }

  if (fields.length > 0) {
    const sql = `UPDATE products SET ${fields.join(", ")} WHERE slug = ?`;
    values.push(update.slug);
    await conn.execute(sql, values);
  }
}
console.log(`Updated ${productUpdates.length} products with ratings/colors/brands`);

// Seed blog posts
const [existingBlogs] = await conn.execute("SELECT COUNT(*) as c FROM blogPosts");
if (existingBlogs[0].c === 0) {
  await conn.execute(`
    INSERT INTO blogPosts (title, slug, excerpt, content, image, category, author, publishedAt) VALUES
    ('How to Choose the Perfect Headphones for Your Lifestyle', 'how-to-choose-headphones', 'A comprehensive guide to finding the right headphones whether you are commuting, working out, or gaming.', 'Full content here...', '/blog/headphones.jpg', 'Guides', 'Sarah Chen', NOW()),
    ('Top 10 Smart Home Gadgets to Upgrade Your Space in 2025', 'top-smart-home-gadgets-2025', 'From smart speakers to automated lighting, these are the devices that will transform your home.', 'Full content here...', '/blog/smart-home.jpg', 'Reviews', 'Mike Torres', DATE_SUB(NOW(), INTERVAL 3 DAY)),
    ('The Ultimate Skincare Routine for Busy Professionals', 'skincare-routine-busy-professionals', 'A simple but effective 5-step routine that takes under 10 minutes each morning and night.', 'Full content here...', '/blog/skincare.jpg', 'Beauty', 'Emma Wilson', DATE_SUB(NOW(), INTERVAL 7 DAY)),
    ('Why Sustainable Fashion Matters More Than Ever', 'sustainable-fashion-matters', 'Exploring the environmental impact of fast fashion and how conscious choices make a difference.', 'Full content here...', '/blog/sustainable-fashion.jpg', 'Fashion', 'Lisa Park', DATE_SUB(NOW(), INTERVAL 10 DAY))
  `);
  console.log("Seeded 4 blog posts");
}

console.log("All seeding complete!");
await conn.end();
