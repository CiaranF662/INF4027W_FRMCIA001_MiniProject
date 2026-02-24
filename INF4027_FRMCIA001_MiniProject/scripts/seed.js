// scripts/seed.js
//
// Populates the Firestore database with realistic ReVibe SA denim data.
// Run with: npm run seed
//
// What this script creates:
//   - 7 denim categories
//   - 25 denim products with full attributes and SA pricing
//   - 5 users (1 admin + 4 customers) in Firebase Auth + Firestore
//   - 12 orders spread across the last 3 months
//
// To wipe and reseed: npm run clear && npm run seed

const admin = require('firebase-admin');
const path  = require('path');

// ─── Firebase Admin Initialisation ───────────────────────────────────────────
// Uses serviceAccountKey.json directly — more reliable than env vars for
// local scripts because it avoids private key formatting issues.

const serviceAccount = require(path.join(__dirname, '..', 'serviceAccountKey.json'));

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

const db   = admin.firestore();
const auth = admin.auth();

// ─── Categories ───────────────────────────────────────────────────────────────

const categories = [
  { name: 'Jeans',                description: 'All cuts and styles of denim jeans' },
  { name: 'Jackets',              description: 'Denim jackets, trucker and oversized styles' },
  { name: 'Shorts',               description: 'Denim shorts for all seasons' },
  { name: 'Skirts',               description: 'Denim mini, midi and maxi skirts' },
  { name: 'Overalls & Dungarees', description: 'Full-length and short denim overalls' },
  { name: 'Denim Shirts',         description: 'Western, chambray and classic denim shirts' },
  { name: 'Denim Accessories',    description: 'Bags, hats, belts and patches' },
];

// ─── Products ─────────────────────────────────────────────────────────────────
// Images use Unsplash URLs with ?w=600 for consistent sizing.
// categoryIndex matches the categories array above (0 = Jeans, 1 = Jackets, etc.)

const products = [
  // ── JEANS ──
  {
    title:       "Levi's 501 Original Straight",
    description: "The iconic straight leg 501 in a classic dark indigo wash. Authentic riveted buttons, 5-pocket styling. These are the real deal — proper heavyweight denim with that signature stiff-then-soften-to-you quality.",
    category:    'Jeans',
    brand:       "Levi's",
    size:        '32',
    condition:   'Good',
    colour:      'Indigo',
    gender:      'Men',
    fit:         'Straight',
    rise:        'Mid Rise',
    wash:        'Dark',
    weight:      'Heavyweight',
    stretch:     'No Stretch',
    selvedge:    false,
    distressing: 'None',
    era:         'Vintage 90s',
    style:       'Classic',
    tags:        ['501', 'straight leg', 'button fly', 'classic'],
    price:       320,
    originalPrice: 850,
    costPrice:   120,
    images:      ['https://images.unsplash.com/photo-1542272604-787c3835535d?w=600'],
    status:      'available',
  },
  {
    title:       "Levi's 550 Relaxed Tapered",
    description: "Relaxed through the seat and thigh with a tapered leg. Medium stonewash finish, well broken in. Perfect for a casual day look — comfortable without being sloppy.",
    category:    'Jeans',
    brand:       "Levi's",
    size:        '34',
    condition:   'Like New',
    colour:      'Medium Wash',
    gender:      'Men',
    fit:         'Relaxed',
    rise:        'Mid Rise',
    wash:        'Medium',
    weight:      'Midweight',
    stretch:     'No Stretch',
    selvedge:    false,
    distressing: 'None',
    era:         'Vintage 90s',
    style:       'Classic',
    tags:        ['relaxed fit', 'tapered', 'stonewash'],
    price:       280,
    originalPrice: 750,
    costPrice:   100,
    images:      ['https://images.unsplash.com/photo-1555689502-c4b22d76c56f?w=600'],
    status:      'available',
  },
  {
    title:       'Wrangler Cowboy Cut Western',
    description: "The original cowboy jean — slim through the hip and thigh, straight to the hem. Designed to be worn with boots. Dark rinse with minimal fading, barely worn.",
    category:    'Jeans',
    brand:       'Wrangler',
    size:        '30',
    condition:   'Like New',
    colour:      'Dark Wash',
    gender:      'Men',
    fit:         'Slim',
    rise:        'Mid Rise',
    wash:        'Dark',
    weight:      'Heavyweight',
    stretch:     'No Stretch',
    selvedge:    false,
    distressing: 'None',
    era:         'Modern',
    style:       'Workwear',
    tags:        ['western', 'cowboy cut', 'wrangler', 'slim'],
    price:       240,
    originalPrice: 620,
    costPrice:   90,
    images:      ['https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=600'],
    status:      'available',
  },
  {
    title:       'G-Star RAW 3301 Slim',
    description: "G-Star's most iconic slim fit jean. Engineered construction with the signature arc stitching detail. Raw indigo that has developed a beautiful fade on the thighs. Size 28 waist fits true.",
    category:    'Jeans',
    brand:       'G-Star RAW',
    size:        '28',
    condition:   'Good',
    colour:      'Raw',
    gender:      'Women',
    fit:         'Slim',
    rise:        'Mid Rise',
    wash:        'Raw/Unwashed',
    weight:      'Midweight',
    stretch:     'Slight Stretch',
    selvedge:    false,
    distressing: 'None',
    era:         'Modern',
    style:       'Streetwear',
    tags:        ['raw denim', 'slim', 'g-star', '3301', 'fade'],
    price:       480,
    originalPrice: 1400,
    costPrice:   180,
    images:      ['https://images.unsplash.com/photo-1582418702059-97ebafb35d09?w=600'],
    status:      'available',
  },
  {
    title:       'Mr Price High Rise Skinny',
    description: "Classic high-rise skinny in a light blue wash. Good stretch content makes these incredibly comfortable all day. Fits true to size — size 26 waist.",
    category:    'Jeans',
    brand:       'Mr Price',
    size:        '26',
    condition:   'Good',
    colour:      'Light Wash',
    gender:      'Women',
    fit:         'Skinny',
    rise:        'High Rise',
    wash:        'Light',
    weight:      'Lightweight',
    stretch:     'Super Stretch',
    selvedge:    false,
    distressing: 'None',
    era:         'Modern',
    style:       'Casual',
    tags:        ['skinny', 'high waist', 'stretch', 'light wash'],
    price:       120,
    originalPrice: 299,
    costPrice:   45,
    images:      ['https://images.unsplash.com/photo-1548126032-079a0fb0099d?w=600'],
    status:      'available',
  },
  {
    title:       'Diesel Larkee Regular Straight',
    description: "Diesel Larkee in a medium stonewash with subtle whiskers. Regular straight fit, sits at the natural waist. A wardrobe staple that goes with everything.",
    category:    'Jeans',
    brand:       'Diesel',
    size:        '32',
    condition:   'Good',
    colour:      'Medium Wash',
    gender:      'Men',
    fit:         'Straight',
    rise:        'Mid Rise',
    wash:        'Medium',
    weight:      'Midweight',
    stretch:     'No Stretch',
    selvedge:    false,
    distressing: 'Light',
    era:         'Modern',
    style:       'Classic',
    tags:        ['diesel', 'regular', 'straight', 'stonewash'],
    price:       550,
    originalPrice: 1800,
    costPrice:   200,
    images:      ['https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=600'],
    status:      'available',
  },
  {
    title:       'Cotton On Mom Jean',
    description: "Relaxed mom fit with a high rise and tapered leg. Light acid wash gives it that authentic 90s look. Sits at the natural waist — great with a tucked tee or crop top.",
    category:    'Jeans',
    brand:       'Cotton On',
    size:        '28',
    condition:   'Like New',
    colour:      'Light Wash',
    gender:      'Women',
    fit:         'Mom',
    rise:        'High Rise',
    wash:        'Acid',
    weight:      'Lightweight',
    stretch:     'Slight Stretch',
    selvedge:    false,
    distressing: 'Medium',
    era:         'Y2K',
    style:       'Vintage',
    tags:        ['mom jeans', 'acid wash', '90s', 'high waist'],
    price:       180,
    originalPrice: 449,
    costPrice:   65,
    images:      ['https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=600'],
    status:      'available',
  },
  {
    title:       'Woolworths Wide Leg Jean',
    description: "On-trend wide leg silhouette in a classic dark wash. High rise with a straight, wide leg all the way down. Excellent quality denim with subtle stretch for comfort.",
    category:    'Jeans',
    brand:       'Woolworths',
    size:        '30',
    condition:   'New with Tags',
    colour:      'Dark Wash',
    gender:      'Women',
    fit:         'Wide Leg',
    rise:        'High Rise',
    wash:        'Dark',
    weight:      'Midweight',
    stretch:     'Stretch',
    selvedge:    false,
    distressing: 'None',
    era:         'Modern',
    style:       'Classic',
    tags:        ['wide leg', 'high rise', 'dark wash', 'new'],
    price:       350,
    originalPrice: 799,
    costPrice:   130,
    images:      ['https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=600'],
    status:      'available',
  },

  // ── JACKETS ──
  {
    title:       "Levi's Trucker Jacket",
    description: "The original denim trucker — slightly cropped, structured silhouette. Medium indigo wash with all original metal hardware intact. A true timeless piece.",
    category:    'Jackets',
    brand:       "Levi's",
    size:        'M',
    condition:   'Good',
    colour:      'Indigo',
    gender:      'Unisex',
    fit:         'Relaxed',
    rise:        '',
    wash:        'Medium',
    weight:      'Heavyweight',
    stretch:     'No Stretch',
    selvedge:    false,
    distressing: 'Light',
    era:         'Vintage 90s',
    style:       'Classic',
    tags:        ['trucker', 'levi\'s', 'jacket', 'classic', 'unisex'],
    price:       450,
    originalPrice: 1200,
    costPrice:   170,
    images:      ['https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=600'],
    status:      'available',
  },
  {
    title:       'Diesel Oversized Denim Jacket',
    description: "Oversized boxy fit with dropped shoulders and distressed detailing. Washed black denim with faded patches at the elbows. A statement piece with serious streetwear energy.",
    category:    'Jackets',
    brand:       'Diesel',
    size:        'L',
    condition:   'Good',
    colour:      'Black',
    gender:      'Unisex',
    fit:         'Baggy',
    rise:        '',
    wash:        'Dark',
    weight:      'Midweight',
    stretch:     'No Stretch',
    selvedge:    false,
    distressing: 'Heavy',
    era:         'Modern',
    style:       'Streetwear',
    tags:        ['oversized', 'black denim', 'distressed', 'streetwear'],
    price:       680,
    originalPrice: 2200,
    costPrice:   250,
    images:      ['https://images.unsplash.com/photo-1495105787522-5334e3ffa0ef?w=600'],
    status:      'available',
  },
  {
    title:       "Lee Rider Denim Jacket",
    description: "Lee's classic Rider jacket — slightly slimmer than the Trucker with distinctive chest pockets. Light stonewash, perfect worn-in condition. A serious vintage find.",
    category:    'Jackets',
    brand:       'Lee',
    size:        'S',
    condition:   'Good',
    colour:      'Light Wash',
    gender:      'Women',
    fit:         'Slim',
    rise:        '',
    wash:        'Light',
    weight:      'Midweight',
    stretch:     'No Stretch',
    selvedge:    false,
    distressing: 'None',
    era:         'Vintage 80s',
    style:       'Vintage',
    tags:        ['lee', 'rider', 'vintage', 'light wash'],
    price:       380,
    originalPrice: 950,
    costPrice:   140,
    images:      ['https://images.unsplash.com/photo-1519058082700-08a0b56da9b4?w=600'],
    status:      'available',
  },
  {
    title:       'Mr Price Cropped Denim Jacket',
    description: "Super cropped denim jacket — hits right above the waist. Raw hem, no distressing. Perfect layering piece over summer dresses or high-waisted jeans.",
    category:    'Jackets',
    brand:       'Mr Price',
    size:        'XS',
    condition:   'Like New',
    colour:      'Medium Wash',
    gender:      'Women',
    fit:         'Slim',
    rise:        '',
    wash:        'Medium',
    weight:      'Lightweight',
    stretch:     'No Stretch',
    selvedge:    false,
    distressing: 'None',
    era:         'Modern',
    style:       'Casual',
    tags:        ['cropped', 'raw hem', 'layering', 'summer'],
    price:       160,
    originalPrice: 399,
    costPrice:   60,
    images:      ['https://images.unsplash.com/photo-1594938298603-c8148c4b4e02?w=600'],
    status:      'available',
  },
  {
    title:       'Wrangler Blanket Lined Denim Jacket',
    description: "Western-style denim jacket with plaid blanket lining — perfect for Cape Town winters. Snap buttons, chest pockets, warm and rugged. A rare find in South Africa.",
    category:    'Jackets',
    brand:       'Wrangler',
    size:        'L',
    condition:   'Good',
    colour:      'Dark Wash',
    gender:      'Men',
    fit:         'Relaxed',
    rise:        '',
    wash:        'Dark',
    weight:      'Heavyweight',
    stretch:     'No Stretch',
    selvedge:    false,
    distressing: 'None',
    era:         'Vintage 80s',
    style:       'Workwear',
    tags:        ['lined', 'western', 'wrangler', 'warm', 'snap buttons'],
    price:       520,
    originalPrice: 1100,
    costPrice:   190,
    images:      ['https://images.unsplash.com/photo-1603252110311-be2b9c4e5e16?w=600'],
    status:      'available',
  },

  // ── SHORTS ──
  {
    title:       "Levi's 501 Cut-Off Shorts",
    description: "Classic 501s cut down into shorts with a raw, frayed hem. Mid-thigh length. Authentic vintage 501 fabric — thick and durable. The perfect summer essential.",
    category:    'Shorts',
    brand:       "Levi's",
    size:        '27',
    condition:   'Good',
    colour:      'Light Wash',
    gender:      'Women',
    fit:         'Straight',
    rise:        'Mid Rise',
    wash:        'Light',
    weight:      'Heavyweight',
    stretch:     'No Stretch',
    selvedge:    false,
    distressing: 'Medium',
    era:         'Vintage 90s',
    style:       'Classic',
    tags:        ['cut-off', 'raw hem', '501', 'shorts', 'summer'],
    price:       195,
    originalPrice: 450,
    costPrice:   70,
    images:      ['https://images.unsplash.com/photo-1565084888279-aca607bb8f0e?w=600'],
    status:      'available',
  },
  {
    title:       'Cotton On Distressed Denim Shorts',
    description: "High-waisted denim shorts with heavy distressing and frayed hem. Acid stonewash gives them a faded vintage look. Great festival or beach look.",
    category:    'Shorts',
    brand:       'Cotton On',
    size:        'S',
    condition:   'Good',
    colour:      'Acid Wash',
    gender:      'Women',
    fit:         'Relaxed',
    rise:        'High Rise',
    wash:        'Acid',
    weight:      'Lightweight',
    stretch:     'Slight Stretch',
    selvedge:    false,
    distressing: 'Heavy',
    era:         'Y2K',
    style:       'Vintage',
    tags:        ['distressed', 'acid wash', 'festival', 'high waist'],
    price:       130,
    originalPrice: 349,
    costPrice:   50,
    images:      ['https://images.unsplash.com/photo-1584370848010-d7fe6bc767ec?w=600'],
    status:      'available',
  },
  {
    title:       'Woolworths Smart Denim Shorts',
    description: "Tailored denim shorts in a dark wash — smarter than your average cut-off. Sits at the knee, clean hem, no distressing. Versatile enough for the office or weekend.",
    category:    'Shorts',
    brand:       'Woolworths',
    size:        '32',
    condition:   'Like New',
    colour:      'Dark Wash',
    gender:      'Men',
    fit:         'Straight',
    rise:        'Mid Rise',
    wash:        'Dark',
    weight:      'Midweight',
    stretch:     'No Stretch',
    selvedge:    false,
    distressing: 'None',
    era:         'Modern',
    style:       'Classic',
    tags:        ['smart', 'dark wash', 'tailored', 'knee length'],
    price:       210,
    originalPrice: 499,
    costPrice:   80,
    images:      ['https://images.unsplash.com/photo-1591195853828-11db59a44f43?w=600'],
    status:      'available',
  },
  {
    title:       'Guess Bermuda Denim Shorts',
    description: "Guess Bermuda-length shorts in a medium blue wash. Below the knee, relaxed fit. Good quality denim with subtle Guess branding. Barely worn.",
    category:    'Shorts',
    brand:       'Guess',
    size:        '30',
    condition:   'Like New',
    colour:      'Medium Wash',
    gender:      'Men',
    fit:         'Relaxed',
    rise:        'Mid Rise',
    wash:        'Medium',
    weight:      'Midweight',
    stretch:     'No Stretch',
    selvedge:    false,
    distressing: 'None',
    era:         'Modern',
    style:       'Casual',
    tags:        ['bermuda', 'guess', 'below knee', 'summer'],
    price:       290,
    originalPrice: 899,
    costPrice:   110,
    images:      ['https://images.unsplash.com/photo-1607522370275-f6fd0f197571?w=600'],
    status:      'available',
  },

  // ── SKIRTS ──
  {
    title:       'Mr Price Denim Mini Skirt',
    description: "Classic denim mini skirt with a zip-fly front detail. Sits at the hip, mid-thigh length. Light blue wash, slightly stretchy. A Y2K wardrobe essential.",
    category:    'Skirts',
    brand:       'Mr Price',
    size:        'S',
    condition:   'Good',
    colour:      'Light Wash',
    gender:      'Women',
    fit:         '',
    rise:        'Low Rise',
    wash:        'Light',
    weight:      'Lightweight',
    stretch:     'Stretch',
    selvedge:    false,
    distressing: 'None',
    era:         'Y2K',
    style:       'Vintage',
    tags:        ['mini skirt', 'y2k', 'zip fly', 'low rise'],
    price:       110,
    originalPrice: 249,
    costPrice:   40,
    images:      ['https://images.unsplash.com/photo-1594938298603-c8148c4b4e02?w=600'],
    status:      'available',
  },
  {
    title:       'Woolworths Denim Midi Skirt',
    description: "Flattering A-line denim midi skirt. Falls just below the knee with a slight flare. Dark indigo wash, clean and minimal — a really versatile everyday piece.",
    category:    'Skirts',
    brand:       'Woolworths',
    size:        'M',
    condition:   'Like New',
    colour:      'Dark Wash',
    gender:      'Women',
    fit:         '',
    rise:        'Mid Rise',
    wash:        'Dark',
    weight:      'Midweight',
    stretch:     'Slight Stretch',
    selvedge:    false,
    distressing: 'None',
    era:         'Modern',
    style:       'Classic',
    tags:        ['midi', 'a-line', 'dark wash', 'everyday'],
    price:       260,
    originalPrice: 599,
    costPrice:   95,
    images:      ['https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=600'],
    status:      'available',
  },
  {
    title:       'Unbranded Patchwork Denim Maxi Skirt',
    description: "One-of-a-kind patchwork maxi skirt constructed from different denim washes — light, medium, and dark panels alternating down the full length. Handmade, unique piece.",
    category:    'Skirts',
    brand:       'Unbranded',
    size:        'M',
    condition:   'Good',
    colour:      'Medium Wash',
    gender:      'Women',
    fit:         '',
    rise:        'High Rise',
    wash:        'Medium',
    weight:      'Midweight',
    stretch:     'No Stretch',
    selvedge:    false,
    distressing: 'None',
    era:         'Vintage 70s',
    style:       'Vintage',
    tags:        ['patchwork', 'maxi', 'handmade', 'unique', '70s'],
    price:       220,
    originalPrice: 500,
    costPrice:   80,
    images:      ['https://images.unsplash.com/photo-1583496661160-fb5886a773c7?w=600'],
    status:      'available',
  },

  // ── OVERALLS & DUNGAREES ──
  {
    title:       "Levi's Loose Dungarees",
    description: "Classic bib-front dungarees in a light blue wash. Adjustable straps, roomy fit throughout. Wear with one strap undone for that effortless 90s look.",
    category:    'Overalls & Dungarees',
    brand:       "Levi's",
    size:        'L',
    condition:   'Good',
    colour:      'Light Wash',
    gender:      'Unisex',
    fit:         'Relaxed',
    rise:        'High Rise',
    wash:        'Light',
    weight:      'Midweight',
    stretch:     'No Stretch',
    selvedge:    false,
    distressing: 'Light',
    era:         'Vintage 90s',
    style:       'Vintage',
    tags:        ['dungarees', 'overalls', 'bib', '90s', 'one strap'],
    price:       420,
    originalPrice: 999,
    costPrice:   155,
    images:      ['https://images.unsplash.com/photo-1591195853828-11db59a44f43?w=600'],
    status:      'available',
  },
  {
    title:       'Cotton On Short Denim Overalls',
    description: "Cute short overalls with adjustable straps and multiple pockets. Medium blue wash with subtle fading. Perfect for hot SA summers — easy to throw on.",
    category:    'Overalls & Dungarees',
    brand:       'Cotton On',
    size:        'S',
    condition:   'Like New',
    colour:      'Medium Wash',
    gender:      'Women',
    fit:         'Relaxed',
    rise:        'High Rise',
    wash:        'Medium',
    weight:      'Lightweight',
    stretch:     'Slight Stretch',
    selvedge:    false,
    distressing: 'None',
    era:         'Modern',
    style:       'Casual',
    tags:        ['short overalls', 'summer', 'casual', 'pockets'],
    price:       200,
    originalPrice: 499,
    costPrice:   75,
    images:      ['https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=600'],
    status:      'available',
  },

  // ── DENIM SHIRTS ──
  {
    title:       'Wrangler Western Denim Shirt',
    description: "Classic western shirt with snap-button closure, two chest pockets with snap flaps, and contrast stitching. Light blue chambray weight. Worn twice.",
    category:    'Denim Shirts',
    brand:       'Wrangler',
    size:        'L',
    condition:   'Like New',
    colour:      'Light Wash',
    gender:      'Men',
    fit:         'Relaxed',
    rise:        '',
    wash:        'Light',
    weight:      'Lightweight',
    stretch:     'No Stretch',
    selvedge:    false,
    distressing: 'None',
    era:         'Modern',
    style:       'Workwear',
    tags:        ['western shirt', 'snap buttons', 'chambray', 'wrangler'],
    price:       275,
    originalPrice: 699,
    costPrice:   100,
    images:      ['https://images.unsplash.com/photo-1603252110311-be2b9c4e5e16?w=600'],
    status:      'available',
  },
  {
    title:       'Lee Long Sleeve Denim Shirt',
    description: "Soft, well-washed denim shirt in a medium blue. Classic straight cut with button-down collar. Works perfectly as a light jacket over a white tee.",
    category:    'Denim Shirts',
    brand:       'Lee',
    size:        'M',
    condition:   'Good',
    colour:      'Medium Wash',
    gender:      'Unisex',
    fit:         'Relaxed',
    rise:        '',
    wash:        'Medium',
    weight:      'Lightweight',
    stretch:     'No Stretch',
    selvedge:    false,
    distressing: 'None',
    era:         'Modern',
    style:       'Classic',
    tags:        ['denim shirt', 'button down', 'layering', 'unisex'],
    price:       195,
    originalPrice: 499,
    costPrice:   70,
    images:      ['https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=600'],
    status:      'available',
  },

  // ── DENIM ACCESSORIES ──
  {
    title:       "Levi's Denim Tote Bag",
    description: "Sturdy denim tote with leather-look handles and base. Made from recycled denim fabric — eco-friendly and practical. Large enough for a 13\" laptop. One interior pocket.",
    category:    'Denim Accessories',
    brand:       "Levi's",
    size:        'XL',
    condition:   'Like New',
    colour:      'Indigo',
    gender:      'Unisex',
    fit:         '',
    rise:        '',
    wash:        'Dark',
    weight:      'Midweight',
    stretch:     'No Stretch',
    selvedge:    false,
    distressing: 'None',
    era:         'Modern',
    style:       'Casual',
    tags:        ['tote', 'bag', 'recycled denim', 'eco', 'laptop'],
    price:       180,
    originalPrice: 450,
    costPrice:   65,
    images:      ['https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600'],
    status:      'available',
  },
];

// ─── Users ────────────────────────────────────────────────────────────────────

const users = [
  {
    email:    'admin@revibe.co.za',
    password: 'ReVibe@Admin2026',
    name:     'ReVibe Admin',
    role:     'admin',
    location: 'Cape Town',
  },
  {
    email:    'sipho.dlamini@gmail.com',
    password: 'ReVibe@Test2026',
    name:     'Sipho Dlamini',
    role:     'customer',
    location: 'Johannesburg',
  },
  {
    email:    'thandi.nkosi@gmail.com',
    password: 'ReVibe@Test2026',
    name:     'Thandi Nkosi',
    role:     'customer',
    location: 'Cape Town',
  },
  {
    email:    'james.pretorius@gmail.com',
    password: 'ReVibe@Test2026',
    name:     'James Pretorius',
    role:     'customer',
    location: 'Pretoria',
  },
  {
    email:    'priya.naidoo@gmail.com',
    password: 'ReVibe@Test2026',
    name:     'Priya Naidoo',
    role:     'customer',
    location: 'Durban',
  },
];

// ─── Helper Functions ─────────────────────────────────────────────────────────

// Returns a Date object set to a specific number of days ago
function daysAgo(days) {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date;
}

// ─── Seed Functions ───────────────────────────────────────────────────────────

async function seedCategories() {
  console.log('Seeding categories...');
  const results = [];

  for (const category of categories) {
    const ref = await db.collection('categories').add({
      ...category,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    results.push({ id: ref.id, ...category });
    console.log(`  ✓ ${category.name}`);
  }

  return results;
}

async function seedProducts() {
  console.log('\nSeeding products...');
  const results = [];

  for (const product of products) {
    const ref = await db.collection('products').add({
      ...product,
      sellerId:       'admin',
      sellerName:     'ReVibe SA',
      views:          Math.floor(Math.random() * 80) + 5, // random views between 5–85
      createdAt:      daysAgo(Math.floor(Math.random() * 60) + 1), // listed 1–60 days ago
      updatedAt:      new Date(),
    });
    results.push({ id: ref.id, ...product });
    console.log(`  ✓ ${product.title}`);
  }

  return results;
}

async function seedUsers() {
  console.log('\nSeeding users...');
  const results = [];

  for (const user of users) {
    let uid;

    try {
      // Try to create the Firebase Auth account
      const authUser = await auth.createUser({
        email:       user.email,
        password:    user.password,
        displayName: user.name,
      });
      uid = authUser.uid;
      console.log(`  ✓ Created auth: ${user.email}`);
    } catch (error) {
      if (error.code === 'auth/email-already-exists') {
        // User already exists in Auth — fetch their existing UID
        const existingUser = await auth.getUserByEmail(user.email);
        uid = existingUser.uid;
        console.log(`  ~ Auth exists: ${user.email} (using existing UID)`);
      } else {
        throw error;
      }
    }

    // Create or overwrite the Firestore user document
    await db.collection('users').doc(uid).set({
      email:       user.email,
      name:        user.name,
      role:        user.role,
      location:    user.location,
      sizeProfile: { top: '', bottom: '', shoe: '' },
      wishlist:    [],
      createdAt:   daysAgo(Math.floor(Math.random() * 90) + 30),
    });

    results.push({ uid, ...user });
    console.log(`  ✓ Firestore profile: ${user.name} (${user.role})`);
  }

  return results;
}

async function seedOrders(seededUsers, seededProducts) {
  console.log('\nSeeding orders...');

  // Only use customer accounts for orders (not the admin)
  const customers = seededUsers.filter(u => u.role === 'customer');

  // Grab specific products to reference in orders
  // Uses different products for each order to simulate real sales
  const orderData = [
    {
      customer:      customers[0], // Sipho
      productIndexes: [0, 2],      // Levi's 501 + Wrangler Cowboy Cut
      paymentMethod: 'card',
      daysAgoCount:  75,
    },
    {
      customer:      customers[1], // Thandi
      productIndexes: [4, 10],     // Mr Price Skinny + Lee Rider Jacket
      paymentMethod: 'paypal',
      daysAgoCount:  60,
    },
    {
      customer:      customers[2], // James
      productIndexes: [8],         // Levi's Trucker Jacket
      paymentMethod: 'card',
      daysAgoCount:  55,
    },
    {
      customer:      customers[3], // Priya
      productIndexes: [14, 20],    // Levi's Cut-Off Shorts + Mr Price Mini Skirt
      paymentMethod: 'cash_on_delivery',
      daysAgoCount:  50,
    },
    {
      customer:      customers[0], // Sipho
      productIndexes: [5],         // Diesel Larkee
      paymentMethod: 'card',
      daysAgoCount:  45,
    },
    {
      customer:      customers[1], // Thandi
      productIndexes: [6, 22],     // Cotton On Mom Jean + Levi's Dungarees
      paymentMethod: 'card',
      daysAgoCount:  40,
    },
    {
      customer:      customers[2], // James
      productIndexes: [17, 24],    // Woolworths Smart Shorts + Wrangler Shirt
      paymentMethod: 'paypal',
      daysAgoCount:  35,
    },
    {
      customer:      customers[3], // Priya
      productIndexes: [7],         // Woolworths Wide Leg
      paymentMethod: 'card',
      daysAgoCount:  30,
    },
    {
      customer:      customers[0], // Sipho
      productIndexes: [3],         // G-Star RAW 3301
      paymentMethod: 'card',
      daysAgoCount:  25,
    },
    {
      customer:      customers[1], // Thandi
      productIndexes: [21],        // Woolworths Midi Skirt
      paymentMethod: 'cash_on_delivery',
      daysAgoCount:  20,
    },
    {
      customer:      customers[2], // James
      productIndexes: [9, 13],     // Diesel Oversized Jacket + Wrangler Lined Jacket
      paymentMethod: 'card',
      daysAgoCount:  14,
    },
    {
      customer:      customers[3], // Priya
      productIndexes: [23, 25 > seededProducts.length - 1 ? 24 : 25],
      paymentMethod: 'paypal',
      daysAgoCount:  7,
    },
  ];

  for (const order of orderData) {
    const items = order.productIndexes
      .map(i => seededProducts[i])
      .filter(Boolean) // skip if index is out of range
      .map(product => ({
        productId:  product.id,
        title:      product.title,
        brand:      product.brand,
        price:      product.price,
        size:       product.size,
        image:      product.images[0],
        sellerId:   'admin',
        sellerName: 'ReVibe SA',
      }));

    if (items.length === 0) continue;

    const totalAmount = items.reduce((sum, item) => sum + item.price, 0);
    const orderDate   = daysAgo(order.daysAgoCount);

    // Create the order document
    await db.collection('orders').add({
      buyerId:       order.customer.uid,
      buyerName:     order.customer.name,
      buyerEmail:    order.customer.email,
      items,
      totalAmount,
      paymentMethod: order.paymentMethod,
      status:        'complete',
      createdAt:     orderDate,
    });

    // Mark purchased products as sold
    const batch = db.batch();
    for (const item of items) {
      const productRef = db.collection('products').doc(item.productId);
      batch.update(productRef, { status: 'sold', updatedAt: orderDate });
    }
    await batch.commit();

    console.log(`  ✓ Order for ${order.customer.name} — R${totalAmount} (${order.paymentMethod})`);
  }
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('  ReVibe SA — Database Seed Script');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  try {
    const seededCategories = await seedCategories();
    const seededProducts   = await seedProducts();
    const seededUsers      = await seedUsers();
    await seedOrders(seededUsers, seededProducts);

    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('  Seed complete!');
    console.log(`  ${seededCategories.length} categories`);
    console.log(`  ${seededProducts.length} products`);
    console.log(`  ${seededUsers.length} users`);
    console.log('  12 orders');
    console.log('\n  Admin login:');
    console.log('  Email:    admin@revibe.co.za');
    console.log('  Password: ReVibe@Admin2026');
    console.log('\n  Customer login (all 4 use same password):');
    console.log('  Password: ReVibe@Test2026');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    process.exit(0);
  } catch (error) {
    console.error('\n✗ Seed failed:', error);
    process.exit(1);
  }
}

main();
