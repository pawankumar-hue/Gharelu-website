export type LocationStatus = 'open' | 'upcoming';

export interface Location {
  id: string;
  area: string;
  city: string;
  address: string;
  status: LocationStatus;
  hours: string;
  tagline: string;
  mapUrl?: string;
  openingDate?: string;
}

export const locations: Location[] = [
  {
    id: 'bhopal-main',
    area: 'Arera Colony',
    city: 'Bhopal',
    address: 'Gharelu Hub Flagship Kitchen, Arera Colony, Bhopal, MP 462016',
    status: 'open',
    hours: '9 AM – 10 PM · All days',
    tagline: 'Flagship oven micro-kitchen, 10–15 min express dispatch',
    mapUrl: 'https://maps.google.com/?q=Arera+Colony+Bhopal',
  },
  {
    id: 'bhopal-shahpura',
    area: 'Shahpura',
    city: 'Bhopal',
    address: 'Gharelu Hub Kitchen, Shahpura, Bhopal, MP 462039',
    status: 'open',
    hours: '10 AM – 9 PM · All days',
    tagline: 'South Bhopal cluster serving fresh small batches',
    mapUrl: 'https://maps.google.com/?q=Shahpura+Bhopal',
  },
  {
    id: 'bhopal-kolar',
    area: 'Kolar',
    city: 'Bhopal',
    address: 'Gharelu Hub Kitchen, Kolar Road, Bhopal, MP 462042',
    status: 'upcoming',
    hours: 'Coming soon',
    tagline: 'Kolar family cluster in preparation',
    openingDate: 'Dec 2026',
  },
  {
    id: 'indore-main',
    area: 'Vijay Nagar',
    city: 'Indore',
    address: 'Gharelu Hub Kitchen, Vijay Nagar, Indore, MP 452010',
    status: 'upcoming',
    hours: 'Coming soon',
    tagline: 'Indore expansion kitchen in preparation',
    openingDate: 'Early 2027',
  },
];

export const locationById = (id: string | null) =>
  locations.find((l) => l.id === id) ?? locations[0];
