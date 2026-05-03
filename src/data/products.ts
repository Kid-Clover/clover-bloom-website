import tummy from "@/assets/product-tummy.jpg";
import pinkPopPotion from "@/assets/product-pink-pop-potion.jpg";
import dayDreamers from "@/assets/product-day-dreamers.jpg";
import tinyRecess from "@/assets/product-tiny-recess.jpg";
import tigersEye from "@/assets/product-tigers-eye.jpg";
import crystalCauldron from "@/assets/product-crystal-cauldron.jpg";
import dragonflies from "@/assets/product-dragonflies.jpg";
import griffinsGold from "@/assets/product-griffins-gold.jpg";
import ogressLantern from "@/assets/product-ogress-lantern.jpg";

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
    tagline: "Smart sips for little lips",
    description:
      "Our signature pink blend — gently sweet, fruity, and floral. A joyful herbal tisane that's just the thing for an after-school sip.",
    ingredients: ["Chamomile", "Apple", "Strawberry", "Hibiscus"],
    price: 15,
    image: pinkPopPotion,
    squareUrl: `${SQUARE}/pink-pop-potion-/YDHH3TSGMLYR47EYL2FJCF5X`,
    color: "clover",
  },
  {
    id: "day-dreamer",
    name: "Day Dreamers",
    tagline: "Smart sips for little lips",
    description:
      "A soft, calming herbal tisane to ease busy little minds. Pour, snuggle, story, sleep.",
    ingredients: ["Lemon Balm", "Chamomile"],
    price: 15,
    image: dayDreamers,
    squareUrl: `${SQUARE}/day-dreamer/44HRVATRJFX6LOBCLKSOEU4H`,
    color: "lavender",
  },
  {
    id: "tiny-recess",
    name: "Tiny Recess",
    tagline: "Smart sips for little lips",
    description:
      "A bright, refreshing herbal tisane — a green little pick-me-up that's lovely hot or iced.",
    ingredients: ["Nettle", "Apple", "Spearmint"],
    price: 15,
    image: tinyRecess,
    squareUrl: `${SQUARE}/tiny-recess/VT264GRFK33HVTBUEDNKE3H3`,
    color: "yellow-crayon",
  },
  {
    id: "tigers-eye-ginger",
    name: "Tiger's Eye",
    tagline: "Warm & ease",
    description:
      "A ginger tisane for warming and easing. Cars, boats & planes — know I've got your back.",
    ingredients: ["Ginger root"],
    price: 6,
    image: tigersEye,
    squareUrl: `${SQUARE}/tiger-s-eye-ginger/O6D3XV36UPKTPCVOFSGRKPAG`,
    color: "yellow-crayon",
  },
  {
    id: "crystal-cauldron-chamomile",
    name: "Crystal Cauldron",
    tagline: "Calm & soothe",
    description:
      "A chamomile tisane for calming and soothing. Small but mighty, like the elves.",
    ingredients: ["Chamomile"],
    price: 6,
    image: crystalCauldron,
    squareUrl: `${SQUARE}/crystal-cauldron-chamomile/ABGPBDV4RIZGEFQRW7X6KRCN`,
    color: "lavender",
  },
  {
    id: "dragonflies-society-rose-hips",
    name: "Dragonflies Society",
    tagline: "Nutritive & supportive",
    description:
      "A rose hip tisane that's nutritive and supportive. So much vitamin C, even the lemons are jealous.",
    ingredients: ["Rose hips"],
    price: 6,
    image: dragonflies,
    squareUrl: `${SQUARE}/dragonflies-society-rose-hips/VCDEPYATSGESA3A56CLTBAK6`,
    color: "clover",
  },
  {
    id: "griffins-gold-lemon-verbena",
    name: "Griffin's Gold",
    tagline: "Brighten & calm",
    description:
      "A lemon verbena tisane for brightening and calming. Calls the sun on cloudy days!",
    ingredients: ["Lemon verbena"],
    price: 6,
    image: griffinsGold,
    squareUrl: `${SQUARE}/griffin-s-gold-lemon-verbena/CL7DUASHVFUOJNB3PUZT6HBB`,
    color: "yellow-crayon",
  },
  {
    id: "ogress-lantern-lemon-balm",
    name: "Ogress's Lantern",
    tagline: "Relax & comfort",
    description:
      "A lemon balm tisane for relaxing and comforting. Sweetens the day — all the bees agree!",
    ingredients: ["Lemon balm"],
    price: 6,
    image: ogressLantern,
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
    image: crystalCauldron,
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
    image: dragonflies,
    squareUrl: `${SQUARE}/6-simples/IBC4MZLR4QULZ6N465MOQZR7`,
    color: "clover",
  },
];
