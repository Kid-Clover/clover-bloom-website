import clover from "@/assets/product-clover.jpg";
import dreamy from "@/assets/product-dreamy.jpg";
import sunny from "@/assets/product-sunny.jpg";
import tummy from "@/assets/product-tummy.jpg";

export type Product = {
  id: string;
  name: string;
  tagline: string;
  description: string;
  ingredients: string[];
  price: number;
  image: string;
  squareUrl: string;
  color: "clover" | "lavender" | "yellow-crayon" | "olive";
};

export const products: Product[] = [
  {
    id: "clover-bloom",
    name: "Clover Bloom",
    tagline: "Our signature sip",
    description:
      "A gentle, slightly sweet blend built around hand-harvested red clover. Soothing, joyful, and just the thing for an after-school snack.",
    ingredients: ["Red clover blossoms", "Lemon balm", "Rose hips", "A whisper of honeybush"],
    price: 14,
    image: clover,
    squareUrl: "https://drinkkidclover.square.site/",
    color: "clover",
  },
  {
    id: "dreamy-nights",
    name: "Dreamy Nights",
    tagline: "For sleepy little ones",
    description:
      "A soft, calming bedtime tea with chamomile and lavender. Pour, snuggle, story, sleep.",
    ingredients: ["Chamomile", "Lavender", "Catnip leaf", "Oat straw"],
    price: 14,
    image: dreamy,
    squareUrl: "https://drinkkidclover.square.site/",
    color: "lavender",
  },
  {
    id: "sunny-sips",
    name: "Sunny Sips",
    tagline: "Bright + zingy",
    description:
      "A tangy citrus and rosehip blend that tastes like a sunshine high-five. Great iced.",
    ingredients: ["Orange peel", "Rosehip", "Hibiscus", "Lemon verbena"],
    price: 14,
    image: sunny,
    squareUrl: "https://drinkkidclover.square.site/",
    color: "yellow-crayon",
  },
  {
    id: "happy-tummy",
    name: "Happy Tummy",
    tagline: "Settle and soothe",
    description:
      "A friendly digestive blend with peppermint and fennel for tummies that need a little hug.",
    ingredients: ["Peppermint", "Fennel", "Ginger", "Marshmallow root"],
    price: 14,
    image: tummy,
    squareUrl: "https://drinkkidclover.square.site/",
    color: "olive",
  },
];
