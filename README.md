# Little Arrows Nanny Care: stephaniemeninga.com

Static one-page site for Stephanie Meninga's Christian nanny business in the Treasure Valley, Idaho.
Plain HTML/CSS with a little vanilla JS. **No build step.** Ready for **Cloudflare Pages** (static assets + one Pages Function for the contact form).

> Status: a **demo** is live on GitHub Pages: https://lasermantics.github.io/little-arrows-nanny-care/
> Cloudflare Pages and the stephaniemeninga.com domain are **not set up yet** (instructions below).
>
> **To change a photo:** see [`photos/README.md`](photos/README.md). Upload a new file with the same name into `photos/` and you're done.

## Structure

```
(repo root = the website)
├── index.html                 # the whole site (hero, verse, about, quals, services, values, rates, policies, testimonials placeholder, contact)
├── thanks.html                # no-JS fallback after form submit (Cloudflare)
├── 404.html                   # served automatically for unknown paths
├── photos/                    # ← ALL site photos, one plain JPEG each (see photos/README.md)
│   ├── hero-desktop.jpg  hero-mobile.jpg  about.jpg  extras.jpg
│   ├── home.jpg  policies.jpg  contact.jpg  share-image.jpg
│   └── README.md              # which photo goes where + how to replace on GitHub
├── robots.txt  sitemap.xml  site.webmanifest  favicon.ico  .nojekyll
├── _headers                   # Cloudflare Pages security + cache headers (ignored by GitHub Pages)
├── assets/
│   ├── css/styles.css         # PHOTO FOCAL POINTS block at the top
│   ├── js/config.js           # ← ONE place for the contact email (placeholder for now)
│   ├── js/main.js             # nav, form submit, fills email from config
│   ├── fonts/                 # self-hosted, subset WOFF2 (Cormorant Garamond, Mulish, Pinyon Script; SIL Open Font License)
│   └── brand/                 # logo-horizontal(.svg/-light.svg), logo-stacked.svg, mark.svg, favicon.svg, icon-*.png
└── functions/
    └── api/contact.js         # Cloudflare Pages Function → POST /api/contact
```

All paths in the HTML and CSS are **relative**, so the same files work both at a domain root (Cloudflare, stephaniemeninga.com)
and in a sub-folder (the GitHub Pages demo at `/little-arrows-nanny-care/`). There is no build step and nothing to regenerate.

## Preview locally

```bash
python3 -m http.server 8787      # then open http://127.0.0.1:8787 (the form shows the "preview" note)
npx wrangler pages dev .         # or: run the real Pages Function locally
```

## GitHub Pages demo (current)

GitHub Pages serves this repo from the `main` branch root. It is static hosting only, so **the contact form can't send from the demo**.
On `*.github.io` the form shows a friendly note ("This is a preview… please email Stephanie at …") instead of an error.
Once the site moves to Cloudflare Pages, the form works automatically through `functions/api/contact.js`.
After moving to Cloudflare, you can turn off GitHub Pages (Settings → Pages) and make the repo private if you want.

## Deploy to Cloudflare Pages from GitHub

1. The repo already exists: `LaserMantics/little-arrows-nanny-care` (the repo root is the site).
2. Cloudflare dashboard → **Workers & Pages → Create → Pages → Connect to Git** → choose the repo.
3. Build settings:
   - Framework preset: **None**
   - Build command: *(leave empty)*
   - Build output directory: **`/`**
   - Root directory: `/`
4. Deploy. Cloudflare picks up `functions/` automatically, so `/api/contact` goes live along with the site.
   You get a `*.pages.dev` preview URL. Every push to the main branch redeploys, and other branches get preview URLs.

### Custom domain: stephaniemeninga.com

1. Easiest path: add `stephaniemeninga.com` as a site in Cloudflare (Add a domain) and switch the registrar's nameservers to the two Cloudflare gives you.
   (You can also transfer the domain to Cloudflare Registrar.)
2. Pages project → **Custom domains → Set up a custom domain** → `stephaniemeninga.com`, then add `www.stephaniemeninga.com` too.
   Cloudflare creates the DNS records and the SSL certificate.
3. Redirect `www` → apex: Rules → **Redirect Rules** → "Redirect from WWW to root" template (301).
4. After launch: submit `https://stephaniemeninga.com/sitemap.xml` in Google Search Console, and create a Google Business Profile
   as a **service-area business** (hide the address and list Boise, Meridian, Eagle, Nampa and Caldwell).

## Email & contact form

The form posts to `/api/contact` (`functions/api/contact.js`). It validates input, drops bot submissions via a hidden honeypot field,
and returns JSON (or redirects to `/thanks.html` when JS is off). **Until email is configured (no `RESEND_API_KEY`), nothing is sent or stored:** visitors see a friendly “the form isn’t connected yet, please email Stephanie at …” message instead of an error.
Finish the setup below **before** sharing the site.

1. **Set the real inbox:** edit `assets/js/config.js` → `contactEmail` (currently the placeholder `hello@stephaniemeninga.com`).
   That one value feeds both the page (the "Prefer email?" link) and the function (the recipient).
   *Option for `hello@` on your own domain:* Cloudflare **Email Routing** (free) forwards `hello@stephaniemeninga.com` to a personal Gmail.
2. **Pick a sending service.** The function already has a ready **Resend** integration:
   - Create a free account at resend.com and add/verify the domain `stephaniemeninga.com` (it gives you DNS records to add in Cloudflare: SPF/DKIM).
   - Pages project → **Settings → Variables and Secrets** → add a **secret** `RESEND_API_KEY`.
   - Optional variable `CONTACT_FROM`, e.g. `Little Arrows Website <website@stephaniemeninga.com>` (must be on the verified domain).
   - Redeploy. Inquiries arrive as plain-text email with **Reply-To set to the parent**, so you can just hit Reply.
   - Another provider (Postmark, SendGrid, Mailgun, or Cloudflare's `send_email` binding) only means swapping the body of `sendInquiryEmail()`.
     The comment block marked `EMAIL HOOKUP GOES HERE` shows where.
3. **Test:** submit the form on the `pages.dev` URL. Check Pages → Functions → real-time logs if nothing arrives.
4. *(Optional, if spam shows up)* add Cloudflare **Turnstile** to the form and verify the token in the function.

Privacy: the page promises inquiry data is used only to reply and is never shared or sold. The function stores nothing and does not log names or emails.

## Content notes / to-dos

- **Testimonials:** the "Kind words from families" block is a placeholder. Replace the `<p>` in `.testimonials` with 2–3 short quotes
  (first name + city only, with each family's permission).
- **Photos:** none of the current photos show Stephanie with children. Swap in photos with signed parental releases when available (see `photos/README.md`).
- **Verse:** the Psalm 127:3–4 quote is from the ESV, and the attribution "(ESV)" is required by its quotation policy.
- Update `<lastmod>` in `sitemap.xml` when content changes.
- Do not add a home address, license claims, or children's names.

## Tech notes

- Performance: self-hosted subset fonts (about 180 KB total, `font-display: swap`); the hero is preloaded with `fetchpriority=high`;
  all other photos are single, well-compressed JPEGs, lazy-loaded; no frameworks or third-party requests.
- SEO: title/description, canonical, Open Graph/Twitter card, `ChildCare` (LocalBusiness) JSON-LD with `areaServed` cities only (no street address), sitemap, robots.
- Accessibility: semantic landmarks, skip link, labeled form fields, alt text on every photo, AA contrast for text, visible focus, and reduced-motion support.
- `_headers` sets a strict CSP (self only). If you later add Turnstile or analytics, allow their domains there.
