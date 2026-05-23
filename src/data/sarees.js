import { uploadsUrl } from "../utils/api.js";

export const PHOTO_SLOTS = [
  { key: "full",        group: "Saree",  label: "Full saree", angle: "Full saree",     file: "full" },
  { key: "folded",      group: "Saree",  label: "Folded",     angle: "Folded",         file: "extra" },
  { key: "blouseClose", group: "Blouse", label: "Close-up",   angle: "Blouse — close", file: "blouse_c" },
  { key: "blouseFar",   group: "Blouse", label: "Far view",   angle: "Blouse — far",   file: "blouse_f" },
  { key: "borderClose", group: "Border", label: "Close-up",   angle: "Border — close", file: "border_c" },
  { key: "borderFar",   group: "Border", label: "Far view",   angle: "Border — far",   file: "border_f" },
  { key: "palluClose",  group: "Pallu",  label: "Close-up",   angle: "Pallu — close",  file: "pallu_c" },
  { key: "palluFar",    group: "Pallu",  label: "Far view",   angle: "Pallu — far",    file: "pallu_f" },
];

export const PHOTO_GROUPS = ["Saree", "Blouse", "Border", "Pallu"];

const cap = (s) =>
  s ? s.charAt(0).toUpperCase() + s.slice(1).toLowerCase() : s;
const tidy = (v) => (v || "").toString().replace(/\s+/g, " ").trim();

function buildGallery(apiImages = []) {
  return apiImages.map((img, i) => {
    const url = typeof img === "string" ? img : img?.url;
    const name = typeof img === "string"
      ? (url.split("/").pop() || `photo-${i}`)
      : img?.name;
    const base = String(name || "").replace(/\.[^.]+$/, "").toLowerCase();
    const slot = PHOTO_SLOTS.find((s) => base.endsWith(s.file));
    return {
      src: uploadsUrl(url),
      name,
      angle: slot?.angle || `Photo ${i + 1}`,
      label: slot?.label || `Photo ${i + 1}`,
      group: slot?.group || "Saree",
      key: slot?.key || `img-${i}`,
    };
  });
}

function buildGalleryFromFiles(filePaths = []) {
  return filePaths.map((p, i) => {
    const fileName = String(p).split("/").pop() || `photo-${i}`;
    const base = fileName.replace(/\.[^.]+$/, "").toLowerCase();
    const slot = PHOTO_SLOTS.find((s) => base.endsWith(s.file));
    return {
      src: uploadsUrl(p),
      name: fileName,
      angle: slot?.angle || `Photo ${i + 1}`,
      label: slot?.label || `Photo ${i + 1}`,
      group: slot?.group || "Saree",
      key: slot?.key || `img-${i}`,
    };
  });
}

export function mapProductToSaree(p) {
  const colorRaw = tidy(p.color).toLowerCase();
  const imgDir = tidy(p.img_directory);
  const videoDir = tidy(p.video_directory);
  const gallery = Array.isArray(p.img_files) && p.img_files.length > 0
    ? buildGalleryFromFiles(p.img_files)
    : buildGallery(p.images || []);
  const photos = Object.fromEntries(gallery.map((g) => [g.key, g.src]));
  const videos = (p.videos || []).map((v) => ({
    name: v.name,
    src: uploadsUrl(v.url),
  }));

  const price = Number(p.base_price) || Number(p.act_price) || 0;
  const mrp = Number(p.comparable_price) || 0;
  const material = tidy(p.material);
  const border = tidy(p.border);
  const pallu = tidy(p.pallu);
  const blouse = tidy(p.blouse);
  const typeName = tidy(p.type_name);
  const name = tidy(p.title) || typeName || `Ilkal ${p.combined_code || p.id}`;
  const seed = Number(p.id) || 0;
  const rating = Number(p.ratings) || 0;
  const lengthM = Number(p.dimension_length) || "";

  return {
    id: p.id ?? `${p.combined_code}-${seed}`,
    seed,
    code: tidy(p.combined_code),
    sareeCode: p.inventory_id,
    inventoryId: p.inventory_id,
    name,
    typeName,
    color: cap(p.color) || cap(colorRaw),
    colorRaw,
    colorCode: tidy(p.color_code),

    material,
    border,
    pallu,
    blouse,
    materialCode: tidy(p.material_code),
    borderCode: tidy(p.border_code),
    palluCode: tidy(p.pallu_code),
    blouseCode: tidy(p.blouse_code),
    handloom: p.handloom ? "Handloom" : "",
    isHandloom: Boolean(p.handloom),
    lengthM,
    length: lengthM ? `${lengthM} m` : "",
    width: Number(p.dimension_width) || 0,
    thickness: Number(p.dimension_thickness) || 0,

    price,
    mrp,
    discount: mrp > price ? Math.round((1 - price / mrp) * 100) : 0,
    rating,
    popular: Boolean(p.popularity_status),
    trending: Boolean(p.trending_status),

    desc: [
      `${name} in ${cap(p.color) || cap(colorRaw)}.`,
      tidy(p.description1),
      tidy(p.description2),
      material && `Body: ${material}.`,
      border && `Border: ${border}.`,
      pallu && `Pallu: ${pallu}.`,
      blouse && `Blouse: ${blouse}.`,
    ]
      .filter(Boolean)
      .join(" "),

    status: "",
    statusCode: "",
    stockMessage: tidy(p.custom_message),
    quantity: Number(p.quantity) || 0,
    imgDirectory: imgDir,
    videoDirectory: videoDir,

    gallery,
    photos,
    images: gallery.map((g) => g.src),
    videos,
  };
}

const uniqueSorted = (values) =>
  Array.from(new Set(values.filter(Boolean))).sort();

export const facetsOf = (list) => ({
  MATERIALS: uniqueSorted(list.map((s) => s.material)),
  BORDERS: uniqueSorted(list.map((s) => s.border)),
  PALLUS: uniqueSorted(list.map((s) => s.pallu)),
  BLOUSES: uniqueSorted(list.map((s) => s.blouse)),
  HANDLOOMS: uniqueSorted(list.map((s) => s.handloom)),
  LENGTHS: uniqueSorted(list.map((s) => s.lengthM)),
  COLORS: uniqueSorted(list.map((s) => s.color)),
});

export function buildPriceBuckets(list) {
  const prices = list.map((s) => s.price).filter((p) => p > 0);
  if (prices.length === 0) return [];
  const min = Math.min(...prices);
  const max = Math.max(...prices);
  if (max <= min)
    return [{ label: `Up to ₹${max.toLocaleString("en-IN")}`, min: 0, max }];
  const step = Math.ceil((max - min) / 4 / 100) * 100;
  const edges = [min, min + step, min + 2 * step, min + 3 * step, max + 1];
  const fmt = (n) => `₹${Math.round(n).toLocaleString("en-IN")}`;
  return [
    { label: `Under ${fmt(edges[1])}`, min: 0, max: edges[1] - 1 },
    {
      label: `${fmt(edges[1])} – ${fmt(edges[2] - 1)}`,
      min: edges[1],
      max: edges[2] - 1,
    },
    {
      label: `${fmt(edges[2])} – ${fmt(edges[3] - 1)}`,
      min: edges[2],
      max: edges[3] - 1,
    },
    { label: `${fmt(edges[3])} & above`, min: edges[3], max: 999999 },
  ];
}

export const heroMediaOf = (list) =>
  (list.length > 0 ? [0, 1, 2].map((i) => list[i % list.length]) : [])
    .filter((s) => s?.gallery?.length > 0)
    .map((s) => ({
      type: "image",
      src: s.gallery[0].src,
      caption: `${s.name} — woven with pride.`,
    }));
