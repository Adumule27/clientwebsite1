import { z } from "zod";

export const TestimonialSchema = z.object({
  id: z.string(),
  name: z.string().min(1),
  location: z.string().optional(),
  quote: z.string().min(1),
  // image is optional and may be a data URL or hosted URL
  image: z.string().optional(),
  createdAt: z.string(),
  rating: z.number().min(1).max(5).default(5),
  reviewType: z.enum(["website", "product"]).default("website"),
  productName: z.string().optional(),
});

export type Testimonial = z.infer<typeof TestimonialSchema>;

const STORAGE_KEY = "sdf:testimonials";

function makeId() {
  if (typeof crypto !== "undefined" && typeof (crypto as any).randomUUID === "function") {
    return (crypto as any).randomUUID();
  }
  return `t-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
}

const defaultTestimonials: Testimonial[] = [
  {
    id: makeId(),
    name: "Marta K.",
    location: "Spain",
    quote: "An unforgettable journey — our guide was knowledgeable, kind, and the itinerary was perfectly paced. Highly recommend SDF!",
    createdAt: new Date().toISOString(),
    rating: 5,
    reviewType: "website",
  },
  {
    id: makeId(),
    name: "Daniel T.",
    location: "USA",
    quote: "Beautifully organized trip. From airport pickup to local experiences, everything was seamless. The coffee ceremony was a highlight!",
    createdAt: new Date().toISOString(),
    rating: 5,
    reviewType: "website",
  },
  {
    id: makeId(),
    name: "Alemayehu B.",
    location: "Ethiopia",
    quote: "Authentic, respectful, and inspiring — the cultural interactions felt curated with care. We learned so much and felt safe throughout.",
    createdAt: new Date().toISOString(),
    rating: 5,
    reviewType: "website",
  },
];

function load(): Testimonial[] {
  try {
    if (typeof localStorage === "undefined") return defaultTestimonials;
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultTestimonials;
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return defaultTestimonials;
    // validate items
    const items: Testimonial[] = [];
    for (const it of parsed) {
      try {
        items.push(TestimonialSchema.parse(it));
      } catch (e) {
        // skip invalid
      }
    }
    return items.length ? items : defaultTestimonials;
  } catch (e) {
    return defaultTestimonials;
  }
}

function save(items: Testimonial[]) {
  try {
    if (typeof localStorage === "undefined") return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch (e) {
    // ignore
  }
}

export function getTestimonials(): Testimonial[] {
  return load();
}

export function addTestimonial(input: {
  name: string;
  location?: string;
  quote: string;
  image?: string;
  rating?: number;
  reviewType?: "website" | "product";
  productName?: string;
}): Testimonial {
  const item: Testimonial = TestimonialSchema.parse({
    id: makeId(),
    name: input.name,
    location: input.location ?? undefined,
    quote: input.quote,
    image: input.image ?? undefined,
    createdAt: new Date().toISOString(),
    rating: input.rating ?? 5,
    reviewType: input.reviewType ?? "website",
    productName: input.productName ?? undefined,
  });
  const items = load();
  items.unshift(item);
  save(items);
  return item;
}

export function clearTestimonials() {
  try {
    if (typeof localStorage === "undefined") return;
    localStorage.removeItem(STORAGE_KEY);
  } catch (e) {}
}

export function deleteTestimonial(id: string) {
  try {
    const items = load().filter((i) => i.id !== id);
    save(items);
    return items;
  } catch (e) {
    return load();
  }
}
