import { db } from "./db.js";

export type CatalogItem = {
  id: string;
  name: string;
  price: number;
  category?: string;
  tag?: string;
  desc?: string;
  imageUrl?: string;
  oldPrice?: number | null;
  rating?: number;
  delivery?: string;
  stockQuantity?: number;
  isAvailable?: boolean;
};

export const fallbackCatalog: CatalogItem[] = [
  { id: "forever-bouquet", name: "Forever Bouquet", price: 1200 },
  { id: "sweet-pea-bow", name: "Sweet Pea Bow", price: 250 },
  { id: "pocket-pals", name: "Pocket Pals", price: 350 },
  { id: "blue-lily", name: "Blue Lily Stem", price: 420 },
  { id: "bunny-charm", name: "Bunny Charm", price: 520 },
  { id: "sunny-stem", name: "Sunny Stem", price: 480 },
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
    category: row.category,
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

export async function getCatalog() {
  try {
    const rows = await db.list<ProductRow>("products", { order: "sort_order.asc,name.asc" });
    if (rows.length) return rows.map(normalizeProduct);
  } catch {
    return fallbackCatalog;
  }
  return fallbackCatalog;
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
