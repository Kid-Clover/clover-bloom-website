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

const SQUARE = "https://drinkkidclover.square.site/product";

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
    squareUrl: `${SQUARE}/pink-pop-potion-/YDHH3TSGMLYR47EYL2FJCF5X`,
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
    squareUrl: `${SQUARE}/day-dreamer/44HRVATRJFX6LOBCLKSOEU4H`,
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
    squareUrl: `${SQUARE}/tiny-recess/VT264GRFK33HVTBUEDNKE3H3`,
    color: "yellow-crayon",
  },
  {
    id: "tigers-eye-ginger",
    name: "Tiger's Eye Ginger",
    tagline: "A fiery little simple",
    description:
      "A single-herb ginger simple — warming, zippy, and great for chilly mornings or queasy bellies.",
    ingredients: ["Ginger root"],
    price: 6,
    image: sunny,
    squareUrl: `${SQUARE}/tiger-s-eye-ginger/O6D3XV36UPKTPCVOFSGRKPAG`,
    color: "yellow-crayon",
  },
  {
    id: "crystal-cauldron-chamomile",
    name: "Crystal Cauldron Chamomile",
    tagline: "A calm little simple",
    description:
      "A single-herb chamomile simple. Soft, floral, and the gentlest way to wind down.",
    ingredients: ["Chamomile flowers"],
    price: 6,
    image: dreamy,
    squareUrl: `${SQUARE}/crystal-cauldron-chamomile/ABGPBDV4RIZGEFQRW7X6KRCN`,
    color: "lavender",
  },
  {
    id: "dragonflies-society-rose-hips",
    name: "Dragonflies Society Rose Hips",
    tagline: "A bright little simple",
    description:
      "A single-herb rose hips simple — tart, ruby-red, and packed with sunshine.",
    ingredients: ["Rose hips"],
    price: 6,
    image: clover,
    squareUrl: `${SQUARE}/dragonflies-society-rose-hips/VCDEPYATSGESA3A56CLTBAK6`,
    color: "clover",
  },
  {
    id: "griffins-gold-lemon-verbena",
    name: "Griffin's Gold Lemon Verbena",
    tagline: "A sunny little simple",
    description:
      "A single-herb lemon verbena simple — bright citrus aroma, smooth and uplifting.",
    ingredients: ["Lemon verbena"],
    price: 6,
    image: sunny,
    squareUrl: `${SQUARE}/griffin-s-gold-lemon-verbena/CL7DUASHVFUOJNB3PUZT6HBB`,
    color: "yellow-crayon",
  },
  {
    id: "ogress-lantern-lemon-balm",
    name: "Ogress's Lantern Lemon Balm",
    tagline: "A soothing little simple",
    description:
      "A single-herb lemon balm simple — gently citrusy and calming. A friend for big feelings.",
    ingredients: ["Lemon balm"],
    price: 6,
    image: dreamy,
    squareUrl: `${SQUARE}/ogress-s-lantern-lemon-balm/OHT4MA2H5XFX2EOOVOIRUHK6`,
    color: "olive",
  },
  {
    id: "pixie-dust-peppermint",
    name: "Pixie Dust Peppermint",
    tagline: "A cool little simple",
    description:
      "A single-herb peppermint simple for tummies that need a little hug. Cool, crisp, classic.",
    ingredients: ["Peppermint"],
    price: 6,
    image: tummy,
    squareUrl: `${SQUARE}/pixie-dust-peppermint/5ETM363IZ5UHDPUOCJ3BS5AL`,
    color: "olive",
  },
  {
    id: "3-simples",
    name: "3 Simples",
    tagline: "Build-your-own bundle · 15% off",
    description:
      "Pick any three of our single-herb simples and save 15%. A lovely way to sample the apothecary.",
    ingredients: ["Choose any 3 simples at checkout"],
    price: 15,
    image: clover,
    squareUrl: `${SQUARE}/3-simples/2HLU44IDTC32I6IKTATNR2SE`,
    color: "lavender",
  },
  {
    id: "6-simples",
    name: "6 Simples",
    tagline: "Build-your-own bundle · 20% off",
    description:
      "Pick any six of our single-herb simples and save 20%. The full apothecary shelf in one go.",
    ingredients: ["Choose any 6 simples at checkout"],
    price: 28,
    image: tummy,
    squareUrl: `${SQUARE}/6-simples/IBC4MZLR4QULZ6N465MOQZR7`,
    color: "clover",
  },
];
