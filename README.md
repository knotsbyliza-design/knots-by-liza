# Knots by Liza — Online Store

A complete, handmade-crochet e-commerce website built as a **static frontend-only site**
(no backend, no database, no payment gateway) so it can be deployed for free on
Netlify, Vercel, or GitHub Pages and edited without needing to run any build tools.

---

## A quick note on how this was built

You asked for a React/Vite project. I built this instead as **plain HTML, CSS and
JavaScript** (using native browser ES modules), organized into the same
`components / pages / data / services / utils / config` structure you asked for.

Why: this project needed to run and be verified without a build step available in
the environment I built it in, and a no-build site is also simpler for you to
maintain day-to-day — there's no `npm install`, no compiling, no dependency
upgrades to worry about. You can open `index.html` directly or drag the whole
folder into Netlify and it just works.

If you'd genuinely prefer a React/Vite version later, that's a reasonable ask —
just know it will need Node.js and `npm install` locally to run and build.

---

## Folder structure

```
knots-by-liza/
├── index.html                Home page
├── shop.html                 Shop / catalogue page
├── product.html               Product detail page (?id=...)
├── cart.html                 Shopping cart
├── checkout.html             Checkout form
├── order-confirmation.html   Post-order confirmation screen
├── about.html
├── contact.html
├── admin/
│   ├── index.html            Admin dashboard
│   ├── products.html         Product management (CRUD)
│   └── orders.html           Local order management
└── assets/
    ├── css/styles.css        The entire design system & styles
    └── js/
        ├── config.js         ★ Central settings — edit this file first
        ├── data/
        │   ├── categories.js       Editable category list
        │   └── sampleProducts.js   Demo products (seeded once, then replaceable)
        ├── services/          localStorage-backed "database" layer
        ├── utils/              currency, WhatsApp link builder, order numbers
        ├── components/         navbar, footer, product card, toast, admin sidebar
        └── pages/               one file per page, wires up each HTML page
```

---

## 1. How to add a product

Open **`/admin/products.html`** in your browser (see password note below), click
**“+ Add Product”**, fill in the form (name, SKU, category, price, stock,
description, images, optional colour/size variations, featured/new flags), and
click **Add Product**. It's saved to your browser's local storage immediately and
will appear on the Shop page.

## 2. How to edit a product

In `/admin/products.html`, click **Edit** on any row, change the fields, and save.

## 3. How to change a price

Same as editing — open the product in `/admin/products.html` and update the
**Price** field.

## 4. How to update stock

In `/admin/products.html`, edit the product and change **Stock Quantity**, or use
the quick **“Mark Sold Out” / “Restock”** button in the product row.

## 5. How to change the WhatsApp number

Open `assets/js/config.js` and edit:

```js
BUSINESS_WHATSAPP_NUMBER: "923001234567",
```

Use the full number with country code, digits only (no `+`, spaces or dashes).
This is the **only** place the number is set — every WhatsApp link across the
site (order messages, contact page, custom order button) reads from here.

## 6. How to change the Instagram link

Also in `assets/js/config.js`:

```js
INSTAGRAM_USERNAME: "knots__by__liza",
INSTAGRAM_URL: "https://instagram.com/knots__by__liza",
```

## 7. How to change the delivery fee

In `assets/js/config.js`:

```js
DELIVERY_FEE: 250,
FREE_DELIVERY_THRESHOLD: 5000, // orders at or above this subtotal get free delivery; set to 0 to disable
```

## 8. How to replace product images

Two ways:

- **Through the admin panel (easiest):** edit a product in `/admin/products.html`
  and use the **Product Images** upload field to choose photos from your device.
  They're converted and stored directly with the product — no separate hosting
  needed.
- **By editing code:** open `assets/js/data/sampleProducts.js` and replace an
  `images: [...]` array with paths to your own image files placed in
  `assets/images/products/`.

The sample products currently use simple generated lavender placeholder
graphics (no stock photos are used anywhere) — swap these out for your real
product photography whenever you're ready.

## 9. How to deploy the website

No build step is required. Pick any of these:

- **Netlify:** Go to [netlify.com](https://www.netlify.com), drag the whole
  `knots-by-liza` folder onto the "Deploy manually" area of your dashboard. Done.
- **Vercel:** Create a new project, choose "Other" framework preset (no build
  command), and set the output directory to the project root.
- **GitHub Pages:** Push this folder to a GitHub repository, then enable Pages
  in the repo settings pointing at the root of the `main` branch.

## 10. Limitations of a no-backend website (please read)

This site was intentionally built without a server, so:

- **No real database.** All products and orders are stored in your browser's
  `localStorage`, not in the cloud.
- **Clearing browser data removes everything** — inventory changes and local
  order history will be lost if you clear your browsing data on that device.
- **No cross-device sync.** If you manage products on your laptop, those
  changes won't appear on your phone or another computer automatically.
- **No secure admin login.** The `/admin` password in `config.js`
  (`ADMIN_PASSWORD`) is a convenience gate only — it ships in a JavaScript file
  that any visitor's browser downloads, so it can be bypassed by anyone who
  opens developer tools. Don't rely on it to protect sensitive information.
- **No automatic payment verification.** Online payment orders only send a
  WhatsApp message asking the customer to arrange payment with you directly —
  no money moves automatically and nothing is verified by the website.
- **Orders rely on WhatsApp.** When a customer places an order, their order
  details open in WhatsApp for them to send to your business number. If they
  don't send it, you won't otherwise be notified — the order is only saved in
  their own browser's local order history, and in your admin's local order
  history *if it's the same browser and device*.
- **Order numbers are locally generated** (e.g. `KBL-20260906-001`), not
  guaranteed-unique IDs from a central database.

## Future: adding a real backend

The project is structured so this is possible without rebuilding the whole
frontend. All reads/writes to local storage go through a single file,
`assets/js/services/storage.js`. If you later want to move to Firebase,
Supabase, or your own API, a developer can rewrite the functions in that file
(and the thin service files that call it) to talk to a real backend instead —
nothing in the pages or components would need to change.

## Admin access

- URL: `/admin/index.html` (or use the "Admin" link isn't in the public nav on
  purpose — it's a hidden route, as requested)
- Default password: `liza-admin-2026` — change this in `assets/js/config.js`
  (`ADMIN_PASSWORD`) before sharing the site publicly.

## Currency

All prices are shown in Pakistani Rupees (PKR), formatted like `Rs. 1,500`, set
in `assets/js/config.js` (`CURRENCY_SYMBOL`, `CURRENCY_CODE`).
