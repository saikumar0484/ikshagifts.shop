import fs from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const outDir = path.resolve("public", "product-images");

const products = [
  {
    id: "bracelet",
    name: "Stylish Bracelet",
    palette: ["#f7e9df", "#c69b7b", "#8b5e4b", "#f4c6d7"],
    kind: "bracelet",
  },
  {
    id: "couple-watches",
    name: "Premium Couple Watches",
    palette: ["#f3e8e2", "#2e2320", "#c6a769", "#ffffff"],
    kind: "couple-watches",
  },
  {
    id: "couple-bracelets",
    name: "Couple Bracelets Set",
    palette: ["#fff4ec", "#8b6f5a", "#c6a769", "#2e2320"],
    kind: "couple-bracelets",
  },
  {
    id: "women-watch",
    name: "Elegant Women Watch",
    palette: ["#f8e6ef", "#b76e79", "#f0c7a4", "#2e2320"],
    kind: "women-watch",
  },
  {
    id: "men-watch",
    name: "Classic Men Watch",
    palette: ["#e9ece8", "#2e3635", "#9a7a50", "#1f1b18"],
    kind: "men-watch",
  },
  {
    id: "small-bouquet",
    name: "Small Flower Bouquet",
    palette: ["#f8efe8", "#d989a3", "#f3c14f", "#5c8b68"],
    kind: "small-bouquet",
  },
  {
    id: "large-bouquet",
    name: "Grand Flower Bouquet",
    palette: ["#fff0f4", "#c24d77", "#f5c16c", "#416d56"],
    kind: "large-bouquet",
  },
  {
    id: "small-hamper",
    name: "Small Gift Hamper",
    palette: ["#f5ede5", "#b9875f", "#e6c48a", "#8b4f4f"],
    kind: "small-hamper",
  },
  {
    id: "large-hamper",
    name: "Luxury Gift Hamper",
    palette: ["#f7eadc", "#7d4d3b", "#d1a45f", "#2e2320"],
    kind: "large-hamper",
  },
  {
    id: "magazine-gift",
    name: "Customized Magazine Gift",
    palette: ["#f3e8e2", "#8b6f5a", "#d9b27c", "#ffffff"],
    kind: "magazine-gift",
  },
  {
    id: "women-couple-bracelet",
    name: "Women Couple Bracelet",
    palette: ["#f9e5ee", "#c8789a", "#c6a769", "#5b3b42"],
    kind: "women-couple-bracelet",
  },
  {
    id: "men-couple-bracelet",
    name: "Men Couple Bracelet",
    palette: ["#eee7df", "#3a302b", "#a78455", "#1e1b18"],
    kind: "men-couple-bracelet",
  },
  {
    id: "women-couple-watches",
    name: "Women & Men Couple Watches",
    palette: ["#f2e7df", "#2e2320", "#c6a769", "#b76e79"],
    kind: "women-couple-watches",
  },
];

function flower(cx, cy, size, fill, accent) {
  const petals = Array.from({ length: 8 }, (_, index) => {
    const angle = (Math.PI * 2 * index) / 8;
    const x = cx + Math.cos(angle) * size * 0.42;
    const y = cy + Math.sin(angle) * size * 0.42;
    return `<ellipse cx="${x}" cy="${y}" rx="${size * 0.22}" ry="${size * 0.36}" fill="${fill}" transform="rotate(${(angle * 180) / Math.PI} ${x} ${y})"/>`;
  }).join("");
  return `${petals}<circle cx="${cx}" cy="${cy}" r="${size * 0.18}" fill="${accent}"/>`;
}

function watch(x, y, scale, strap, metal, face) {
  return `
    <rect x="${x + 155 * scale}" y="${y - 260 * scale}" width="${90 * scale}" height="${260 * scale}" rx="${45 * scale}" fill="${strap}"/>
    <rect x="${x + 155 * scale}" y="${y + 210 * scale}" width="${90 * scale}" height="${260 * scale}" rx="${45 * scale}" fill="${strap}"/>
    <circle cx="${x + 200 * scale}" cy="${y + 110 * scale}" r="${170 * scale}" fill="${metal}"/>
    <circle cx="${x + 200 * scale}" cy="${y + 110 * scale}" r="${125 * scale}" fill="${face}"/>
    <line x1="${x + 200 * scale}" y1="${y + 110 * scale}" x2="${x + 200 * scale}" y2="${y + 28 * scale}" stroke="${strap}" stroke-width="${15 * scale}" stroke-linecap="round"/>
    <line x1="${x + 200 * scale}" y1="${y + 110 * scale}" x2="${x + 270 * scale}" y2="${y + 142 * scale}" stroke="${strap}" stroke-width="${12 * scale}" stroke-linecap="round"/>
    <circle cx="${x + 200 * scale}" cy="${y + 110 * scale}" r="${10 * scale}" fill="${strap}"/>
  `;
}

function bracelet(cx, cy, rx, ry, stroke, jewel, beads = 18) {
  const beadEls = Array.from({ length: beads }, (_, index) => {
    const angle = (Math.PI * 2 * index) / beads;
    const x = cx + Math.cos(angle) * rx;
    const y = cy + Math.sin(angle) * ry;
    const r = index % 4 === 0 ? 32 : 25;
    return `<circle cx="${x}" cy="${y}" r="${r}" fill="${index % 3 === 0 ? jewel : stroke}" stroke="#fff7ef" stroke-width="8"/>`;
  }).join("");
  return `
    <ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="none" stroke="${stroke}" stroke-width="38" opacity="0.45"/>
    ${beadEls}
    <circle cx="${cx}" cy="${cy - ry}" r="45" fill="${jewel}" stroke="#fff7ef" stroke-width="10"/>
  `;
}

function hamper(x, y, scale, basket, ribbon, accent, large = false) {
  const extras = large
    ? `
      <rect x="${x + 285 * scale}" y="${y - 190 * scale}" width="${150 * scale}" height="${210 * scale}" rx="${25 * scale}" fill="#fff7ed"/>
      <circle cx="${x + 360 * scale}" cy="${y - 220 * scale}" r="${58 * scale}" fill="${accent}"/>
      <rect x="${x + 470 * scale}" y="${y - 110 * scale}" width="${170 * scale}" height="${150 * scale}" rx="${28 * scale}" fill="${ribbon}" opacity="0.86"/>
    `
    : `
      <rect x="${x + 315 * scale}" y="${y - 120 * scale}" width="${145 * scale}" height="${145 * scale}" rx="${28 * scale}" fill="#fff7ed"/>
      <circle cx="${x + 518 * scale}" cy="${y - 92 * scale}" r="${54 * scale}" fill="${accent}"/>
    `;
  return `
    ${extras}
    <path d="M${x + 120 * scale} ${y + 80 * scale} Q${x + 370 * scale} ${y - 150 * scale} ${x + 620 * scale} ${y + 80 * scale}" fill="none" stroke="${basket}" stroke-width="${35 * scale}" stroke-linecap="round"/>
    <rect x="${x + 80 * scale}" y="${y + 20 * scale}" width="${580 * scale}" height="${340 * scale}" rx="${70 * scale}" fill="${basket}"/>
    <path d="M${x + 80 * scale} ${y + 120 * scale} H${x + 660 * scale}" stroke="#fff2df" stroke-width="${18 * scale}" opacity="0.42"/>
    <path d="M${x + 370 * scale} ${y + 25 * scale} V${y + 360 * scale}" stroke="${ribbon}" stroke-width="${52 * scale}"/>
    <path d="M${x + 245 * scale} ${y + 55 * scale} C${x + 310 * scale} ${y - 45 * scale} ${x + 365 * scale} ${y + 40 * scale} ${x + 370 * scale} ${y + 70 * scale} C${x + 418 * scale} ${y - 35 * scale} ${x + 505 * scale} ${y + 18 * scale} ${x + 480 * scale} ${y + 112 * scale}" fill="${ribbon}"/>
  `;
}

function magazine(x, y, scale, cover, accent) {
  return `
    <g transform="rotate(-7 ${x + 360 * scale} ${y + 250 * scale})">
      <rect x="${x}" y="${y}" width="${720 * scale}" height="${920 * scale}" rx="${45 * scale}" fill="#ffffff"/>
      <rect x="${x + 42 * scale}" y="${y + 54 * scale}" width="${636 * scale}" height="${360 * scale}" rx="${30 * scale}" fill="${cover}"/>
      <text x="${x + 80 * scale}" y="${y + 135 * scale}" fill="#fffaf5" font-family="Georgia,serif" font-size="${64 * scale}" font-weight="700">IKSHA</text>
      <rect x="${x + 78 * scale}" y="${y + 480 * scale}" width="${480 * scale}" height="${35 * scale}" rx="${16 * scale}" fill="${accent}"/>
      <rect x="${x + 78 * scale}" y="${y + 555 * scale}" width="${570 * scale}" height="${28 * scale}" rx="${14 * scale}" fill="#d8c9bd"/>
      <rect x="${x + 78 * scale}" y="${y + 615 * scale}" width="${510 * scale}" height="${28 * scale}" rx="${14 * scale}" fill="#d8c9bd"/>
      <rect x="${x + 78 * scale}" y="${y + 710 * scale}" width="${250 * scale}" height="${135 * scale}" rx="${25 * scale}" fill="${accent}" opacity="0.7"/>
      <rect x="${x + 370 * scale}" y="${y + 710 * scale}" width="${250 * scale}" height="${135 * scale}" rx="${25 * scale}" fill="${cover}" opacity="0.72"/>
    </g>
  `;
}

function renderProduct(product) {
  const [bg, primary, accent, deep] = product.palette;
  const title = product.name.replace("&", "&amp;");
  let art = "";

  if (product.kind.includes("watch")) {
    if (product.kind.includes("couple")) {
      art = `${watch(960, 585, 1.55, deep, accent, "#fffaf4")}${watch(1810, 585, 1.35, primary, accent, "#fffaf4")}`;
    } else {
      art = watch(1310, 540, 1.9, deep, accent, "#fffaf4");
    }
  } else if (product.kind.includes("bouquet")) {
    const count = product.kind.includes("large") ? 20 : 11;
    const flowers = Array.from({ length: count }, (_, index) => {
      const row = Math.floor(index / 5);
      const col = index % 5;
      const cx = 1260 + col * 235 + (row % 2) * 80;
      const cy = 520 + row * 190;
      return flower(
        cx,
        cy,
        product.kind.includes("large") ? 118 : 96,
        index % 2 ? primary : accent,
        deep,
      );
    }).join("");
    art = `
      <path d="M1550 1170 L1280 1765 H2200 L1930 1170 Z" fill="${primary}" opacity="0.95"/>
      <path d="M1550 1170 L2200 1765" stroke="#fff7ef" stroke-width="30" opacity="0.5"/>
      <path d="M1930 1170 L1280 1765" stroke="#fff7ef" stroke-width="30" opacity="0.5"/>
      ${flowers}
      <path d="M1570 1670 C1740 1575 1905 1575 2070 1670" fill="none" stroke="${deep}" stroke-width="52" stroke-linecap="round"/>
    `;
  } else if (product.kind.includes("hamper")) {
    art = hamper(
      1180,
      900,
      product.kind.includes("large") ? 1.45 : 1.25,
      primary,
      accent,
      deep,
      product.kind.includes("large"),
    );
  } else if (product.kind.includes("magazine")) {
    art = magazine(1290, 565, 1.08, primary, accent);
  } else if (product.kind.includes("bracelet")) {
    if (product.kind.includes("couple")) {
      art = `${bracelet(1470, 1080, 410, 250, primary, accent, 20)}${bracelet(2020, 1075, 390, 240, deep, accent, 20)}`;
    } else {
      art = bracelet(1730, 1090, 520, 315, primary, accent, 24);
    }
  }

  return `
    <svg xmlns="http://www.w3.org/2000/svg" width="3840" height="2160" viewBox="0 0 3840 2160">
      <defs>
        <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stop-color="${bg}"/>
          <stop offset="0.58" stop-color="#fffaf4"/>
          <stop offset="1" stop-color="${accent}" stop-opacity="0.55"/>
        </linearGradient>
        <filter id="shadow" x="-20%" y="-20%" width="140%" height="150%">
          <feDropShadow dx="0" dy="45" stdDeviation="38" flood-color="#2e2320" flood-opacity="0.18"/>
        </filter>
      </defs>
      <rect width="3840" height="2160" fill="url(#bg)"/>
      <circle cx="3320" cy="360" r="330" fill="${accent}" opacity="0.24"/>
      <circle cx="520" cy="1840" r="420" fill="${primary}" opacity="0.16"/>
      <path d="M0 1780 C850 1510 1380 1990 2260 1715 C2860 1526 3260 1590 3840 1360 V2160 H0 Z" fill="#ffffff" opacity="0.45"/>
      <g filter="url(#shadow)">
        <ellipse cx="1900" cy="1765" rx="925" ry="110" fill="#2e2320" opacity="0.12"/>
        ${art}
      </g>
      <rect x="168" y="150" width="980" height="310" rx="44" fill="#fffaf4" opacity="0.86"/>
      <text x="240" y="270" fill="#8b6f5a" font-family="Arial,sans-serif" font-size="40" font-weight="700" letter-spacing="10">IKSHA GIFTS</text>
      <text x="240" y="372" fill="#2e2320" font-family="Georgia,serif" font-size="78" font-weight="700">${title}</text>
      <text x="240" y="430" fill="#8b6f5a" font-family="Arial,sans-serif" font-size="34">Premium gifting preview image</text>
    </svg>
  `;
}

await fs.mkdir(outDir, { recursive: true });

for (const product of products) {
  const svg = renderProduct(product);
  const out = path.join(outDir, `${product.id}.jpg`);
  await sharp(Buffer.from(svg)).jpeg({ quality: 86, mozjpeg: true }).toFile(out);
  console.log(out);
}
