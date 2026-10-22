import { img } from './images.js';

const stays = [
  {
    id: 'cliff-house-goa',
    name: 'The Cliff House',
    location: 'Ashwem, North Goa',
    category: 'Luxury',
    rating: 4.9,
    price: 12500,
    priceLabel: '₹12,500 / night',
    amenities: ['Infinity pool', 'Private beach access', 'Sunset bar'],
    image: img('resortGoa', { w: 1400 }),
  },
  {
    id: 'kumarakom-houseboat',
    name: 'Kumarakom Heritage Houseboat',
    location: 'Vembanad Lake, Kerala',
    category: 'Nature',
    rating: 4.8,
    price: 9800,
    priceLabel: '₹9,800 / night',
    amenities: ['On-board chef', 'Sun deck', 'Backwater route'],
    image: img('kerala', { w: 1400, crop: 'bottom' }),
  },
  {
    id: 'ubud-canopy-villas',
    name: 'Ubud Canopy Villas',
    location: 'Ubud, Bali',
    category: 'Luxury',
    rating: 4.9,
    price: 15200,
    priceLabel: '₹15,200 / night',
    amenities: ['Rice-field views', 'Private plunge pool', 'Spa pavilion'],
    image: img('resortBali', { w: 1400 }),
  },
  {
    id: 'desert-retreat-dubai',
    name: 'Al Marmoom Desert Retreat',
    location: 'Al Marmoom, Dubai',
    category: 'Luxury',
    rating: 4.7,
    price: 21000,
    priceLabel: '₹21,000 / night',
    amenities: ['Dune-view suites', 'Stargazing deck', 'Falconry experience'],
    image: img('dubai', { w: 1400, crop: 'bottom' }),
  },
];

export function getStay(id) {
  return stays.find((s) => s.id === id);
}

export default stays;
