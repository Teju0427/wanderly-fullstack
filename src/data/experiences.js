import { img } from './images.js';

const experiences = [
  {
    id: 'scuba-diving',
    name: 'Scuba Diving',
    location: 'Grande Island, Goa',
    category: 'Adventure',
    rating: 4.8,
    price: 4200,
    priceLabel: '₹4,200',
    duration: '3 hours',
    image: img('scuba', { w: 1200 }),
    description:
      'A shallow-reef dive suited to first-timers, with a certified instructor at your side the entire way down. Expect parrotfish, the odd reef shark sighting, and a wreck just deep enough to feel like an adventure.',
  },
  {
    id: 'mountain-trekking',
    name: 'Mountain Trekking',
    location: 'Solang Valley, Manali',
    category: 'Adventure',
    rating: 4.7,
    price: 2800,
    priceLabel: '₹2,800',
    duration: 'Full day',
    image: img('trekking', { w: 1200 }),
    description:
      'A guided ridge trail above the tree line, climbing through pine forest before opening onto views of the Pir Panjal range. Moderate difficulty — sturdy shoes and a head for switchbacks recommended.',
  },
  {
    id: 'sunset-kayaking',
    name: 'Sunset Kayaking',
    location: 'Palolem Bay, Goa',
    category: 'Adventure',
    rating: 4.9,
    price: 1800,
    priceLabel: '₹1,800',
    duration: '2 hours',
    image: img('kayaking', { w: 1200 }),
    description:
      'A calm-water paddle out toward the bay\'s edge, timed to finish exactly as the sky turns copper. Bioluminescent plankton light the water on moonless nights between November and February.',
  },
  {
    id: 'heritage-walk',
    name: 'Heritage Walk',
    location: 'Old City, Jaipur',
    category: 'Culture',
    rating: 4.6,
    price: 1200,
    priceLabel: '₹1,200',
    duration: '3 hours',
    image: img('jaipur', { w: 1200, crop: 'faces' }),
    description:
      'A slow morning walk through the walled Pink City with a local historian — block-print workshops, spice merchants, and the quiet inner courtyards most visitors walk straight past.',
  },
  {
    id: 'food-tour',
    name: 'Food Tour',
    location: 'Fort Kochi, Kerala',
    category: 'Food',
    rating: 4.8,
    price: 1500,
    priceLabel: '₹1,500',
    duration: '3 hours',
    image: img('foodTour', { w: 1200 }),
    description:
      'Six stops, one appetite. From banana-leaf thali to fresh-caught seafood grilled streetside, this tour trades restaurant menus for the stalls locals actually queue at.',
  },
  {
    id: 'wildlife-safari',
    name: 'Wildlife Safari',
    location: 'Ranthambore National Park',
    category: 'Nature',
    rating: 4.7,
    price: 3500,
    priceLabel: '₹3,500',
    duration: 'Half day',
    image: img('wildlife', { w: 1200 }),
    description:
      'An open-jeep safari through dry deciduous forest and lake-fed grassland, tracking Bengal tigers alongside sloth bears, marsh crocodiles, and over 300 recorded bird species.',
  },
];

export function getExperience(id) {
  return experiences.find((e) => e.id === id);
}

export default experiences;
