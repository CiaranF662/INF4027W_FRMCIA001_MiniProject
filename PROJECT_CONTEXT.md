# ReVibe SA — Project Context & Development Guide

## For Claude Code: Read this document fully before writing any code. This is the single source of truth for the project.

> **⚠️ CRITICAL: We have 11 days (deadline: 2 March 2026). Build in the order specified in Section 11. If a phase is taking too long, move on. A working core is better than unfinished extras. The C2C seller features (Phase 3) are OPTIONAL — skip them if Phases 1, 2, and 4 aren't solid. If C2C is dropped, the platform becomes a curated second-hand denim store run by the admin.**

---

## 1. PROJECT OVERVIEW

### What We're Building
ReVibe SA is a **second-hand fashion marketplace** for South Africa — think Vinted/Depop but localised for SA, with AI-powered product discovery that no existing thrift platform offers.

**If C2C is included:** Peer-to-peer marketplace where customers can buy AND sell (like Vinted). The admin manages the platform.
**If C2C is dropped (fallback):** A curated second-hand denim store where the admin lists all products. Customers browse and buy only.

This is a university mini project (INF4027W at UCT). The project will be graded on a rubric with 14 criteria worth 4 marks each (56 total). The project spec and marksheet are attached separately — always refer to them for requirements.

### The Business Concept
There is no localised Vinted, Depop, or Poshmark in South Africa. Yaga exists but lacks AI-powered discovery. ReVibe fills this gap by combining the proven thrift marketplace model with:
- **AI natural language search** — "find me a warm jacket, size M, under R200, streetwear style"
- **AI image search** — upload a screenshot from Instagram or a photo of clothing to find similar items
- **AI-generated listings** (bonus, only if time) — seller uploads a photo, AI auto-fills description

### Key Constraints from the Brief
- 20-30 items in the database (seed data)
- Items are always in stock (no inventory management)
- Payment is simulated (select payment type + confirm — no real payment processing)
- No delivery system — order goes from "pending" to "complete" immediately
- No comments/ratings on products required
- Must use a **NoSQL database**
- Must be **deployed** to a live server
- Must look professional (use a template or design system)

---

## 2. TECH STACK

**This is a single-codebase project. The frontend AND backend live in ONE Next.js project. There is no separate backend server.**

### Language
- **JavaScript** (plain JS, NOT TypeScript — to save time and reduce debugging)
- All files use `.js` and `.jsx` extensions

### Framework
- **Next.js** (React framework with built-in API routes)
- App Router (the `app/` directory structure)
- API routes live in `app/api/` — these are real server-side endpoints, not client code

### Styling
- **Tailwind CSS** for utility-first styling
- **shadcn/ui** component library (buttons, forms, dialogs, tables, cards, etc.)
- **Lucide React** for icons

### Charts
- **Recharts** for admin dashboard charts/graphs

### Database
- **Firebase Firestore** (NoSQL, cloud-hosted — ticks the "online database" rubric requirement)
- **Firebase Storage** for product images uploaded by sellers (if C2C) or admin

### Authentication
- **Firebase Authentication** for sign-up/login (email + password)
- Firestore `role` field on user document for role-based access ("customer" or "admin")

### AI Services
- **OpenAI API** (GPT-4o-mini for text search, GPT-4o for vision/image search)
- Called from Next.js API routes (server-side, so API key is never exposed to the browser)
- Alternative: Google Gemini API if OpenAI is unavailable

### Deployment
- **Vercel** (free tier) — deploys BOTH the frontend and API routes in one click
- **Firebase** (free Spark plan) — database, auth, and file storage

### Why This Stack?
- **One language (JavaScript)** — no context-switching between Python and JS
- **One project** — no CORS issues, no two servers to configure and deploy
- **One deployment** — Vercel handles everything, deploy with `vercel` command
- **Firebase free tier** — handles auth, database, and storage without a credit card
- **shadcn/ui** — professional-looking components with minimal effort
- **Next.js API routes** — proper server-side endpoints, but inside the same project

---

## 3. ROLES & PERMISSIONS

There are exactly 3 roles as required by the brief:

### Guest (not authenticated)
**Can:**
- Browse all product listings
- View individual product pages with full details
- View seller shop pages (if C2C is implemented)
- Search products using text filters (category, size, brand, price, condition, colour)
- Use AI natural language search
- Use AI image upload search
- Add items to cart (stored in browser localStorage)
- View cart and edit cart contents

**Cannot:**
- Checkout (redirected to login/signup when attempting)
- Access wishlist, order history, or any account features
- List items for sale

**Important UX rule from the brief:** "Guests are only required to sign up when they want to check out. They may still add items to cart, edit their cart or keep on shopping while their progress is saved in the browser."

### Customer (authenticated, role: "customer")
Everything a Guest can do, PLUS:

**As a Buyer:**
- Checkout — select payment type (Card / PayPal / Cash on Delivery), confirm order
- View order history with statuses
- Maintain a wishlist (save/remove items)
- Have a user profile (name, email, location, size preferences)
- On sign-up/login, localStorage cart merges into their account

**As a Seller (OPTIONAL — only if C2C is implemented):**
- Set up "My Shop" — shop name, shop description, profile image
- Add listings — upload photos, fill in product details
- Edit/delete their own listings
- View "My Listings" and "My Sales" dashboards

**Cannot:**
- Edit or delete other sellers' listings
- Access admin dashboard, reports, or user management

### Admin (authenticated, role: "admin")
Everything a Customer can do, PLUS:

**Product Management:**
- View ALL listings (from all sellers if C2C, or all platform products if not)
- Edit any listing
- Delete any listing
- Add products directly
- Manage product categories (add, edit, delete categories)

**Order Management:**
- View all orders across the platform
- Filter orders by status, date range, customer
- View order details

**User Management:**
- View all registered users

**Reporting Dashboard (3 required reports):**

1. **Financial Report:**
   - Total revenue over time (line chart)
   - Revenue by product category (bar chart)
   - Average order value
   - Revenue by payment method (pie chart)

2. **Product Report:**
   - Best-selling categories and brands
   - Most viewed items
   - Condition breakdown (what quality sells best)
   - Most popular sizes

3. **Customer Report:**
   - Total customers
   - Top buyers (by spend)
   - Customer locations
   - New vs returning customers over time

---

## 4. DATABASE SCHEMA (Firestore)

### Collection: `products`
```
{
  id: string (auto-generated),
  title: string,                    // "Vintage Levi's 501 Jeans"
  description: string,              // Detailed description
  category: string,                 // "Bottoms", "Tops", "Shoes", "Outerwear", "Accessories", "Dresses"
  brand: string,                    // "Levi's", "Nike", "Zara", "Unbranded", etc.
  size: string,                     // "XS", "S", "M", "L", "XL", "28", "30", "32", etc.
  condition: string,                // "New with Tags", "Like New", "Good", "Fair"
  colour: string,                   // "Blue", "Black", "Red", "Multicolour", etc.
  gender: string,                   // "Men", "Women", "Unisex"
  style: string,                    // "Vintage", "Streetwear", "Formal", "Casual", "Boho", "Athleisure"
  tags: array of strings,           // ["denim", "90s", "retro", "oversized"]
  price: number,                    // Selling price in Rands (e.g., 180)
  originalPrice: number,            // Original retail price (e.g., 650) — for "X% off" display
  images: array of strings,         // URLs to product images
  sellerId: string,                 // User ID of the seller (or "admin" if platform-listed)
  sellerName: string,               // Denormalized for display: "Thandi's Closet" or "ReVibe SA"
  sellerLocation: string,           // "Woodstock, Cape Town"
  views: number,                    // Track views for product report
  status: string,                   // "available", "sold", "removed"
  createdAt: timestamp,
  updatedAt: timestamp
}
```

### Collection: `users`
```
{
  id: string (Firebase Auth UID),
  email: string,
  name: string,
  role: string,                     // "customer" or "admin"
  location: string,                 // "Cape Town", "Johannesburg", etc.
  sizeProfile: {                    // Optional
    top: string,
    bottom: string,
    shoe: string
  },
  shopName: string,                 // Only used if C2C is implemented
  shopDescription: string,
  shopImage: string,
  wishlist: array of strings,       // Array of product IDs
  createdAt: timestamp
}
```

### Collection: `orders`
```
{
  id: string (auto-generated),
  buyerId: string,
  buyerName: string,
  buyerEmail: string,
  items: [
    {
      productId: string,
      title: string,
      price: number,
      size: string,
      image: string,
      sellerId: string,
      sellerName: string
    }
  ],
  totalAmount: number,
  paymentMethod: string,            // "card", "paypal", "cash_on_delivery"
  status: string,                   // "pending" -> "complete" (immediate)
  createdAt: timestamp
}
```

### Collection: `categories`
```
{
  id: string,
  name: string,                     // "Tops", "Bottoms", "Shoes", etc.
  description: string
}
```

---

## 5. KEY FEATURES — DETAILED SPECIFICATIONS

### 5.1 Homepage
The homepage must have 3 key elements as specified in the brief:

1. **AI Search Bar (prominent, centre of hero section)**
   - Large text input: "Describe what you're looking for..."
   - Example placeholder: "I need a warm winter jacket, size M, under R200"
   - Submit sends query to `/api/search/ai`
   - Results page shows products ranked by relevance with AI explanation

2. **Image Upload Search**
   - Button/dropzone: "Upload a photo to find similar items"
   - Sends image to `/api/search/image`
   - Returns similar items

3. **Product Browsing**
   - Featured items section
   - Categories displayed as browsable grid
   - "Just Listed" (newest items)
   - "Best Deals" (highest discount from original price)

### 5.2 Product Listing Page (Browse/Search Results)
- Grid of product cards (responsive: 2 cols mobile, 3-4 cols desktop)
- Each card: primary image, title, brand, size, condition badge, price, original price with % off, seller name, wishlist heart
- Filter sidebar: category, size, brand, condition, colour, gender, price range, style
- Sort by: newest, price low-high, price high-low, biggest discount

### 5.3 Product Detail Page
- Image gallery (multiple photos)
- Full description and all attributes
- Condition badge with explanation
- "Add to Cart" button (primary CTA)
- "Add to Wishlist" heart button
- Seller info card (if C2C)
- Price with savings percentage
- Tags as clickable chips

### 5.4 Cart
- List of items with image, title, size, price
- Remove item button
- Cart total
- "Continue Shopping" and "Proceed to Checkout" buttons
- Guests: stored in localStorage, persists across sessions
- **Critical:** When a guest logs in or signs up, their localStorage cart must transfer seamlessly

### 5.5 Checkout
- Order summary (items, totals)
- Payment method selection: Card / PayPal / Cash on Delivery (simulated only)
- Confirm order button
- On confirmation: order created in Firestore with status "complete"
- Each purchased product's status changes to "sold"
- Redirect to order confirmation page
- Guest must sign up or log in before completing checkout

### 5.6 Customer Dashboard ("My Account")
- **Profile:** Edit name, location, size preferences
- **My Orders:** List of past orders with date, items, total, status
- **My Wishlist:** Grid of saved items

**If C2C is implemented, also add:**
- **My Shop:** Setup/edit shop name, description, image
- **My Listings:** Grid of items listed with status, edit/delete actions
- **Add Listing:** Product creation form
- **My Sales:** Orders containing items they sold

### 5.7 Admin Dashboard
- **Overview:** Key metrics (total users, total listings, total orders, total revenue)
- **Products:** Table of ALL products, with search/filter, edit/delete
- **Categories:** CRUD for product categories
- **Orders:** Table of all orders, filterable by status, date, customer
- **Users:** Table of all users
- **Reports:** 3 sub-pages with Recharts charts (Financial, Product, Customer)

### 5.8 Authentication
- Sign Up: email, password, name, location
- Login: email, password
- Protected routes: checkout, customer dashboard, admin dashboard
- Role-based access: admin routes only accessible to role="admin"
- Firebase Auth handles the actual auth; Firestore stores additional user data

---

## 6. AI FEATURES — IMPLEMENTATION DETAILS

### 6.1 Natural Language Product Search
**API Route:** `app/api/search/ai/route.js`
**Input:** `{ "query": "I need a festival outfit under R400, size S, bold colours" }`
**Process:**
1. Fetch all available products from Firestore
2. Construct a prompt for OpenAI:
   - System prompt: "You are a fashion shopping assistant for a South African thrift marketplace. Given a customer's request and a catalog of available second-hand items, return the most relevant products ranked by match quality. For each item, explain briefly why it matches. Return as JSON."
   - User prompt: The customer's query + product catalog as JSON (only key fields: id, title, brand, size, condition, colour, style, price, tags, gender)
3. Parse the AI response to get ranked product IDs with explanations
4. Return the ranked products to the frontend

**With 20-30 items this easily fits in OpenAI's context window.**

### 6.2 Image Upload Search
**API Route:** `app/api/search/image/route.js`
**Input:** Uploaded image file (as base64 or form data)
**Process:**
1. Send the image to OpenAI Vision API (GPT-4o)
2. Prompt: "Describe this clothing item in detail: type of garment, colour, pattern, style, approximate era/aesthetic, material if visible. Be specific."
3. Use the AI's description to rank products (via another AI call to match against catalog)
4. Return matched products ranked by similarity

### 6.3 AI-Generated Listings (BONUS — only if time permits)
**API Route:** `app/api/listings/ai-generate/route.js`
**Input:** Uploaded image of clothing item
**Process:**
1. Send image to Vision API
2. Prompt: "Based on this image, generate: title, description, category, tags, brand (if identifiable), suggested price in ZAR. Return as JSON."
3. Pre-fill the listing form with AI-generated data
4. Seller reviews and publishes

---

## 7. API ROUTES (Next.js API Routes)

All API routes live in `app/api/` and run server-side. They are NOT client code.

### Auth
- `POST /api/auth/verify` — verify Firebase token, return user data + role

### Products
- `GET /api/products` — list products (with query params for filtering)
- `GET /api/products/[id]` — get single product
- `POST /api/products` — create listing (authenticated)
- `PUT /api/products/[id]` — update listing (owner or admin)
- `DELETE /api/products/[id]` — delete listing (owner or admin)
- `POST /api/products/[id]/view` — increment view count

### Categories
- `GET /api/categories` — list all categories
- `POST /api/categories` — create category (admin only)
- `PUT /api/categories/[id]` — update category (admin only)
- `DELETE /api/categories/[id]` — delete category (admin only)

### Orders
- `GET /api/orders` — get orders (admin: all; customer: their own)
- `GET /api/orders/[id]` — get single order
- `POST /api/orders` — create order (authenticated)

### Users
- `GET /api/users/me` — get current user profile
- `PUT /api/users/me` — update profile
- `GET /api/users` — list all users (admin only)

### AI Search
- `POST /api/search/ai` — natural language product search
- `POST /api/search/image` — image upload product search

### Wishlist
- `POST /api/wishlist/[productId]` — add to wishlist
- `DELETE /api/wishlist/[productId]` — remove from wishlist
- `GET /api/wishlist` — get user's wishlist items

### Reports (admin only)
- `GET /api/reports/financial` — aggregated financial data
- `GET /api/reports/products` — aggregated product data
- `GET /api/reports/customers` — aggregated customer data

---

## 8. PROJECT STRUCTURE

**Everything is in ONE Next.js project. No separate backend folder.**

```
revibe-sa/
├── src/
│   ├── app/                         # Next.js App Router
│   │   ├── page.jsx                 # Homepage
│   │   ├── layout.jsx               # Root layout (navbar, footer, auth provider)
│   │   ├── products/
│   │   │   ├── page.jsx             # Product listing / browse page
│   │   │   └── [id]/
│   │   │       └── page.jsx         # Product detail page
│   │   ├── cart/
│   │   │   └── page.jsx             # Cart page
│   │   ├── checkout/
│   │   │   └── page.jsx             # Checkout page
│   │   ├── auth/
│   │   │   ├── login/page.jsx       # Login page
│   │   │   └── signup/page.jsx      # Signup page
│   │   ├── account/                 # Customer dashboard (protected)
│   │   │   ├── page.jsx             # Dashboard overview
│   │   │   ├── orders/page.jsx      # My Orders
│   │   │   ├── wishlist/page.jsx    # My Wishlist
│   │   │   ├── profile/page.jsx     # Edit Profile
│   │   │   ├── shop/page.jsx        # My Shop (C2C only)
│   │   │   ├── listings/page.jsx    # My Listings (C2C only)
│   │   │   ├── listings/new/page.jsx # Add Listing (C2C only)
│   │   │   └── sales/page.jsx       # My Sales (C2C only)
│   │   ├── shop/[id]/
│   │   │   └── page.jsx             # Public seller shop page (C2C only)
│   │   ├── admin/                   # Admin dashboard (protected, admin only)
│   │   │   ├── page.jsx             # Admin overview
│   │   │   ├── products/page.jsx    # Manage all products
│   │   │   ├── products/new/page.jsx # Add product (admin)
│   │   │   ├── products/[id]/edit/page.jsx # Edit product
│   │   │   ├── categories/page.jsx  # Manage categories
│   │   │   ├── orders/page.jsx      # View all orders
│   │   │   ├── users/page.jsx       # View all users
│   │   │   └── reports/
│   │   │       ├── financial/page.jsx
│   │   │       ├── products/page.jsx
│   │   │       └── customers/page.jsx
│   │   └── api/                     # API Routes (server-side)
│   │       ├── auth/
│   │       │   └── verify/route.js
│   │       ├── products/
│   │       │   ├── route.js         # GET (list) + POST (create)
│   │       │   └── [id]/
│   │       │       ├── route.js     # GET (single) + PUT (update) + DELETE
│   │       │       └── view/route.js # POST (increment views)
│   │       ├── categories/
│   │       │   ├── route.js         # GET + POST
│   │       │   └── [id]/route.js    # PUT + DELETE
│   │       ├── orders/
│   │       │   ├── route.js         # GET + POST
│   │       │   └── [id]/route.js    # GET single
│   │       ├── users/
│   │       │   ├── me/route.js      # GET + PUT current user
│   │       │   └── route.js         # GET all users (admin)
│   │       ├── search/
│   │       │   ├── ai/route.js      # POST - AI text search
│   │       │   └── image/route.js   # POST - AI image search
│   │       ├── wishlist/
│   │       │   ├── route.js         # GET wishlist
│   │       │   └── [productId]/route.js # POST + DELETE
│   │       └── reports/
│   │           ├── financial/route.js
│   │           ├── products/route.js
│   │           └── customers/route.js
│   ├── components/                  # Reusable React components
│   │   ├── ui/                      # shadcn/ui components (auto-generated)
│   │   ├── Navbar.jsx
│   │   ├── Footer.jsx
│   │   ├── ProductCard.jsx
│   │   ├── ProductGrid.jsx
│   │   ├── FilterSidebar.jsx
│   │   ├── SearchBar.jsx
│   │   ├── AiSearchBar.jsx
│   │   ├── ImageSearchUpload.jsx
│   │   ├── CartItem.jsx
│   │   ├── ProductForm.jsx          # Shared form for add/edit product
│   │   └── ProtectedRoute.jsx       # Auth guard wrapper
│   ├── lib/                         # Utilities and configuration
│   │   ├── firebase.js              # Firebase client SDK init (client-side)
│   │   ├── firebaseAdmin.js         # Firebase Admin SDK init (server-side, API routes only)
│   │   ├── auth-context.jsx         # React auth context/provider
│   │   ├── auth-helpers.js          # verifyAuth() helper for API routes
│   │   ├── cart.js                  # Cart logic (localStorage + sync on login)
│   │   └── utils.js                 # Helper functions (format price, calculate discount, etc.)
│   └── services/                    # Business logic layer (used by API routes)
│       ├── productService.js        # Firestore CRUD for products
│       ├── orderService.js          # Firestore CRUD for orders
│       ├── userService.js           # Firestore CRUD for users
│       ├── categoryService.js       # Firestore CRUD for categories
│       ├── aiService.js             # OpenAI API calls
│       └── reportService.js         # Aggregate data for reports
├── scripts/
│   └── seed.js                      # Seed script to populate Firestore
├── public/                          # Static assets
├── .env.local                       # Environment variables (Firebase keys, OpenAI key)
├── next.config.js
├── tailwind.config.js
├── jsconfig.json                    # Path aliases (@/components, @/lib, etc.)
├── package.json
└── README.md
```

### Architecture: Layered Separation

Even though it's one project, the code follows a clear **layered architecture**:

```
Frontend (React pages/components)
    ↓ fetch("/api/...")
API Routes (app/api/ — server-side request handlers)
    ↓ calls service methods
Services (src/services/ — business logic + Firestore operations)
    ↓ reads/writes
Firebase Firestore (cloud database)
```

**This is important for the rubric.** API route files handle HTTP (parse request, send response). Service files handle business logic and database operations. React components handle the UI. Clean separation = good marks for Coding Structure.

---

## 9. SEED DATA

Create a seed script (`scripts/seed.js`) that uses the Firebase Admin SDK to populate Firestore with:

- **7 categories:** Tops, Bottoms, Outerwear, Shoes, Accessories, Dresses, Activewear
- **25 realistic thrift products** with:
  - Real-sounding titles and descriptions for SA thrift market
  - Mix of brands (Levi's, Nike, Zara, H&M, Woolworths, Mr Price, Adidas, Converse, Cotton On, Unbranded)
  - Mix of sizes (XS through XL, numeric sizes for bottoms/shoes)
  - Mix of conditions (New with Tags, Like New, Good, Fair)
  - Mix of categories, colours, styles, genders
  - Realistic SA prices (R50 — R800, with original prices 50-80% higher)
  - Placeholder image URLs (use picsum.photos or unsplash URLs initially)
  - Distributed across sellers (admin account + 3-4 customer seller accounts)
- **5 test user accounts:**
  - 1 admin (email: admin@revibe.co.za)
  - 4 customers (with shop names if C2C is implemented)
- **10-15 sample orders** for report data (spread across different dates, customers, payment methods)

---

## 10. CODING STANDARDS & RUBRIC PRIORITIES

### Database Layer (4 marks)
- ALL Firestore operations must be in the `services/` layer, NEVER in API route files directly
- API routes call service functions; service functions call Firestore
- Firebase config is centralized in `lib/firebaseAdmin.js` (server) and `lib/firebase.js` (client)
- Database is online (Firestore is cloud-hosted — this is automatic)

### Coding Structure (4 marks)
- Follow the layered architecture: API Routes → Services → Firestore
- This is MVC: API Routes = Controllers, Services = Models/Business Logic, React = Views
- Keep files focused — one responsibility per file
- Reusable components (ProductCard used in browse page, wishlist, search results, etc.)

### OOP Concepts (4 marks)
- Service files should use **ES6 classes** with methods
- Example: `class ProductService { async getProducts() {...} async createProduct(data) {...} }`
- Use a base `FirestoreService` class that child services extend (inheritance)
- This demonstrates encapsulation, inheritance, and clear class design

### Data Validation (4 marks)
- API routes validate ALL incoming request data before processing
- Use helper validation functions (e.g., `validateProduct(data)` that checks required fields, types, ranges)
- React forms validate on the frontend too (required fields, price > 0, valid email)
- Firebase Auth tokens verified on every protected API route
- Authorization checks: customers can only edit their own listings, admin can edit any

### Security — Auth & Authorization (4 marks)
- Firebase Auth for authentication (handled client-side via Firebase SDK)
- API routes verify Firebase ID tokens using Firebase Admin SDK
- Create a reusable `verifyAuth(request)` helper that extracts and verifies the token
- Role-based checks: admin endpoints verify `role === "admin"` from user document
- Frontend route protection: ProtectedRoute component redirects unauthenticated users

### Sophistication & Complexity (4 marks)
- AI-powered natural language search with context-aware ranking
- AI image search with visual similarity matching
- Multi-attribute product model with rich filtering
- Role-based permissions with proper authorization logic
- (If C2C: multi-seller marketplace model adds significant complexity)

### AI Application (4 marks)
- Natural language search must genuinely work and return relevant, ranked results
- Image search must return visually similar items
- The AI must add real value — not be a gimmick

### User Interface (4 marks)
- Use shadcn/ui + Tailwind for a professional, consistent look
- Responsive design (mobile-first)
- Clean product cards that show key info at a glance
- Intuitive navigation between all sections

### Ease of Navigation (4 marks)
- Clear navbar with role-appropriate links
- Consistent layout across pages
- Cart icon with item count in the navbar
- Smooth guest → signup → checkout flow

---

## 11. DEVELOPMENT ORDER (PRIORITISED)

Build in this order. **Do not skip to a later phase until the current one works.**

### Phase 1: Foundation (Days 1-2)
1. Scaffold Next.js project: `npx create-next-app@latest revibe-sa` (with JavaScript, App Router, Tailwind)
2. Install shadcn/ui: `npx shadcn@latest init` then add components (button, card, input, dialog, table, select, badge, sheet, dropdown-menu, avatar, tabs, separator)
3. Install dependencies: `npm install firebase firebase-admin openai recharts lucide-react`
4. Set up Firebase project (Firestore, Auth, Storage) and get config keys
5. Create `lib/firebase.js` (client SDK) and `lib/firebaseAdmin.js` (Admin SDK for API routes)
6. Create `lib/auth-context.jsx` — React context provider for auth state
7. Create service classes in `services/` with basic Firestore CRUD
8. Create auth API route for token verification
9. Build signup and login pages with Firebase Auth
10. Run seed script to populate database with 25 products, categories, users, and sample orders

### Phase 2: Core E-Commerce (Days 3-5)
11. Homepage layout — hero section, featured items, categories grid
12. Product listing page with ProductCard components and responsive grid
13. FilterSidebar with category, size, brand, condition, price range, colour, gender
14. Sort functionality (newest, price, discount)
15. Product detail page with image gallery, all attributes, add to cart
16. Cart page — localStorage cart with add/remove/view
17. Cart transfer on login (merge localStorage cart into user session)
18. Checkout page — payment method selection + confirm button
19. Order creation in Firestore, product status → "sold"
20. Customer order history page

### Phase 3: C2C Seller Features (OPTIONAL — Days 6-7)
> **Skip this phase entirely if Phases 1-2 took longer than expected. The platform works without it.**

21. "My Shop" setup page for customers
22. "Add Listing" form (reuse ProductForm component)
23. "My Listings" page with edit/delete
24. "My Sales" page
25. Public seller shop page
26. Seller name/info on product cards

### Phase 4: Admin Dashboard (Days 7-8)
27. Admin layout with sidebar navigation
28. Admin overview page with key metrics
29. Admin products table — view/edit/delete all products
30. Admin add product page
31. Admin categories CRUD page
32. Admin orders table with filters
33. Admin users table
34. Financial report page with Recharts (revenue over time, by category, by payment method)
35. Product report page with Recharts (top categories, brands, conditions, sizes)
36. Customer report page with Recharts (top buyers, locations, new vs returning)

### Phase 5: AI Features (Day 9)
37. AI natural language search — API route + AiSearchBar component on homepage
38. AI image search — API route + ImageSearchUpload component
39. Search results page that displays AI-ranked products with explanations

### Phase 6: Polish & Deploy (Days 10-11)
40. Wishlist functionality (add/remove/view)
41. Navbar with role-appropriate links and cart badge
42. Mobile responsiveness pass on all pages
43. Deploy to Vercel (`vercel` command or connect GitHub repo)
44. Ensure Firebase security rules are set
45. Final seed data check — realistic products with good descriptions
46. README with: project description, setup instructions, admin login credentials, tech stack, features list
47. Test all 3 roles end-to-end: Guest browse → signup → buy, Customer manage account, Admin dashboard + reports

---

## 12. IMPORTANT NOTES FOR CLAUDE CODE

1. **Use plain JavaScript (.js/.jsx), NOT TypeScript.** No type annotations, no interfaces, no .ts files.

2. **Always explain what you're doing and why.** Add code comments everywhere. I need to understand every part of this project for my demo and Q&A.

3. **Follow the layered architecture strictly.** API Routes → Services → Firestore. No database calls in API route handlers. API routes import service classes and call their methods.

4. **Use ES6 classes in service files** to demonstrate OOP. Example:
   ```javascript
   // services/productService.js
   import { db } from '@/lib/firebaseAdmin';

   class ProductService {
     constructor() {
       this.collection = db.collection('products');
     }

     async getProducts(filters = {}) {
       // Build query based on filters
       // Return array of products
     }

     async getProductById(id) {
       // Get single product by ID
     }

     async createProduct(data) {
       // Validate and create product
     }
   }

   export default new ProductService();
   ```

5. **Keep the frontend component-based.** ProductCard, FilterSidebar, ProductForm, etc. should be reusable.

6. **localStorage cart for guests is critical.** The brief specifically mentions this. It must persist across browser sessions and transfer on login.

7. **Simulated payment only.** Checkout asks for payment type and a "Confirm" button. No Stripe, no PayPal. Order status goes directly to "complete".

8. **Use `@/` path aliases** for clean imports (e.g., `import ProductService from '@/services/productService'`). Configure in `jsconfig.json`.

9. **The 3 reports must have charts with clear titles.** Use Recharts (BarChart, LineChart, PieChart). Each chart should tell a story.

10. **This is a university project.** The code must be clean, well-commented, and structured so I can explain it to an examiner. Avoid over-engineering but don't cut corners on architecture.

11. **When building API routes**, use this pattern:
    ```javascript
    // app/api/products/route.js
    import { NextResponse } from 'next/server';
    import productService from '@/services/productService';
    import { verifyAuth } from '@/lib/auth-helpers';

    // GET /api/products — public, no auth needed
    export async function GET(request) {
      const { searchParams } = new URL(request.url);
      const category = searchParams.get('category');
      // ... get filters from query params
      const products = await productService.getProducts({ category });
      return NextResponse.json(products);
    }

    // POST /api/products — requires authentication
    export async function POST(request) {
      const user = await verifyAuth(request);
      if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      const data = await request.json();
      // ... validate data
      const product = await productService.createProduct({ ...data, sellerId: user.uid });
      return NextResponse.json(product, { status: 201 });
    }
    ```

12. **If we run out of time, prioritise:** Working checkout flow > Admin reports > AI search > C2C features. A complete single-seller store with reports and AI search scores higher than a broken multi-seller marketplace.
