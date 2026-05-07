export type ProductCollection = "women" | "men" | "custom";
export type ProductCategory = "women" | "men" | "customized_gifts";

export const productCategories: Array<{
  value: ProductCategory;
  label: string;
  collection: ProductCollection;
}> = [
  { value: "women", label: "Women", collection: "women" },
  { value: "men", label: "Men", collection: "men" },
  { value: "customized_gifts", label: "Customized Gifts", collection: "custom" },
];

export const categoryToCollection: Record<ProductCategory, ProductCollection> = {
  women: "women",
  men: "men",
  customized_gifts: "custom",
};

export const collectionToCategory: Record<ProductCollection, ProductCategory> = {
  women: "women",
  men: "men",
  custom: "customized_gifts",
};

export function isProductCategory(value: string): value is ProductCategory {
  return productCategories.some((category) => category.value === value);
}

export function categoryLabel(value: string) {
  return productCategories.find((category) => category.value === value)?.label || value;
}

export function placeholderImage(label: string) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="600" viewBox="0 0 600 600"><rect width="600" height="600" rx="48" fill="#f7eadc"/><circle cx="456" cy="128" r="74" fill="#d9b27c" opacity="0.55"/><circle cx="142" cy="458" r="94" fill="#b9825e" opacity="0.22"/><rect x="120" y="152" width="360" height="296" rx="34" fill="#fffaf4" stroke="#8c5b43" stroke-width="8"/><path d="M166 372c42-58 71-86 112-48 20 18 35 40 63 24 28-17 42-59 93-34" fill="none" stroke="#8c5b43" stroke-width="16" stroke-linecap="round"/><text x="300" y="504" text-anchor="middle" font-family="Arial, sans-serif" font-size="38" font-weight="700" fill="#4b3024">${label}</text></svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

export type Product = {
  id: string;
  name: string;
  category: string;
  categorySlug?: ProductCategory;
  collection: ProductCollection;
  tag: string;
  desc: string;
  image: string;
  imageUrl?: string;
  cartUrl: string;
  price: number;
  oldPrice?: number;
  rating: number;
  delivery: string;
  stockQuantity?: number;
  isAvailable?: boolean;
  isFeatured?: boolean;
  isBestSeller?: boolean;
  sortOrder?: number;
};

export const products: Product[] = [
  {
    id: "bracelet",
    name: "Stylish Bracelet",
    category: "Women",
    categorySlug: "women",
    collection: "women",
    tag: "New",
    desc: "A trendy bracelet designed to elevate your everyday look with elegance and charm.",
    image: placeholderImage("Bracelet"),
    cartUrl: "/cart/add/bracelet",
    price: 5000,
    oldPrice: 6000,
    rating: 4.8,
    delivery: "",
    isFeatured: true,
    isBestSeller: true,
    sortOrder: 10,
  },
  {
    id: "couple-watches",
    name: "Premium Couple Watches",
    category: "Customized Gifts",
    categorySlug: "customized_gifts",
    collection: "custom",
    tag: "Couple",
    desc: "A perfect matching watch set for couples, symbolizing love and timeless bonding.",
    image: placeholderImage("Couple Watches"),
    cartUrl: "/cart/add/couple-watches",
    price: 5000,
    oldPrice: 6000,
    rating: 4.8,
    delivery: "",
    isFeatured: true,
    isBestSeller: true,
    sortOrder: 20,
  },
  {
    id: "couple-bracelets",
    name: "Couple Bracelets Set",
    category: "Customized Gifts",
    categorySlug: "customized_gifts",
    collection: "custom",
    tag: "Couple",
    desc: "Beautiful matching bracelets crafted for couples to celebrate their connection.",
    image: placeholderImage("Couple Bracelets"),
    cartUrl: "/cart/add/couple-bracelets",
    price: 5000,
    oldPrice: 6000,
    rating: 4.8,
    delivery: "",
    isFeatured: true,
    isBestSeller: true,
    sortOrder: 30,
  },
  {
    id: "women-watch",
    name: "Elegant Women Watch",
    category: "Women",
    categorySlug: "women",
    collection: "women",
    tag: "Elegant",
    desc: "A stylish and modern watch designed for women who love sophistication.",
    image: placeholderImage("Women Watch"),
    cartUrl: "/cart/add/women-watch",
    price: 5000,
    oldPrice: 6000,
    rating: 4.8,
    delivery: "",
    isFeatured: true,
    isBestSeller: false,
    sortOrder: 40,
  },
  {
    id: "men-watch",
    name: "Classic Men Watch",
    category: "Men",
    categorySlug: "men",
    collection: "men",
    tag: "Classic",
    desc: "A bold and classy watch built for men who appreciate timeless fashion.",
    image: placeholderImage("Men Watch"),
    cartUrl: "/cart/add/men-watch",
    price: 5000,
    oldPrice: 6000,
    rating: 4.8,
    delivery: "",
    isFeatured: true,
    isBestSeller: true,
    sortOrder: 50,
  },
  {
    id: "small-bouquet",
    name: "Small Flower Bouquet",
    category: "Customized Gifts",
    categorySlug: "customized_gifts",
    collection: "custom",
    tag: "Bouquet",
    desc: "A cute bouquet arrangement perfect for small surprises and sweet moments.",
    image: placeholderImage("Small Bouquet"),
    cartUrl: "/cart/add/small-bouquet",
    price: 5000,
    oldPrice: 6000,
    rating: 4.8,
    delivery: "",
    isFeatured: false,
    isBestSeller: true,
    sortOrder: 60,
  },
  {
    id: "large-bouquet",
    name: "Grand Flower Bouquet",
    category: "Customized Gifts",
    categorySlug: "customized_gifts",
    collection: "custom",
    tag: "Bouquet",
    desc: "A luxurious bouquet designed to make every occasion extra special.",
    image: placeholderImage("Large Bouquet"),
    cartUrl: "/cart/add/large-bouquet",
    price: 5000,
    oldPrice: 6000,
    rating: 4.8,
    delivery: "",
    isFeatured: false,
    isBestSeller: true,
    sortOrder: 70,
  },
  {
    id: "small-hamper",
    name: "Small Gift Hamper",
    category: "Customized Gifts",
    categorySlug: "customized_gifts",
    collection: "custom",
    tag: "Hamper",
    desc: "A compact hamper filled with delightful surprises for your loved ones.",
    image: placeholderImage("Small Hamper"),
    cartUrl: "/cart/add/small-hamper",
    price: 5000,
    oldPrice: 6000,
    rating: 4.8,
    delivery: "",
    isFeatured: false,
    isBestSeller: true,
    sortOrder: 80,
  },
  {
    id: "large-hamper",
    name: "Luxury Gift Hamper",
    category: "Customized Gifts",
    categorySlug: "customized_gifts",
    collection: "custom",
    tag: "Hamper",
    desc: "A premium hamper packed with exclusive gifts to impress and delight.",
    image: placeholderImage("Large Hamper"),
    cartUrl: "/cart/add/large-hamper",
    price: 5000,
    oldPrice: 6000,
    rating: 4.8,
    delivery: "",
    isFeatured: false,
    isBestSeller: true,
    sortOrder: 90,
  },
  {
    id: "magazine-gift",
    name: "Customized Magazine Gift",
    category: "Customized Gifts",
    categorySlug: "customized_gifts",
    collection: "custom",
    tag: "Custom",
    desc: "A unique magazine-style gift designed to capture memories creatively.",
    image: placeholderImage("Magazine Gift"),
    cartUrl: "/cart/add/magazine-gift",
    price: 5000,
    oldPrice: 6000,
    rating: 4.8,
    delivery: "",
    isFeatured: false,
    isBestSeller: true,
    sortOrder: 100,
  },
  {
    id: "women-couple-bracelet",
    name: "Women Couple Bracelet",
    category: "Women",
    categorySlug: "women",
    collection: "women",
    tag: "Couple",
    desc: "A stylish bracelet specially crafted for women in a couple set.",
    image: placeholderImage("Women Bracelet"),
    cartUrl: "/cart/add/women-couple-bracelet",
    price: 5000,
    oldPrice: 6000,
    rating: 4.8,
    delivery: "",
    isFeatured: false,
    isBestSeller: true,
    sortOrder: 110,
  },
  {
    id: "men-couple-bracelet",
    name: "Men Couple Bracelet",
    category: "Men",
    categorySlug: "men",
    collection: "men",
    tag: "Couple",
    desc: "A bold and elegant bracelet designed for men in a couple set.",
    image: placeholderImage("Men Bracelet"),
    cartUrl: "/cart/add/men-couple-bracelet",
    price: 5000,
    oldPrice: 6000,
    rating: 4.8,
    delivery: "",
    isFeatured: false,
    isBestSeller: true,
    sortOrder: 120,
  },
  {
    id: "women-couple-watches",
    name: "Women Couple Watches",
    category: "Women",
    categorySlug: "women",
    collection: "women",
    tag: "Couple",
    desc: "A beautifully designed watch set perfect for couples who love matching styles.",
    image: placeholderImage("Women Couple Watches"),
    cartUrl: "/cart/add/women-couple-watches",
    price: 5000,
    oldPrice: 6000,
    rating: 4.8,
    delivery: "",
    isFeatured: false,
    isBestSeller: true,
    sortOrder: 130,
  },
];

export const collectionLabels: Record<ProductCollection, string> = {
  women: "Women",
  men: "Men",
  custom: "Customized Gifts",
};

export const collectionDescriptions: Record<ProductCollection, string> = {
  women: "Bracelets, watches, and elegant gift picks for women.",
  men: "Watches, bracelets, and classic gift picks for men.",
  custom: "Bouquets, hampers, couple sets, and personalized gifts.",
};

export function formatPrice(price: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(price);
}
