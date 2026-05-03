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
    id: "pink-pop-potion",
    name: "Pink Pop Potion!",
    tagline: "Our signature sip",
    description:
      "A gentle, slightly sweet blend built around hand-harvested red clover. Soothing, joyful, and just the thing for an after-school snack.",
    ingredients: ["Red clover blossoms", "Lemon balm", "Rose hips", "A whisper of honeybush"],
    price: 15,
    image: clover,
    squareUrl: "https://drinkkidclover.square.site/",
    color: "clover",
  },
  {
    id: "day-dreamer",
    name: "Day Dreamer",
    tagline: "For sleepy little ones",
    description:
      "A soft, calming bedtime tea with chamomile and lavender. Pour, snuggle, story, sleep.",
    ingredients: ["Chamomile", "Lavender", "Catnip leaf", "Oat straw"],
    price: 15,
    image: dreamy,
    squareUrl: "https://drinkkidclover.square.site/",
    color: "lavender",
  },
  {
    id: "tiny-recess",
    name: "Tiny Recess",
    tagline: "Bright + zingy",
    description:
      "A tangy citrus and rosehip blend that tastes like a sunshine high-five. Great iced.",
    ingredients: ["Orange peel", "Rosehip", "Hibiscus", "Lemon verbena"],
    price: 15,
    image: sunny,
    squareUrl: "https://drinkkidclover.square.site/",
    color: "yellow-crayon",
  },
  {
    id: "pixie-dust-peppermint",
    name: "Pixie Dust Peppermint",
    tagline: "Settle and soothe",
    description:
      "A friendly single-herb peppermint simple for tummies that need a little hug.",
    ingredients: ["Peppermint"],
    price: 6,
    image: tummy,
    squareUrl: "https://drinkkidclover.square.site/",
    color: "olive",
  },
];
