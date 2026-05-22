// Saree catalog — sourced from C:/Users/shiva/Work/Projects/ilkalKart/testing_sarees
// via the `sarees-catalog` Vite plugin. Each folder = one design;
// each color subfolder = one product card. Every filterable attribute is
// derived directly from the raw fields in details.txt — nothing is hardcoded.
import catalog from 'virtual:sarees-catalog';

// Eight fixed photo slots per saree, grouped into four sections.
export const PHOTO_SLOTS = [
  { key: 'full',        group: 'Saree',  label: 'Full saree',  angle: 'Full saree',   file: 'full' },
  { key: 'folded',      group: 'Saree',  label: 'Folded',      angle: 'Folded',       file: 'extra' },
  { key: 'blouseClose', group: 'Blouse', label: 'Close-up',    angle: 'Blouse — close', file: 'blouse_c' },
  { key: 'blouseFar',   group: 'Blouse', label: 'Far view',    angle: 'Blouse — far',   file: 'blouse_f' },
  { key: 'borderClose', group: 'Border', label: 'Close-up',    angle: 'Border — close', file: 'border_c' },
  { key: 'borderFar',   group: 'Border', label: 'Far view',    angle: 'Border — far',   file: 'border_f' },
  { key: 'palluClose',  group: 'Pallu',  label: 'Close-up',    angle: 'Pallu — close',  file: 'pallu_c' },
  { key: 'palluFar',    group: 'Pallu',  label: 'Far view',    angle: 'Pallu — far',    file: 'pallu_f' }
];

export const PHOTO_GROUPS = ['Saree', 'Blouse', 'Border', 'Pallu'];

const cap = (s) => s ? s.charAt(0).toUpperCase() + s.slice(1).toLowerCase() : s;
const tidy = (v) => (v || '').replace(/\s+/g, ' ').trim();

function buildGallery(code, color) {
  return PHOTO_SLOTS.map(slot => ({
    src: `/sarees-img/${encodeURIComponent(code)}/${encodeURIComponent(color)}/${color}_${slot.file}.jpg`,
    angle: slot.angle,
    label: slot.label,
    group: slot.group,
    key:   slot.key
  }));
}

function buildSarees() {
  const out = [];
  let seed = 0;
  for (const entry of catalog) {
    const { code, details, colors } = entry;
    const material = tidy(details.material);
    const border   = tidy(details.border);
    const pallu    = tidy(details.pallu);
    const blouse   = tidy(details.blouse);
    const handloom = tidy(details.handloom);
    const lengthM  = tidy(details.length);   // raw value from details.txt, e.g. "6.2"
    const cost     = details.price > 0 ? details.price : 0;
    const price    = cost > 0 ? Math.ceil((cost * 1.40) / 100) * 100 - 1 : 0;
    const mrp      = price > 0 ? Math.ceil((price * 1.25) / 100) * 100 - 1 : 0;
    const baseName = (details.name && details.name.length > 2)
      ? tidy(details.name)
      : `Ilkal ${code}`;

    for (const color of colors) {
      seed += 1;
      const gallery = buildGallery(code, color);
      const photos  = Object.fromEntries(gallery.map(g => [g.key, g.src]));
      const rating  = Math.min(5, 4.4 + (((seed * 13) % 7) / 10));

      out.push({
        id: `${code}-${color}`,
        seed,
        code,
        name: baseName,
        color: cap(color),
        colorRaw: color.toLowerCase(),

        // raw fields straight from details.txt — these are what filters use
        material,
        border,
        pallu,
        blouse,
        handloom,
        lengthM,
        length: lengthM ? `${lengthM} m` : '',

        price,
        mrp,
        discount: mrp > price ? Math.round((1 - price / mrp) * 100) : 0,
        rating: Math.round(rating * 10) / 10,

        desc: [
          `${baseName} in ${cap(color)}.`,
          material && `Body: ${material}.`,
          border   && `Border: ${border}.`,
          pallu    && `Pallu: ${pallu}.`,
          blouse   && `Blouse: ${blouse}.`,
          handloom && `Handloom: ${handloom}.`
        ].filter(Boolean).join(' '),

        gallery,
        photos,
        images: gallery.map(g => g.src)
      });
    }
  }
  return out;
}

export const sarees = buildSarees();

// --- Facets derived from the data itself ---------------------------------
const uniqueSorted = (values) => Array.from(new Set(values.filter(Boolean))).sort();

export const MATERIALS = uniqueSorted(sarees.map(s => s.material));
export const BORDERS   = uniqueSorted(sarees.map(s => s.border));
export const PALLUS    = uniqueSorted(sarees.map(s => s.pallu));
export const BLOUSES   = uniqueSorted(sarees.map(s => s.blouse));
export const HANDLOOMS = uniqueSorted(sarees.map(s => s.handloom));
export const LENGTHS   = uniqueSorted(sarees.map(s => s.lengthM));
export const COLORS    = uniqueSorted(sarees.map(s => s.color));

// Dynamic price buckets based on the actual catalogue price range.
function buildPriceBuckets(list) {
  const prices = list.map(s => s.price).filter(p => p > 0);
  if (prices.length === 0) return [];
  const min = Math.min(...prices);
  const max = Math.max(...prices);
  if (max <= min) return [{ label: `Up to ₹${max.toLocaleString('en-IN')}`, min: 0, max }];
  const step = Math.ceil((max - min) / 4 / 100) * 100;
  const edges = [min, min + step, min + 2 * step, min + 3 * step, max + 1];
  const fmt = (n) => `₹${Math.round(n).toLocaleString('en-IN')}`;
  return [
    { label: `Under ${fmt(edges[1])}`,                       min: 0,        max: edges[1] - 1 },
    { label: `${fmt(edges[1])} – ${fmt(edges[2] - 1)}`,      min: edges[1], max: edges[2] - 1 },
    { label: `${fmt(edges[2])} – ${fmt(edges[3] - 1)}`,      min: edges[2], max: edges[3] - 1 },
    { label: `${fmt(edges[3])} & above`,                     min: edges[3], max: 999999 }
  ];
}

export const PRICE_BUCKETS = buildPriceBuckets(sarees);

export const heroMedia = (sarees.length > 0
  ? [0, 1, 2].map(i => sarees[i % sarees.length])
  : []
).map(s => ({
  type: 'image',
  src: s.gallery[0].src,
  caption: `${s.name} — woven with pride.`
}));
