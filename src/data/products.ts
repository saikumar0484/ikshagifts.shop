import bouquet from "@/assets/product-bouquet.jpg";
import bow from "@/assets/product-bow.jpg";
import keychain from "@/assets/product-keychain.jpg";
import galleryOne from "@/assets/gallery-1.jpg";
import galleryTwo from "@/assets/gallery-2.jpg";
import galleryThree from "@/assets/gallery-3.jpg";

export type Product = {
  id: string;
  name: string;
  category: string;
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
  sortOrder?: number;
};

export const products: Product[] = [
  {
    id: "forever-bouquet",
    name: "Forever Bouquet",
    category: "Bouquets",
    tag: "Bestseller",
    desc: "Hand-crocheted blooms wrapped with ribbon, made to stay bright forever.",
    image: bouquet,
    price: 1200,
    oldPrice: 1450,
    rating: 4.9,
    delivery: "Ships in 4-6 days",
  },
  {
    id: "sweet-pea-bow",
    name: "Sweet Pea Bow",
    category: "Hairclips",
    tag: "New",
    desc: "Soft pastel crochet bow for bags, clips, gifts, and everyday cozy looks.",
    image: bow,
    price: 250,
    oldPrice: 320,
    rating: 4.8,
    delivery: "Ships in 2-3 days",
  },
  {
    id: "pocket-pals",
    name: "Pocket Pals",
    category: "Keychains",
    tag: "Cute",
    desc: "Tiny crochet bears, bunnies, and charms to clip onto bags and keys.",
    image: keychain,
    price: 350,
    rating: 4.7,
    delivery: "Ships in 3-5 days",
  },
  {
    id: "blue-lily",
    name: "Blue Lily Stem",
    category: "Bouquets",
    tag: "Studio Pick",
    desc: "A bright blue crochet flower stem for shelves, desks, and gift bundles.",
    image: galleryOne,
    price: 420,
    rating: 4.8,
    delivery: "Ships in 5-7 days",
  },
  {
    id: "bunny-charm",
    name: "Bunny Charm",
    category: "Bunnies",
    tag: "Loved",
    desc: "A tiny bunny friend with soft details and a handmade ribbon finish.",
    image: galleryTwo,
    price: 520,
    oldPrice: 650,
    rating: 4.9,
    delivery: "Ships in 5-7 days",
  },
  {
    id: "sunny-stem",
    name: "Sunny Stem",
    category: "Bouquets",
    tag: "Giftable",
    desc: "A sunflower crochet stem that brings a little warmth to any corner.",
    image: galleryThree,
    price: 480,
    rating: 4.8,
    delivery: "Ships in 4-6 days",
  },
];

export const categories = ["All", "Bouquets", "Hairclips", "Keychains", "Bunnies"];

export function formatPrice(price: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(price);
}
