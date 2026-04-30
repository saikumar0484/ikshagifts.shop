import bouquet from "@/assets/product-bouquet.jpg";
import bow from "@/assets/product-bow.jpg";
import keychain from "@/assets/product-keychain.jpg";
import galleryOne from "@/assets/gallery-1.jpg";
import galleryTwo from "@/assets/gallery-2.jpg";
import galleryThree from "@/assets/gallery-3.jpg";
import { ProductCollection } from "@/data/products";

export const collectionNav = [
  {
    slug: "women" as ProductCollection,
    href: "/collections/women",
    label: "Women",
    blurb: "Elegant crochet gifts made to feel special from the first glance.",
  },
  {
    slug: "men" as ProductCollection,
    href: "/collections/men",
    label: "Men",
    blurb: "Premium, clean gift picks for birthdays, milestones, and work celebrations.",
  },
  {
    slug: "custom" as ProductCollection,
    href: "/collections/custom",
    label: "Customize Your Gift",
    blurb: "Personalize colors, names, wrapping, and the final unboxing experience.",
  },
];

export const customerReviews = [
  {
    name: "Meghana R.",
    title: "Anniversary bouquet",
    quote: "The bouquet looked even more premium in person. The packaging made it feel truly gift-ready.",
    image: bouquet,
  },
  {
    name: "Harish S.",
    title: "Desk gift for a friend",
    quote: "I wanted something memorable, not generic. The final piece felt personal and beautifully finished.",
    image: keychain,
  },
  {
    name: "Sravya K.",
    title: "Custom return gifts",
    quote: "Every piece arrived neatly wrapped and the details looked thoughtful from start to finish.",
    image: bow,
  },
  {
    name: "Akhil P.",
    title: "Birthday surprise",
    quote: "Packaging, message card, and product quality were all premium. It felt worth gifting immediately.",
    image: galleryThree,
  },
];

export const giftExperience = [
  {
    title: "Premium Packaging",
    description: "Every order is packed in a clean, premium presentation that is ready to gift the moment it arrives.",
    image: galleryOne,
  },
  {
    title: "Thoughtful Wrapping",
    description: "Ribbon styling, note cards, and wrapping choices are planned around the occasion and the person receiving it.",
    image: galleryTwo,
  },
  {
    title: "Delivered Look",
    description: "The final reveal is polished, camera-ready, and designed to feel memorable before the gift is even opened.",
    image: galleryThree,
  },
];

