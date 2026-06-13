export type Genre =
  | "electronic"
  | "hip-hop"
  | "indie"
  | "rock"
  | "r-and-b"
  | "latin"
  | "jazz"
  | "country";

export type TicketTier = {
  id: string;
  name: string;
  price: number;
  description?: string;
  capacity: number;
  sold: number;
};

export type Artist = {
  slug: string;
  name: string;
  image: string;
  genre: Genre;
  bio?: string;
};

export type Venue = {
  slug: string;
  name: string;
  city: string;
  state: string;
  address: string;
  capacity: number;
  image: string;
};

export type Event = {
  slug: string;
  title: string;
  subtitle?: string;
  description: string;
  image: string;
  date: string;
  doorsTime: string;
  showTime: string;
  genre: Genre;
  featured: boolean;
  artists: Artist[];
  venue: Venue;
  tiers: TicketTier[];
  ageLimit?: number;
  tags: string[];
};

export type City = {
  slug: string;
  name: string;
  state: string;
  image: string;
};
