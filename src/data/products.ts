import bouquet from "@/assets/product-bouquet.jpg";
import bow from "@/assets/product-bow.jpg";
import keychain from "@/assets/product-keychain.jpg";
import galleryOne from "@/assets/gallery-1.jpg";
import galleryTwo from "@/assets/gallery-2.jpg";
import galleryThree from "@/assets/gallery-3.jpg";

export type ProductCollection = "women" | "men" | "custom";

export type Product = {
  id: string;
  name: string;
  category: string;
  collection: ProductCollection;
  tag: string;
  desc: string;
  image: string;
  imageUrl?: string;
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
    id: "forever-bouquet",
    name: "Forever Bouquet",
    category: "Floral Gifts",
    collection: "women",
    tag: "Featured",
    desc: "Romantic hand-crocheted blooms arranged for birthdays, anniversaries, and elegant gifting moments.",
    image: bouquet,
    price: 1200,
    oldPrice: 1450,
    rating: 4.9,
    delivery: "Delivery in 3-5 Days",
    isFeatured: true,
    isBestSeller: true,
    sortOrder: 10,
  },
  {
    id: "sweet-pea-bow",
    name: "Sweet Pea Bow",
    category: "Hair Accessories",
    collection: "women",
    tag: "Best Seller",
    desc: "Soft crochet bow made for bridesmaids, return gifts, and feminine everyday styling.",
    image: bow,
    price: 250,
    oldPrice: 320,
    rating: 4.8,
    delivery: "Delivery in 3-5 Days",
    isFeatured: true,
    isBestSeller: true,
    sortOrder: 20,
  },
  {
    id: "pocket-pals",
    name: "Pocket Pals",
    category: "Desk & Key Gifts",
    collection: "men",
    tag: "Popular",
    desc: "Small crochet keepsakes for work desks, key sets, and thoughtful surprise gifting.",
    image: keychain,
    price: 350,
    rating: 4.7,
    delivery: "Delivery in 3-5 Days",
    isFeatured: true,
    sortOrder: 30,
  },
  {
    id: "blue-lily",
    name: "Blue Lily Stem",
    category: "Premium Stems",
    collection: "men",
    tag: "Minimal Pick",
    desc: "A refined single-stem gift for desks, celebrations, and understated premium gifting.",
    image: galleryOne,
    price: 420,
    rating: 4.8,
    delivery: "Delivery in 3-5 Days",
    isBestSeller: true,
    sortOrder: 40,
  },
  {
    id: "bunny-charm",
    name: "Bunny Charm",
    category: "Custom Keepsakes",
    collection: "custom",
    tag: "Custom Favorite",
    desc: "Made-to-order crochet charm personalized with colors, ribbons, and note cards for your occasion.",
    image: galleryTwo,
    price: 520,
    oldPrice: 650,
    rating: 4.9,
    delivery: "Delivery in 3-5 Days",
    isFeatured: true,
    isBestSeller: true,
    sortOrder: 50,
  },
  {
    id: "sunny-stem",
    name: "Sunny Stem",
    category: "Custom Floral Gifts",
    collection: "custom",
    tag: "Made for You",
    desc: "A handcrafted sunflower-style gift customized for names, wrapping, message cards, and color accents.",
    image: galleryThree,
    price: 480,
    rating: 4.8,
    delivery: "Delivery in 3-5 Days",
    isFeatured: true,
    sortOrder: 60,
  },
];

export const collectionLabels: Record<ProductCollection, string> = {
  women: "Women",
  men: "Men",
  custom: "Customize Your Gift",
};

export const collectionDescriptions: Record<ProductCollection, string> = {
  women: "Elegant crochet florals, bows, and keepsakes designed for heartfelt gifting.",
  men: "Minimal, premium gift picks curated for birthdays, milestones, and thoughtful surprises.",
  custom: "Personalized gifts with your colors, wrapping style, message card, and final look.",
};

export function formatPrice(price: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(price);
}

