/*
 * Drawn product pictures for the brand design previews, so no stock photos are needed.
 * PartsArt.svg(kind, { finish, accent, coupler, view, label }) returns an <svg> string.
 *   kind:   header | downpipe | testpipe | intake | cnc | spacer | tip | resonator | kit
 *   finish: steel | black | titanium
 *   view:   main | detail | flip | box   (four gallery shots of the same part)
 */
(function () {
  'use strict';

  let uid = 0;
  const FINISH = {
    steel: { edge: '#5a606b', body: '#a7aeb9', light: '#dde1e7', shine: '#ffffff', plateA: '#f1f3f6', plateB: '#b4bbc5', hole: '#2a2e35' },
    black: { edge: '#09090b', body: '#2b2c31', light: '#4c4e56', shine: '#8f929b', plateA: '#4a4c53', plateB: '#1b1c20', hole: '#050506' },
    titanium: { edge: '#2f2552', body: '#6a59a6', light: '#b6a5e4', shine: '#f3ecff', plateA: '#e3dbf7', plateB: '#7d6ab7', hole: '#191230' },
  };

  function tube(d, w, f) {
    const s = (color, width, extra = '') => `<path d="${d}" fill="none" stroke="${color}" stroke-width="${width}" stroke-linejoin="round"${extra}/>`;
    return s(f.edge, w) + s(f.body, w * 0.8) + s(f.light, w * 0.36) + s(f.shine, w * 0.1, ' stroke-opacity=".85"');
  }

  const shadow = (cx, cy, rx) => `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="9" fill="#000" opacity=".09"/>`;

  const DRAW = {
    header(f, g) {
      const tubes = [
        'M98 70 C98 146 170 146 184 196',
        'M302 70 C302 146 230 146 216 196',
        'M166 70 C166 132 190 152 194 196',
        'M234 70 C234 132 210 152 206 196',
      ];
      return shadow(200, 288, 150)
        + tubes.map((d) => tube(d, 26, f)).join('')
        + `<path d="M172 188 L228 188 L215 230 L185 230 Z" fill="url(#${g})" stroke="${f.edge}" stroke-width="2"/>`
        + `<rect x="219" y="196" width="14" height="12" rx="2" fill="url(#${g})" stroke="${f.edge}" stroke-width="1.5"/>`
        + tube('M200 228 C200 254 222 260 262 260 L298 260', 24, f)
        + `<rect x="294" y="234" width="15" height="52" rx="6" fill="url(#${g})" stroke="${f.edge}" stroke-width="2"/>`
        + `<rect x="50" y="40" width="300" height="44" rx="10" fill="url(#${g})" stroke="${f.edge}" stroke-width="2"/>`
        + [98, 166, 234, 302].map((x) => `<ellipse cx="${x}" cy="62" rx="22" ry="11" fill="${f.hole}"/><ellipse cx="${x}" cy="62" rx="22" ry="11" fill="none" stroke="${f.light}" stroke-width="2" opacity=".7"/>`).join('')
        + [62, 132, 200, 268, 338].map((x) => `<circle cx="${x}" cy="62" r="5" fill="${f.hole}"/>`).join('');
    },
    downpipe(f, g, id) {
      return shadow(210, 286, 160)
        + `<defs><pattern id="flex${id}" width="6" height="60" patternUnits="userSpaceOnUse"><rect width="3" height="60" fill="${f.light}" opacity=".9"/></pattern></defs>`
        + tube('M100 70 L100 118 C100 186 142 206 204 206 L334 206', 50, f)
        + `<rect x="216" y="180" width="62" height="52" rx="8" fill="${f.body}" stroke="${f.edge}" stroke-width="2"/>`
        + `<rect x="216" y="180" width="62" height="52" rx="8" fill="url(#flex${id})"/>`
        + `<rect x="208" y="176" width="11" height="60" rx="3" fill="url(#${g})" stroke="${f.edge}" stroke-width="1.5"/>`
        + `<rect x="275" y="176" width="11" height="60" rx="3" fill="url(#${g})" stroke="${f.edge}" stroke-width="1.5"/>`
        + `<rect x="118" y="150" width="18" height="14" rx="3" transform="rotate(-38 127 157)" fill="url(#${g})" stroke="${f.edge}" stroke-width="1.5"/>`
        + [[46, 70], [154, 70], [100, 38]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="12" fill="url(#${g})" stroke="${f.edge}" stroke-width="2"/>`).join('')
        + `<ellipse cx="100" cy="62" rx="54" ry="20" fill="url(#${g})" stroke="${f.edge}" stroke-width="2"/>`
        + `<ellipse cx="100" cy="62" rx="32" ry="11" fill="${f.hole}"/>`
        + [[46, 70], [154, 70], [100, 38]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="4" fill="${f.hole}"/>`).join('')
        + `<ellipse cx="336" cy="206" rx="13" ry="36" fill="url(#${g})" stroke="${f.edge}" stroke-width="2"/>`
        + `<ellipse cx="336" cy="206" rx="6" ry="22" fill="${f.hole}"/>`;
    },
    testpipe(f, g) {
      const one = (dx, dy, dim) => `<g transform="translate(${dx} ${dy})"${dim ? ' opacity=".82"' : ''}>`
        + tube('M76 176 C150 176 168 112 246 112 L324 112', 40, f)
        + `<rect x="64" y="136" width="18" height="80" rx="9" fill="url(#${g})" stroke="${f.edge}" stroke-width="2"/>`
        + `<circle cx="73" cy="148" r="4" fill="${f.hole}"/><circle cx="73" cy="204" r="4" fill="${f.hole}"/>`
        + `<rect x="318" y="72" width="18" height="80" rx="9" fill="url(#${g})" stroke="${f.edge}" stroke-width="2"/>`
        + `<circle cx="327" cy="84" r="4" fill="${f.hole}"/><circle cx="327" cy="140" r="4" fill="${f.hole}"/>`
        + `<rect x="276" y="86" width="14" height="12" rx="2" fill="url(#${g})" stroke="${f.edge}" stroke-width="1.5"/>`
        + '</g>';
      return shadow(210, 286, 160) + one(30, 50, true) + one(0, 0, false);
    },
    intake(f, g, id, o) {
      const filter = 'M272 178 L272 230 L346 252 Q362 254 362 204 Q362 154 346 156 Z';
      return shadow(200, 284, 160)
        + `<defs><clipPath id="flt${id}"><path d="${filter}"/></clipPath></defs>`
        + tube('M74 112 L118 112 C176 112 176 204 236 204 L264 204', 42, f)
        + `<rect x="32" y="86" width="46" height="52" rx="8" fill="${o.coupler}"/>`
        + `<rect x="37" y="92" width="36" height="6" rx="3" fill="#fff" opacity=".16"/>`
        + `<rect x="40" y="83" width="6" height="58" rx="2" fill="url(#${g})" stroke="${f.edge}"/><rect x="64" y="83" width="6" height="58" rx="2" fill="url(#${g})" stroke="${f.edge}"/>`
        + `<path d="${filter}" fill="${o.accent}"/>`
        + `<g clip-path="url(#flt${id})">${[280, 289, 298, 307, 316, 325, 334, 343, 352].map((x) => `<rect x="${x}" y="140" width="3.5" height="130" fill="#000" opacity=".22"/>`).join('')}<rect x="270" y="160" width="100" height="10" fill="#fff" opacity=".18"/></g>`
        + `<rect x="258" y="174" width="16" height="60" rx="3" fill="url(#${g})" stroke="${f.edge}" stroke-width="1.5"/>`
        + `<ellipse cx="360" cy="204" rx="11" ry="50" fill="#1b1b1e"/><ellipse cx="362" cy="204" rx="4" ry="18" fill="${o.accent}" opacity=".9"/>`;
    },
    cnc(f, g) {
      const pts = '200,58 318,236 82,236';
      return shadow(204, 288, 140)
        + `<polygon points="${pts}" transform="translate(8 10)" fill="${f.edge}" stroke="${f.edge}" stroke-width="46" stroke-linejoin="round"/>`
        + `<polygon points="${pts}" fill="${f.edge}" stroke="${f.edge}" stroke-width="50" stroke-linejoin="round"/>`
        + `<polygon points="${pts}" fill="url(#${g})" stroke="url(#${g})" stroke-width="46" stroke-linejoin="round"/>`
        + `<circle cx="200" cy="177" r="72" fill="none" stroke="${f.plateB}" stroke-width="1.5" opacity=".7"/>`
        + `<circle cx="200" cy="177" r="60" fill="none" stroke="${f.light}" stroke-width="5"/>`
        + `<circle cx="200" cy="177" r="52" fill="${f.hole}"/>`
        + [[200, 52], [322, 240], [78, 240]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="12" fill="${f.hole}"/>`).join('');
    },
    spacer(f, g) {
      const one = (cx, cy, rot) => {
        const hex = [0, 1, 2, 3, 4, 5].map((i) => { const a = (Math.PI / 3) * i; return `${(cx + 42 * Math.cos(a)).toFixed(1)},${(cy + 42 * Math.sin(a)).toFixed(1)}`; }).join(' ');
        return `<g transform="rotate(${rot} ${cx} ${cy})">`
          + `<rect x="${cx - 18}" y="${cy + 20}" width="36" height="62" rx="4" fill="url(#${g})" stroke="${f.edge}" stroke-width="2"/>`
          + [0, 1, 2, 3, 4, 5, 6, 7, 8].map((i) => `<rect x="${cx - 18}" y="${cy + 30 + i * 6}" width="36" height="2" fill="${f.edge}" opacity=".45"/>`).join('')
          + `<polygon points="${hex}" fill="url(#${g})" stroke="${f.edge}" stroke-width="2"/>`
          + `<circle cx="${cx}" cy="${cy}" r="16" fill="${f.hole}"/><circle cx="${cx}" cy="${cy}" r="24" fill="none" stroke="${f.light}" stroke-width="3"/>`
          + '</g>';
      };
      return shadow(200, 286, 140) + one(140, 140, -14) + one(262, 150, 18);
    },
    tip(f, g) {
      return shadow(200, 270, 150)
        + `<path d="M70 118 L292 106 L336 208 L70 200 Z" fill="url(#${g})" stroke="${f.edge}" stroke-width="2"/>`
        + `<path d="M74 134 L298 124" stroke="${f.shine}" stroke-width="8" opacity=".75"/>`
        + `<path d="M74 186 L322 190" stroke="${f.edge}" stroke-width="5" opacity=".25"/>`
        + `<rect x="98" y="112" width="14" height="90" fill="${f.edge}" opacity=".35"/>`
        + `<ellipse cx="314" cy="157" rx="17" ry="55" transform="rotate(-22 314 157)" fill="${f.hole}" stroke="${f.light}" stroke-width="6"/>`
        + `<ellipse cx="70" cy="159" rx="10" ry="41" fill="${f.body}" stroke="${f.edge}" stroke-width="2"/>`;
    },
    resonator(f, g) {
      return shadow(200, 262, 170)
        + tube('M24 150 L120 150', 34, f) + tube('M280 150 L376 150', 34, f)
        + `<rect x="102" y="94" width="196" height="112" rx="56" fill="url(#${g})" stroke="${f.edge}" stroke-width="2"/>`
        + `<rect x="132" y="108" width="136" height="12" rx="6" fill="${f.shine}" opacity=".7"/>`
        + `<path d="M150 98 L150 202 M250 98 L250 202" stroke="${f.edge}" stroke-width="2" opacity=".35"/>`;
    },
    kit(f, g, id) {
      const ports = [104, 168, 232, 296];
      return shadow(200, 286, 150)
        + `<defs><mask id="gk${id}"><rect x="0" y="0" width="400" height="300" fill="#fff"/>${ports.map((x) => `<ellipse cx="${x}" cy="88" rx="24" ry="17" fill="#000"/>`).join('')}${[70, 136, 200, 264, 330].map((x) => `<circle cx="${x}" cy="88" r="5" fill="#000"/>`).join('')}</mask></defs>`
        + `<rect x="54" y="50" width="292" height="76" rx="12" fill="#d8cdb4" stroke="#a49572" stroke-width="2" mask="url(#gk${id})"/>`
        + ports.map((x) => `<ellipse cx="${x}" cy="88" rx="29" ry="22" fill="none" stroke="#a49572" stroke-width="2"/>`).join('')
        + [92, 156, 220, 284].map((x, i) => {
          const hex = [0, 1, 2, 3, 4, 5].map((k) => { const a = (Math.PI / 3) * k + Math.PI / 6; return `${(x + 17 * Math.cos(a)).toFixed(1)},${(262 + 17 * Math.sin(a)).toFixed(1)}`; }).join(' ');
          return `<rect x="${x + 22}" y="146" width="12" height="${84 - (i % 2) * 10}" rx="3" fill="url(#${g})" stroke="${f.edge}" stroke-width="1.5"/>`
            + [0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((k) => `<rect x="${x + 22}" y="${152 + k * 7}" width="12" height="2" fill="${f.edge}" opacity=".4"/>`).join('')
            + `<polygon points="${hex}" fill="url(#${g})" stroke="${f.edge}" stroke-width="1.5"/><circle cx="${x}" cy="262" r="6" fill="${f.hole}"/>`;
        }).join('');
    },
  };

  const DETAIL = {
    header: '110 120 200 150', downpipe: '160 140 200 150', testpipe: '200 50 180 135', intake: '210 120 180 135',
    cnc: '110 90 180 135', spacer: '80 80 200 150', tip: '200 80 170 128', resonator: '90 70 220 165', kit: '50 40 200 150',
  };

  function svg(kind, options = {}) {
    const draw = DRAW[kind] || DRAW.header;
    const f = FINISH[options.finish] || FINISH.steel;
    const o = { accent: options.accent || '#c8102e', coupler: options.coupler || '#141416' };
    const id = `pa${(uid += 1)}`;
    const g = `${id}g`;
    const view = options.view || 'main';
    const defs = `<defs><linearGradient id="${g}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${f.plateA}"/><stop offset=".55" stop-color="${f.plateB}"/><stop offset="1" stop-color="${f.edge}"/></linearGradient></defs>`;
    let body = draw(f, g, id, o);
    let viewBox = '0 0 400 300';
    if (view === 'flip') body = `<g transform="translate(400 0) scale(-1 1)">${body}</g>`;
    if (view === 'detail') viewBox = DETAIL[kind] || '80 60 240 180';
    if (view === 'box' && kind !== 'kit') {
      body = `<g transform="translate(8 6) scale(.74)">${body}</g><g transform="translate(222 150) scale(.42)">${DRAW.kit(f, g, `${id}k`, o)}</g>`;
    }
    const label = String(options.label || kind).replace(/[<>&"]/g, '');
    return `<svg viewBox="${viewBox}" role="img" aria-label="${label}" preserveAspectRatio="xMidYMid meet" xmlns="http://www.w3.org/2000/svg">${defs}${body}</svg>`;
  }

  window.PartsArt = { svg, kinds: Object.keys(DRAW) };
})();
