import { uploadsUrl } from '../utils/api.js';

export const PHOTO_SLOTS = [
  { key: 'full',        group: 'Saree',  label: 'Full saree', angle: 'Full saree',     file: 'full' },
  { key: 'folded',      group: 'Saree',  label: 'Folded',     angle: 'Folded',         file: 'extra' },
  { key: 'blouseClose', group: 'Blouse', label: 'Close-up',   angle: 'Blouse — close', file: 'blouse_c' },
  { key: 'blouseFar',   group: 'Blouse', label: 'Far view',   angle: 'Blouse — far',   file: 'blouse_f' },
  { key: 'borderClose', group: 'Border', label: 'Close-up',   angle: 'Border — close', file: 'border_c' },
  { key: 'borderFar',   group: 'Border', label: 'Far view',   angle: 'Border — far',   file: 'border_f' },
  { key: 'palluClose',  group: 'Pallu',  label: 'Close-up',   angle: 'Pallu — close',  file: 'pallu_c' },
  { key: 'palluFar',    group: 'Pallu',  label: 'Far view',   angle: 'Pallu — far',    file: 'pallu_f' }
];

export const PHOTO_GROUPS = ['Saree', 'Blouse', 'Border', 'Pallu'];

const cap = (s) => (s ? s.charAt(0).toUpperCase() + s.slice(1).toLowerCase() : s);
const tidy = (v) => (v || '').toString().replace(/\s+/g, ' ').trim();

const buildGallery = (imgDir, colorRaw) =>
  PHOTO_SLOTS.map((slot) => ({
    src: uploadsUrl(`${imgDir}/${colorRaw}_${slot.file}.jpg`),
    angle: slot.angle,
    label: slot.label,
    group: slot.group,
    key: slot.key,
  }));

export function mapProductToSaree(p) {
  const colorRaw = tidy(p.color).toLowerCase();
  const imgDir = tidy(p.img_directory);
  const gallery = buildGallery(imgDir, colorRaw);
  const photos = Object.fromEntries(gallery.map((g) => [g.key, g.src]));

  const price = Number(p.base_price) || 0;
  const mrp = price > 0 ? Math.ceil((price * 1.25) / 100) * 100 - 1 : 0;
  const material = tidy(p.material);
  const border = tidy(p.border);
  const pallu = tidy(p.pallu);
  const blouse = tidy(p.blouse);
  const name = tidy(p.sub_category) || tidy(p.category_name) || `Ilkal ${p.inventory_element_code}`;
  const seed = Number(p.sequence_number) || 0;
  const rating = Math.round((4.4 + ((seed * 13) % 7) / 10) * 10) / 10;

  return {
    id: p.saree_code || `${p.inventory_element_code}-${colorRaw}-${p.sequence_number}`,
    seed,
    code: p.inventory_element_code,
    sareeCode: p.saree_code,
    name,
    color: cap(colorRaw),
    colorRaw,

    material,
    border,
    pallu,
    blouse,
    handloom: '',
    lengthM: '',
    length: '',

    price,
    mrp,
    discount: mrp > price ? Math.round((1 - price / mrp) * 100) : 0,
    rating: Math.min(5, rating),

    desc: [
      `${name} in ${cap(colorRaw)}.`,
      material && `Body: ${material}.`,
      border && `Border: ${border}.`,
      pallu && `Pallu: ${pallu}.`,
      blouse && `Blouse: ${blouse}.`,
      tidy(p.ie_description1),
      tidy(p.ie_description2),
    ].filter(Boolean).join(' '),

    status: tidy(p.saree_status_title),
    statusCode: tidy(p.saree_status_code),
    stockMessage: tidy(p.out_of_stock_message),
    quantity: Number(p.total_quantity) || 0,
    imgDirectory: imgDir,
    videoDirectory: tidy(p.video_directory),

    gallery,
    photos,
    images: gallery.map((g) => g.src),
  };
}

const uniqueSorted = (values) => Array.from(new Set(values.filter(Boolean))).sort();

export const facetsOf = (list) => ({
  MATERIALS: uniqueSorted(list.map((s) => s.material)),
  BORDERS:   uniqueSorted(list.map((s) => s.border)),
  PALLUS:    uniqueSorted(list.map((s) => s.pallu)),
  BLOUSES:   uniqueSorted(list.map((s) => s.blouse)),
  HANDLOOMS: uniqueSorted(list.map((s) => s.handloom)),
  LENGTHS:   uniqueSorted(list.map((s) => s.lengthM)),
  COLORS:    uniqueSorted(list.map((s) => s.color)),
});

export function buildPriceBuckets(list) {
  const prices = list.map((s) => s.price).filter((p) => p > 0);
  if (prices.length === 0) return [];
  const min = Math.min(...prices);
  const max = Math.max(...prices);
  if (max <= min) return [{ label: `Up to ₹${max.toLocaleString('en-IN')}`, min: 0, max }];
  const step = Math.ceil((max - min) / 4 / 100) * 100;
  const edges = [min, min + step, min + 2 * step, min + 3 * step, max + 1];
  const fmt = (n) => `₹${Math.round(n).toLocaleString('en-IN')}`;
  return [
    { label: `Under ${fmt(edges[1])}`,                    min: 0,        max: edges[1] - 1 },
    { label: `${fmt(edges[1])} – ${fmt(edges[2] - 1)}`,   min: edges[1], max: edges[2] - 1 },
    { label: `${fmt(edges[2])} – ${fmt(edges[3] - 1)}`,   min: edges[2], max: edges[3] - 1 },
    { label: `${fmt(edges[3])} & above`,                  min: edges[3], max: 999999 },
  ];
}

export const heroMediaOf = (list) =>
  (list.length > 0 ? [0, 1, 2].map((i) => list[i % list.length]) : []).map((s) => ({
    type: 'image',
    src: s.gallery[0].src,
    caption: `${s.name} — woven with pride.`,
  }));
