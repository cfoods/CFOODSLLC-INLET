# Inlet Performance

The Inlet Performance storefront design: every page of the store, working in the browser with sample parts, prices,
reviews and orders. Nothing here talks to a server yet, and every page is marked "noindex".

Copied from CFOODSLLC-RNJ (`frontend/inlet/`) on Nov 7, 2026, with the same folder layout, so the pages
work the same way when `frontend/` is the web root.

## What's here

- `frontend/inlet/`: the store. `assets/` holds its stylesheet, script and icon; each other folder is one
  page (about, account, cart, checkout, collection, confirmation, contact, cua, emails, faq, home, login, military, orderview, privacy, product, prop65, refund, request, reviews, search, shipping, signup, social, terms, track, vcw, warranty).
- `frontend/brand-previews/`: the sample catalog (parts, prices, reviews) and the part drawings, shared by
  every CFOODS store design.
- `frontend/js/safari-bars.js`: keeps the header clear of Safari's tab row on iPad.
- `frontend/index.html`: sends visitors to the store's home page.

## Look at it

```
python3 -m http.server 8080 --directory frontend
```

Then open http://localhost:8080/inlet/home/ on a phone, an iPad or a computer.
