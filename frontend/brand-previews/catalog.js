/*
 * Sample catalog shared by the brand design previews (/red/, and later the other stores).
 * Every store sells the same cfoods parts at its own tier price, so one list feeds all of them:
 *   price: [cheap (RedRail, Mountain), middle (RNJ, Dark), expensive (Inlet, LR-CO)]
 * Nothing here is real stock, pricing or reviews. It exists only so the preview pages have content.
 * Each part has as many sample reviews as its review count says, so every review can be read.
 * `fits` is display text only (shown like the product title). No store has a vehicle picker or fit filter.
 */
(function () {
  'use strict';

  const categories = [
    { id: 'header', name: 'Headers', single: 'Header', art: 'header', blurb: 'Mandrel-bent stainless headers with thick laser-cut flanges.' },
    { id: 'downpipe', name: 'Downpipes', single: 'Downpipe', art: 'downpipe', blurb: '3" downpipes for turbo cars, with flex sections and O2 bungs.' },
    { id: 'test-pipe', name: 'Test Pipes', single: 'Test Pipe', art: 'testpipe', blurb: 'Straight-through test pipes and X-pipes for off-road use.' },
    { id: 'cold-air-intake', name: 'Cold Air Intakes', single: 'Intake', art: 'intake', blurb: 'Intakes with washable filters and silicone couplers.' },
    { id: 'cnc-part', name: 'CNC Parts', single: 'CNC Part', art: 'cnc', blurb: 'Flanges, spacers and machined small parts.' },
    { id: 'more-products', name: 'More Products', single: 'Part', art: 'tip', blurb: 'Tips, resonators and install kits.' },
  ];

  const SPECS = {
    header: { Material: 'T304 stainless steel', Welds: 'TIG, back-purged', Flange: '3/8" laser-cut', Finish: 'Raw brushed', 'O2 bung': 'Yes, M18 x 1.5' },
    downpipe: { Material: 'T304 stainless steel', Diameter: '3"', 'Flex section': 'Yes, braided', Finish: 'Raw brushed', 'O2 bungs': '1 x M18 x 1.5' },
    'test-pipe': { Material: 'T304 stainless steel', Finish: 'Raw brushed', Gaskets: 'Included', 'O2 bungs': 'Yes, M18 x 1.5' },
    'cold-air-intake': { Tube: 'Mandrel-bent aluminum', Filter: 'Washable cotton gauze', Couplers: 'Silicone, 4-ply', Finish: 'Polished' },
    'cnc-part': { Material: 'T304 stainless steel', Process: 'CNC machined', Finish: 'Raw' },
    'more-products': { Material: 'T304 stainless steel', Finish: 'Polished' },
  };

  // Warranty is set per product (sample periods). Remedy is replacement first.
  const WARRANTY = { header: '1 year', downpipe: '1 year', 'test-pipe': '1 year', 'cold-air-intake': '1 year', 'cnc-part': '90 days', 'more-products': '90 days' };

  const IN_BOX = {
    header: ['Header', 'Collector gasket', 'Hardware kit'],
    downpipe: ['Downpipe', 'Gaskets', 'Stainless hardware'],
    'test-pipe': ['Test pipe', 'Gaskets', 'Stainless hardware'],
    'cold-air-intake': ['Intake tube', 'Filter', 'Couplers and clamps', 'Heat shield'],
    'cnc-part': ['Part as listed'],
    'more-products': ['Part as listed'],
  };

  // id, category, art, title, engine, fits, [cheap, middle, expensive], stock, rating, reviews, flags, extra specs
  const raw = [
    ['accord-94-97-header', 'header', 'header', 'Honda Accord 1994-1997 4-1 Header', '2.2L F22B', [['Honda', 'Accord', 1994, 1997]], [100, 230, 470], 24, 4.7, 38, 'best', { 'Primary tubes': '1.75"', Collector: '4-1, 2.5" outlet' }],
    ['civic-96-00-header', 'header', 'header', 'Honda Civic 1996-2000 4-2-1 Header', '1.6L D16Y7 / D16Y8', [['Honda', 'Civic', 1996, 2000]], [95, 215, 440], 31, 4.6, 52, 'best', { 'Primary tubes': '1.625"', Collector: '4-2-1, 2.25" outlet' }],
    ['integra-94-01-header', 'header', 'header', 'Acura Integra 1994-2001 4-2-1 Header', '1.8L B18B / B18C', [['Acura', 'Integra', 1994, 2001]], [110, 250, 510], 12, 4.8, 27, '', { 'Primary tubes': '1.75"', Collector: '4-2-1, 2.5" outlet' }],
    ['350z-03-06-header', 'header', 'header', 'Nissan 350Z 2003-2006 Long Tube Headers', '3.5L VQ35DE', [['Nissan', '350Z', 2003, 2006]], [185, 420, 860], 6, 4.5, 19, '', { 'Primary tubes': '1.75"', Collector: '2.5" (pair)' }],
    ['s2000-00-09-header', 'header', 'header', 'Honda S2000 2000-2009 Header', '2.0L F20C / 2.2L F22C1', [['Honda', 'S2000', 2000, 2009]], [140, 320, 650], 9, 4.9, 11, 'new', { 'Primary tubes': '1.875"', Collector: '4-1, 3" outlet' }],
    ['wrx-08-14-downpipe', 'downpipe', 'downpipe', 'Subaru WRX 2008-2014 3" Downpipe', '2.5L EJ255 turbo', [['Subaru', 'WRX', 2008, 2014]], [145, 330, 680], 18, 4.7, 64, 'best', { Configuration: 'Catless, divorced wastegate' }],
    ['focus-st-13-18-downpipe', 'downpipe', 'downpipe', 'Ford Focus ST 2013-2018 3" Downpipe', '2.0L EcoBoost', [['Ford', 'Focus ST', 2013, 2018]], [135, 310, 640], 22, 4.6, 41, 'best', { Configuration: 'Catless' }],
    ['gti-mk7-15-21-downpipe', 'downpipe', 'downpipe', 'Volkswagen GTI Mk7 2015-2021 3" Downpipe', '2.0T EA888 Gen 3', [['Volkswagen', 'GTI', 2015, 2021]], [150, 345, 710], 0, 4.4, 23, '', { Configuration: 'Catless, V-band outlet' }],
    ['civic-si-22-24-downpipe', 'downpipe', 'downpipe', 'Honda Civic Si 2022-2024 3" Downpipe', '1.5L L15 turbo', [['Honda', 'Civic Si', 2022, 2024]], [130, 300, 615], 15, 4.8, 16, 'new', { Configuration: 'Catless, V-band inlet' }],
    ['370z-09-20-test-pipes', 'test-pipe', 'testpipe', 'Nissan 370Z 2009-2020 Test Pipes (Pair)', '3.7L VQ37VHR', [['Nissan', '370Z', 2009, 2020]], [75, 175, 355], 40, 4.7, 88, 'best', { Diameter: '2.5"', Pieces: '2' }],
    ['g35-03-07-test-pipes', 'test-pipe', 'testpipe', 'Infiniti G35 2003-2007 Test Pipes (Pair)', '3.5L VQ35DE', [['Infiniti', 'G35', 2003, 2007]], [70, 160, 330], 27, 4.5, 34, '', { Diameter: '2.5"', Pieces: '2' }],
    ['mustang-gt-11-14-x-pipe', 'test-pipe', 'testpipe', 'Ford Mustang GT 2011-2014 Off-Road X-Pipe', '5.0L Coyote', [['Ford', 'Mustang', 2011, 2014]], [120, 275, 560], 8, 4.6, 21, '', { Diameter: '2.75"', Pieces: '1' }],
    ['civic-06-11-intake', 'cold-air-intake', 'intake', 'Honda Civic 2006-2011 Cold Air Intake', '1.8L R18', [['Honda', 'Civic', 2006, 2011]], [85, 195, 400], 33, 4.5, 47, 'best', { 'Tube diameter': '2.75"' }],
    ['miata-99-05-intake', 'cold-air-intake', 'intake', 'Mazda MX-5 Miata 1999-2005 Cold Air Intake', '1.8L BP', [['Mazda', 'MX-5 Miata', 1999, 2005]], [90, 205, 420], 14, 4.7, 29, '', { 'Tube diameter': '3"' }],
    ['mustang-15-17-intake', 'cold-air-intake', 'intake', 'Ford Mustang GT 2015-2017 Cold Air Intake', '5.0L Coyote', [['Ford', 'Mustang', 2015, 2017]], [125, 285, 585], 11, 4.6, 18, 'new', { 'Tube diameter': '4"' }],
    ['flange-3-bolt-3in', 'cnc-part', 'cnc', '3-Bolt Downpipe Flange, 3" (T304)', 'Universal', [], [18, 42, 85], 120, 4.8, 57, '', { Thickness: '1/2"', 'Bore': '3"' }],
    ['k-series-header-flange', 'cnc-part', 'cnc', 'Honda K-Series Header Flange, 3/8"', 'K20 / K24', [['Acura', 'RSX', 2002, 2006], ['Honda', 'Civic Si', 2006, 2011]], [28, 65, 130], 46, 4.9, 22, '', { Thickness: '3/8"' }],
    ['o2-spacer-90-pair', 'cnc-part', 'spacer', 'O2 Sensor Spacer, 90 Degree (Pair)', 'Universal', [], [15, 35, 70], 200, 4.3, 71, '', { Thread: 'M18 x 1.5' }],
    ['slant-tip-3-4', 'more-products', 'tip', 'Slant-Cut Exhaust Tip, 3" In / 4" Out', 'Universal', [], [25, 58, 118], 75, 4.6, 39, '', { Inlet: '3"', Outlet: '4"', Length: '8"' }],
    ['resonator-3in', 'more-products', 'resonator', 'Universal 3" Straight-Through Resonator', 'Universal', [], [55, 125, 260], 30, 4.5, 26, 'new', { Inlet: '3"', Length: '14"' }],
    ['header-install-kit', 'more-products', 'kit', 'Header Install Kit: Gasket, Studs and Nuts', 'Universal 4-cylinder', [], [22, 50, 105], 90, 4.7, 44, '', { Studs: '10 x M8', Gasket: 'Multi-layer steel' }],
  ];

  const SKU_PREFIX = { header: 'HDR', downpipe: 'DP', 'test-pipe': 'TP', 'cold-air-intake': 'CAI', 'cnc-part': 'CNC', 'more-products': 'MP' };
  const skuCount = {};
  const products = raw.map(([id, cat, art, title, engine, fits, price, stock, rating, reviews, flag, extra]) => {
    skuCount[cat] = (skuCount[cat] || 0) + 1;
    const category = categories.find((c) => c.id === cat);
    const fitments = fits.map(([make, model, from, to]) => ({ make, model, from, to }));
    return {
      id,
      sku: `${SKU_PREFIX[cat]}-${(categories.findIndex((c) => c.id === cat) + 1) * 1000 + skuCount[cat]}`,
      category: cat,
      categoryName: category.name,
      art,
      title,
      engine,
      fits: fitments,
      universal: fitments.length === 0,
      price: { cheap: price[0], middle: price[1], expensive: price[2] },
      stock,
      rating,
      reviewCount: reviews,
      best: flag === 'best',
      isNew: flag === 'new',
      specs: { ...SPECS[cat], ...extra, Engine: engine, Warranty: WARRANTY[cat] },
      warranty: WARRANTY[cat],
      inBox: IN_BOX[cat],
    };
  });

  // Sample reviews. Every part has exactly as many reviews as its count says (reviewCount), so a shopper can read
  // every one of them, and the star ratings average out to the part's rating. Newest first. Made up for the preview.
  const FIRST = ['Marcus', 'Dana', 'Luis', 'Jordan', 'Priya', 'Ben', 'Alex', 'Chris', 'Taylor', 'Sam', 'Riley', 'Morgan',
    'Jamie', 'Kevin', 'Andre', 'Nate', 'Tyler', 'Erin', 'Hector', 'Kyle', 'Brandon', 'Devon', 'Omar', 'Grace', 'Ethan',
    'Mia', 'Victor', 'Zach', 'Paul', 'Cody', 'Isaac', 'Rosa', 'Derek', 'Lena', 'Trevor', 'Austin', 'Hannah', 'Mason',
    'Diego', 'Wes', 'Kara', 'Jared', 'Noah', 'Tessa', 'Caleb', 'Ivan', 'Gabe', 'Shawn'];
  const INITIALS = 'ABCDEFGHJKLMNPRSTVWY';
  const SAY = {
    5: [
      ['Bolted right up', 'Lined up with the factory mounting points, no forcing anything.'],
      ['Better than I expected', 'Finish is clean and everything was packed well. Nothing bent in shipping.'],
      ['Noticeable difference', 'Car feels livelier up top. Install took about two hours in the driveway.'],
      ['Shipped fast', 'Ordered Monday, on my porch Thursday. Instructions were clear and the hardware was all there.'],
      ['Exactly as described', 'Matches the pictures and the specs. Already recommended it to two friends.'],
      ['Great support', 'Had a question before ordering and got an answer the same day. Part is perfect.'],
      ['Third one I have bought', 'Same quality every time and fast shipping.'],
      ['Worth it', 'Compared a few brands and this one was built the best. No issues after 2,000 miles.'],
      ['Easy install', 'Took my time and it still went in under an afternoon. Everything lined up.'],
      ['Love it', 'Sounds and looks great. Would buy again without thinking about it.'],
      ['Quality part', 'Heavier and better made than the one it replaced.'],
      ['No leaks, no rattles', 'A few weeks of daily driving and it has been perfect.'],
      ['Spot on', 'Fit like the original part. Good packaging and quick delivery.'],
      ['Happy customer', 'Good price, good part, and the tracking updates were accurate.'],
    ],
    4: [
      ['Good part, needed a gasket', 'Fit was right. My old gasket was done, so order a new one with it.'],
      ['Solid for the price', 'Fit and finish are good. One bolt hole was a little tight but a quick pass with a file fixed it.'],
      ['Happy with it', 'Fit was good after loosening the mounts. Took a bit of patience.'],
      ['Pretty good', 'Does the job well. Instructions could use a few more pictures.'],
      ['Would buy again', 'Shipping took a day longer than quoted, but the part itself is great.'],
      ['Nice upgrade', 'Good quality. Lost a star only because the box was a little beat up.'],
      ['Works well', 'Fits fine. I had to reuse a couple of my old bolts.'],
    ],
    3: [
      ['Works, a little loud', 'Does what it says. Louder than I wanted for a daily driver.'],
      ['It is okay', 'Took some adjusting to fit, but it works now.'],
      ['Average', 'Not bad, not amazing. Finish had a small scuff out of the box.'],
      ['Fine once installed', 'Install was harder than I expected. Works fine now.'],
    ],
    2: [
      ['Took a while to fit', 'Had to adjust the mounts quite a bit to get it to line up.'],
      ['Slow to arrive', 'Shipping took longer than I hoped. The part is okay.'],
      ['Not for me', 'Too loud for my daily commute. Support was helpful about a return.'],
    ],
    1: [
      ['Missing hardware', 'A bolt was missing from the box. Support sent one out, but it delayed my install.'],
      ['Arrived damaged', 'The box was crushed in shipping. They are sending a replacement.'],
    ],
  };
  const DETAIL = {
    header: ['Flanges were flat and the collector lined up.', 'Welds are clean all the way around.'],
    downpipe: ['The flex section takes up engine movement nicely.', 'O2 bungs were in the right spots.'],
    'test-pipe': ['Clamps sealed up with no leaks.', 'Good thick tubing.'],
    'cold-air-intake': ['The filter seats well and the couplers clamp tight.', 'Hear the intake a lot more now.'],
    'cnc-part': ['Machining is clean and the threads are sharp.', 'Holes lined up with the studs.'],
    'more-products': ['Fit my setup with no surprises.', 'Hardware was all there.'],
  };
  const DROPS = [1, 1, 2, 1, 1, 3, 1, 2, 1, 4, 1, 1];
  const DAY = 86400000;
  const NEWEST = Date.UTC(2026, 10, 5);
  const reviewCache = {};

  function reviewsFor(product) {
    if (reviewCache[product.id]) return reviewCache[product.id];
    const seed = product.id.split('').reduce((a, ch) => a + ch.charCodeAt(0), 0);
    const n = product.reviewCount;
    // Star ratings that average to the part's rating: start at 5 and take stars off until the total matches.
    const ratings = new Array(n).fill(5);
    let off = Math.round((5 - product.rating) * n);
    for (let k = 0, i = seed % DROPS.length; off > 0 && k < n; k += 1, i += 1) {
      const d = Math.min(DROPS[i % DROPS.length], off);
      ratings[k] = 5 - d;
      off -= d;
    }
    // Spread the lower ratings through the list (same order every time).
    let r = seed;
    const rand = () => { r = (r * 1103515245 + 12345) % 2147483648; return r / 2147483648; };
    for (let k = n - 1; k > 0; k -= 1) { const j = Math.floor(rand() * (k + 1)); [ratings[k], ratings[j]] = [ratings[j], ratings[k]]; }
    const fit = product.fits[0];
    const spread = Math.min(700, n * 9);
    const used = {};
    const seen = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    const list = ratings.map((rating, i) => {
      const pool = SAY[rating];
      const pick = (seed + seen[rating] * 5) % pool.length;
      seen[rating] += 1;
      const [title, line] = pool[pick];
      const extra = DETAIL[product.category] || [];
      const body = (rating >= 4 && extra.length && (seed + i) % 3 !== 0) ? `${line} ${extra[(seed + i) % extra.length]}` : line;
      let name = '';
      for (let t = 0; t < 12 && (!name || used[name]); t += 1) {
        name = `${FIRST[(seed * 7 + i * 13 + t * 5) % FIRST.length]} ${INITIALS[(seed + i * 5 + t * 3) % INITIALS.length]}.`;
      }
      used[name] = true;
      const year = fit ? fit.from + ((seed + i) % (fit.to - fit.from + 1)) : null;
      const daysAgo = Math.floor((i * spread) / n) + ((seed + i * 3) % 4);
      return {
        id: `${product.id}-r${i + 1}`,
        name,
        rating,
        title,
        body,
        date: new Date(NEWEST - daysAgo * DAY).toISOString().slice(0, 10),
        vehicle: fit ? `${year} ${fit.make} ${fit.model}` : '',
        verified: (seed + i) % 9 !== 0,
      };
    });
    list.sort((a, b) => b.date.localeCompare(a.date));
    reviewCache[product.id] = list;
    return list;
  }

  // How many reviews gave 5, 4, 3, 2 and 1 stars, and the same as whole percentages that add up to 100.
  function ratingCounts(product) {
    const counts = [0, 0, 0, 0, 0];
    for (const rv of reviewsFor(product)) counts[5 - rv.rating] += 1;
    return counts;
  }
  function ratingSplit(product) {
    const counts = ratingCounts(product);
    const total = counts.reduce((a, b) => a + b, 0) || 1;
    const pct = counts.map((c) => Math.round((c * 100) / total));
    const diff = 100 - pct.reduce((a, b) => a + b, 0);
    pct[pct.indexOf(Math.max(...pct))] += diff;
    return pct;
  }
  // A 5-star review to quote on a home page (the nth one, newest first).
  function featuredReview(product, nth = 0) {
    const five = reviewsFor(product).filter((rv) => rv.rating === 5);
    return five[nth % Math.max(1, five.length)] || reviewsFor(product)[0];
  }
  // Sort a list of reviews: 'new' (newest first), 'high' (most stars first), 'low' (fewest stars first).
  function sortReviews(list, how) {
    const out = list.slice();
    if (how === 'high') out.sort((a, b) => b.rating - a.rating || b.date.localeCompare(a.date));
    else if (how === 'low') out.sort((a, b) => a.rating - b.rating || b.date.localeCompare(a.date));
    else out.sort((a, b) => b.date.localeCompare(a.date));
    return out;
  }

  // Shows a list of reviews a page at a time so every review can be read: "Show N more", "Show all", sorting and an
  // optional star or category filter. Each store passes its own elements and its own card markup.
  //   reviews: the full list; card(review) -> HTML; list, count, more, all: elements; sort: optional <select>;
  //   first: how many show at the start; step: how many each "Show more" adds; noun: what the count calls them.
  function pageReviews(opts) {
    const { list, count, more, all, sort, card } = opts;
    const first = opts.first || 6;
    const step = opts.step || 10;
    const empty = opts.empty || '<p>No reviews match.</p>';
    const st = { shown: first, how: sort ? sort.value : 'new', keep: null };
    const plural = (n, one, many) => (n === 1 ? one : many);
    const draw = () => {
      const pool = sortReviews(st.keep ? opts.reviews.filter(st.keep) : opts.reviews, st.how);
      const n = Math.min(st.shown, pool.length);
      list.innerHTML = n ? pool.slice(0, n).map(card).join('') : empty;
      count.textContent = pool.length ? `Showing ${n.toLocaleString()} of ${pool.length.toLocaleString()} ${plural(pool.length, 'review', 'reviews')}` : 'No reviews match';
      const left = pool.length - n;
      more.hidden = left <= 0;
      all.hidden = left <= step;
      more.textContent = `Show ${Math.min(step, left)} more ${plural(Math.min(step, left), 'review', 'reviews')}`;
      all.textContent = `Show all ${pool.length.toLocaleString()}`;
    };
    more.addEventListener('click', () => { st.shown += step; draw(); });
    all.addEventListener('click', () => { st.shown = Infinity; draw(); more.focus(); if (more.hidden) count.focus(); });
    if (sort) sort.addEventListener('change', () => { st.how = sort.value; st.shown = first; draw(); });
    count.setAttribute('aria-live', 'polite');
    if (!count.hasAttribute('tabindex')) count.setAttribute('tabindex', '-1');
    draw();
    return {
      draw,
      // Show only reviews that pass the test (or all of them with no test), from the top again.
      filter(test) { st.keep = test || null; st.shown = first; draw(); },
    };
  }

  window.PREVIEW_CATALOG = { categories, products, reviewsFor, ratingCounts, ratingSplit, featuredReview, sortReviews, pageReviews };
})();
