export type EventCategory = "nightlife" | "festival" | "music" | "lifestyle";

export type Genre =
  | "amapiano"
  | "afro-house"
  | "house"
  | "gqom"
  | "hip-hop"
  | "kwaito"
  | "afro-pop"
  | "jazz"
  | "rock"
  | "pop";

export type TicketTier = {
  id: string;
  name: string;
  price: number;
  description?: string;
  capacity: number;
  sold: number;
};

export type TicketOrder = {
  id: string;
  eventSlug: string;
  buyerName: string;
  buyerEmail: string;
  subtotalAmount: number;
  serviceFee: number;
  totalAmount: number;
  ticketCount: number;
  status: string;
  createdAt: string;
  userId?: string;
  buyerPhone?: string;
};

export type EventTicket = {
  id: string;
  orderId: string;
  eventSlug: string;
  tierId: string;
  tierName: string;
  code: string;
  holderName: string;
  status: string;
  checkedInAt?: string;
  createdAt: string;
};

export type EventTicketWithBuyer = EventTicket & {
  buyerName: string;
  buyerEmail: string;
};

export type EventTicketSummary = {
  totalTickets: number;
  checkedIn: number;
  valid: number;
  orderCount: number;
  byTier: {
    tierId: string;
    tierName: string;
    total: number;
    checkedIn: number;
  }[];
};

export type EventSalesReport = {
  grossRevenue: number;
  serviceFee: number;
  organizerNet: number;
  orderCount: number;
  totalTickets: number;
  checkedIn: number;
  checkInRate: number;
  compTickets: number;
  byTier: {
    tierId: string;
    tierName: string;
    price: number;
    capacity: number;
    sold: number;
    checkedIn: number;
    comp: number;
    revenue: number;
  }[];
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
  province: string;
  address: string;
  capacity: number;
  image: string;
};

export type OrganizerProfile = {
  id: string;
  email: string;
  name: string | null;
  slug: string | null;
  logo: string | null;
  bio: string | null;
  phone: string | null;
  websiteUrl: string | null;
  instagramUrl: string | null;
  invoiceCompanyName: string | null;
  invoiceAddressLine1: string | null;
  invoiceAddressLine2: string | null;
  invoiceCity: string | null;
  invoiceProvince: string | null;
  invoicePostalCode: string | null;
  vatNumber: string | null;
  defaultRefundPolicy: string | null;
  createdAt: string;
};

export type Event = {
  slug: string;
  title: string;
  subtitle?: string;
  description: string;
  image: string;
  /** Wide landscape banner for homepage carousel when featured. */
  heroImage?: string | null;
  date: string;
  doorsTime: string;
  showTime: string;
  category: EventCategory;
  featured: boolean;
  artists: Artist[];
  venue: Venue;
  tiers: TicketTier[];
  ageLimit?: number;
  ageMax?: number;
  tags: string[];
  endDate?: string;
  organizerId?: string;
  organizerSlug?: string;
  organizerName?: string;
  organizerLogo?: string;
  /** When true, the linked organizer profile is shown on the public event page. */
  showOrganizerProfile?: boolean;
  prohibitedItems?: string[];
  contactEmail?: string;
  refundPolicy?: string;
};

export type City = {
  slug: string;
  name: string;
  province: string;
  image: string;
};
