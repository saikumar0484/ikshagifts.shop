import { db } from "./db.js";

export type CatalogItem = {
  id: string;
  name: string;
  price: number;
  category?: string;
  categorySlug?: ProductCategory;
  collection?: "women" | "men" | "custom";
  tag?: string;
  desc?: string;
  imageUrl?: string;
  oldPrice?: number | null;
  rating?: number;
  delivery?: string;
  stockQuantity?: number;
  isAvailable?: boolean;
};

export const productCategories = [
  { value: "women", label: "Women", collection: "women" as const },
  { value: "men", label: "Men", collection: "men" as const },
  { value: "customized_gifts", label: "Customized Gifts", collection: "custom" as const },
] as const;

export type ProductCategory = (typeof productCategories)[number]["value"];

export function isProductCategory(value: string): value is ProductCategory {
  return productCategories.some((category) => category.value === value);
}

export function categoryLabel(value: string) {
  return productCategories.find((category) => category.value === value)?.label || value;
}

export function categoryCollection(value: string) {
  return productCategories.find((category) => category.value === value)?.collection || "custom";
}

function placeholderImage(label: string) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="600" viewBox="0 0 600 600"><rect width="600" height="600" rx="48" fill="#f7eadc"/><circle cx="456" cy="128" r="74" fill="#d9b27c" opacity="0.55"/><circle cx="142" cy="458" r="94" fill="#b9825e" opacity="0.22"/><rect x="120" y="152" width="360" height="296" rx="34" fill="#fffaf4" stroke="#8c5b43" stroke-width="8"/><path d="M166 372c42-58 71-86 112-48 20 18 35 40 63 24 28-17 42-59 93-34" fill="none" stroke="#8c5b43" stroke-width="16" stroke-linecap="round"/><text x="300" y="504" text-anchor="middle" font-family="Arial, sans-serif" font-size="38" font-weight="700" fill="#4b3024">${label}</text></svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

export const fallbackCatalog: CatalogItem[] = [
  {
    id: "bracelet",
    name: "Stylish Bracelet",
    price: 5000,
    oldPrice: 6000,
    categorySlug: "women",
    category: "Women",
    collection: "women",
    tag: "New",
    desc: "A trendy bracelet designed to elevate your everyday look with elegance and charm.",
    imageUrl: placeholderImage("Bracelet"),
  },
  {
    id: "couple-watches",
    name: "Premium Couple Watches",
    price: 5000,
    oldPrice: 6000,
    categorySlug: "customized_gifts",
    category: "Customized Gifts",
    collection: "custom",
    tag: "Couple",
    desc: "A perfect matching watch set for couples, symbolizing love and timeless bonding.",
    imageUrl: placeholderImage("Couple Watches"),
  },
  {
    id: "couple-bracelets",
    name: "Couple Bracelets Set",
    price: 5000,
    oldPrice: 6000,
    categorySlug: "customized_gifts",
    category: "Customized Gifts",
    collection: "custom",
    tag: "Couple",
    desc: "Beautiful matching bracelets crafted for couples to celebrate their connection.",
    imageUrl: placeholderImage("Couple Bracelets"),
  },
  {
    id: "women-watch",
    name: "Elegant Women Watch",
    price: 5000,
    oldPrice: 6000,
    categorySlug: "women",
    category: "Women",
    collection: "women",
    tag: "Elegant",
    desc: "A stylish and modern watch designed for women who love sophistication.",
    imageUrl: placeholderImage("Women Watch"),
  },
  {
    id: "men-watch",
    name: "Classic Men Watch",
    price: 5000,
    oldPrice: 6000,
    categorySlug: "men",
    category: "Men",
    collection: "men",
    tag: "Classic",
    desc: "A bold and classy watch built for men who appreciate timeless fashion.",
    imageUrl: placeholderImage("Men Watch"),
  },
  {
    id: "small-bouquet",
    name: "Small Flower Bouquet",
    price: 5000,
    oldPrice: 6000,
    categorySlug: "customized_gifts",
    category: "Customized Gifts",
    collection: "custom",
    tag: "Bouquet",
    desc: "A cute bouquet arrangement perfect for small surprises and sweet moments.",
    imageUrl: placeholderImage("Small Bouquet"),
  },
  {
    id: "large-bouquet",
    name: "Grand Flower Bouquet",
    price: 5000,
    oldPrice: 6000,
    categorySlug: "customized_gifts",
    category: "Customized Gifts",
    collection: "custom",
    tag: "Bouquet",
    desc: "A luxurious bouquet designed to make every occasion extra special.",
    imageUrl: placeholderImage("Large Bouquet"),
  },
  {
    id: "small-hamper",
    name: "Small Gift Hamper",
    price: 5000,
    oldPrice: 6000,
    categorySlug: "customized_gifts",
    category: "Customized Gifts",
    collection: "custom",
    tag: "Hamper",
    desc: "A compact hamper filled with delightful surprises for your loved ones.",
    imageUrl: placeholderImage("Small Hamper"),
  },
  {
    id: "large-hamper",
    name: "Luxury Gift Hamper",
    price: 5000,
    oldPrice: 6000,
    categorySlug: "customized_gifts",
    category: "Customized Gifts",
    collection: "custom",
    tag: "Hamper",
    desc: "A premium hamper packed with exclusive gifts to impress and delight.",
    imageUrl: placeholderImage("Large Hamper"),
  },
  {
    id: "magazine-gift",
    name: "Customized Magazine Gift",
    price: 5000,
    oldPrice: 6000,
    categorySlug: "customized_gifts",
    category: "Customized Gifts",
    collection: "custom",
    tag: "Custom",
    desc: "A unique magazine-style gift designed to capture memories creatively.",
    imageUrl: placeholderImage("Magazine Gift"),
  },
  {
    id: "women-couple-bracelet",
    name: "Women Couple Bracelet",
    price: 5000,
    oldPrice: 6000,
    categorySlug: "women",
    category: "Women",
    collection: "women",
    tag: "Couple",
    desc: "A stylish bracelet specially crafted for women in a couple set.",
    imageUrl: placeholderImage("Women Bracelet"),
  },
  {
    id: "men-couple-bracelet",
    name: "Men Couple Bracelet",
    price: 5000,
    oldPrice: 6000,
    categorySlug: "men",
    category: "Men",
    collection: "men",
    tag: "Couple",
    desc: "A bold and elegant bracelet designed for men in a couple set.",
    imageUrl: placeholderImage("Men Bracelet"),
  },
  {
    id: "women-couple-watches",
    name: "Women Couple Watches",
    price: 5000,
    oldPrice: 6000,
    categorySlug: "women",
    category: "Women",
    collection: "women",
    tag: "Couple",
    desc: "A beautifully designed watch set perfect for couples who love matching styles.",
    imageUrl: placeholderImage("Women Couple Watches"),
  },
];

export type CartLine = {
  productId: string;
  quantity: number;
};

export type ProductRow = {
  id: string;
  name: string;
  category: string;
  tag: string;
  description: string;
  image_url: string | null;
  price: number;
  old_price: number | null;
  rating: number;
  delivery: string;
  stock_quantity: number;
  is_available: boolean;
  is_featured: boolean;
  sort_order: number;
  created_at?: string;
  updated_at?: string;
};

export function normalizeProduct(row: ProductRow): CatalogItem {
  return {
    id: row.id,
    name: row.name,
    category: categoryLabel(row.category),
    categorySlug: isProductCategory(row.category) ? row.category : "customized_gifts",
    collection: categoryCollection(row.category),
    tag: row.tag,
    desc: row.description,
    imageUrl: row.image_url || undefined,
    price: Number(row.price) || 0,
    oldPrice: row.old_price,
    rating: Number(row.rating) || 4.8,
    delivery: row.delivery,
    stockQuantity: Number(row.stock_quantity) || 0,
    isAvailable: row.is_available,
  };
}

export async function getCatalog(category?: ProductCategory) {
  try {
    const rows = category
      ? await db.selectMany<ProductRow>(
          "products",
          { category },
          { order: "sort_order.asc,name.asc" },
        )
      : await db.list<ProductRow>("products", { order: "sort_order.asc,name.asc" });
    if (rows.length) return rows.map(normalizeProduct);
  } catch {
    return category
      ? fallbackCatalog.filter((product) => product.categorySlug === category)
      : fallbackCatalog;
  }
  return category
    ? fallbackCatalog.filter((product) => product.categorySlug === category)
    : fallbackCatalog;
}

export async function priceCart(items: CartLine[]) {
  const catalog = await getCatalog();
  const lines = items.map((line) => {
    const product = catalog.find((item) => item.id === line.productId);
    const quantity = Math.max(1, Math.min(Number(line.quantity) || 1, 25));
    if (!product) {
      throw new Error(`Unknown product: ${line.productId}`);
    }
    if (product.isAvailable === false || (product.stockQuantity ?? 1) <= 0) {
      throw new Error(`${product.name} is currently unavailable.`);
    }
    if (product.stockQuantity !== undefined && quantity > product.stockQuantity) {
      throw new Error(`Only ${product.stockQuantity} ${product.name} left in stock.`);
    }
    return {
      productId: product.id,
      name: product.name,
      quantity,
      unitPrice: product.price,
      lineTotal: product.price * quantity,
    };
  });

  return {
    lines,
    total: lines.reduce((sum, line) => sum + line.lineTotal, 0),
  };
}
