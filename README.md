# MSL Kitchen

Premium, mobile-first ordering experience for **MSL Kitchen — Gachibowli, Hyderabad**.

## Included in this build

- Customer homepage with hero, categories, menu cards, offers, reviews, WhatsApp CTA
- 12 demo menu items with realistic Indian food imagery
- Category filters and menu search
- Persistent cart via `localStorage`
- Cart drawer with quantity controls, tax line, free delivery line and checkout CTA
- Delivery location modal with configurable free-delivery radius
- Separate `/admin` hash route with overview, order table, top-sellers, quick settings
- Delivery settings editor that changes the customer-facing radius immediately
- Responsive mobile/tablet/desktop layouts
- SEO title, description, Open Graph metadata and clean menu-friendly structure

## Run locally

Open `index.html` directly in a browser, or serve the directory with any static server:

```bash
python3 -m http.server 4173
```

Then visit `http://localhost:4173` and `http://localhost:4173/#admin`.

## Production architecture path

This visual build is intentionally dependency-free so it can be previewed immediately. For production, keep the current UI and replace the local state layer with:

- Next.js + TypeScript app routes
- PostgreSQL + Prisma using restaurant, kitchen, category, food item, variant, addon, order, payment, coupon, review, delivery zone, notification and blog models
- OTP auth + role-protected admin sessions
- Razorpay order creation + server-side signature verification
- Google Maps geocoding/distance matrix
- S3/Cloudinary image storage
- Webhooks + notifications for order status
- Redis rate limiting and cache

The current free-delivery radius is read from `state.delivery` and edited through the admin UI; it is not hardcoded into the checkout markup.


## Backend

The repository now includes Vercel serverless API routes under `/api` for health, menu, settings, and order creation. They connect to the MSL Kitchen Supabase project using server-only environment variables.
