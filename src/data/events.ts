export type KCEvent = {
  id: string;
  title: string;
  date: string; // ISO yyyy-mm-dd
  time: string;
  location: string;
  type: "Market" | "Popup" | "Class" | "Appearance";
  description: string;
  signupUrl?: string;
};

// Generate dates relative to today so the calendar always has upcoming items
const today = new Date();
const d = (offset: number) => {
  const dt = new Date(today);
  dt.setDate(dt.getDate() + offset);
  return dt.toISOString().slice(0, 10);
};

export const events: KCEvent[] = [
  {
    id: "1",
    title: "Saturday Farmers Market",
    date: d(3),
    time: "9:00am – 1:00pm",
    location: "Downtown Square",
    type: "Market",
    description:
      "Come say hi at our weekly booth! Sample all four blends, meet the herbalist, and pick up a fresh pouch.",
  },
  {
    id: "2",
    title: "Tea + Stories with Kids",
    date: d(7),
    time: "10:30am",
    location: "Sprouts Library, Storytime Room",
    type: "Class",
    description:
      "A free hands-on class for ages 4–8. We'll smell, sip, and learn about three magical plants.",
  },
  {
    id: "3",
    title: "Pop-up at Honeycomb Cafe",
    date: d(11),
    time: "8:00am – 12:00pm",
    location: "Honeycomb Cafe, 4th & Main",
    type: "Popup",
    description: "One-day-only popup! Try our newest seasonal blend and grab a treat with your tea.",
  },
  {
    id: "4",
    title: "Herbal Mocktail Workshop",
    date: d(18),
    time: "6:00pm – 7:30pm",
    location: "The Garden Studio",
    type: "Class",
    description:
      "Family workshop building bubbly, kid-friendly herbal mocktails with our blends. Ages 6+.",
  },
  {
    id: "5",
    title: "Wildflower Market Festival",
    date: d(24),
    time: "10:00am – 4:00pm",
    location: "Riverside Park",
    type: "Appearance",
    description:
      "We'll be at the big spring festival with face painting, free samples, and a craft station for kids.",
  },
  {
    id: "6",
    title: "Saturday Farmers Market",
    date: d(31),
    time: "9:00am – 1:00pm",
    location: "Downtown Square",
    type: "Market",
    description: "Our weekly booth. Come say hi!",
  },
];
