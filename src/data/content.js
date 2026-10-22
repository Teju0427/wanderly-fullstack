import { img } from './images.js';

export const inspirationArticles = [
  {
    id: 'escape-the-city',
    title: '7 places to escape the city',
    excerpt:
      'When the horizon shrinks to rooftops, these seven places open it back up — from lakeside towns three hours out to backwaters that feel like another country.',
    readTime: '6 min read',
    image: img('kerala', { w: 1400, crop: 'top' }),
  },
  {
    id: 'weekend-getaways',
    title: 'Weekend getaways worth taking',
    excerpt:
      'You don\'t need a fortnight to feel far from home. A curated shortlist of trips built entirely around a Friday-evening departure and a Sunday-night return.',
    readTime: '5 min read',
    image: img('manali', { w: 1400, crop: 'bottom' }),
  },
  {
    id: 'mountains-meet-sky',
    title: 'Where mountains meet the sky',
    excerpt:
      'At altitude, the ordinary rules of a trip stop applying. Notes from three high-elevation routes where the climb is the entire point.',
    readTime: '8 min read',
    image: img('trekking', { w: 1400 }),
  },
];

export const testimonials = [
  {
    id: 't1',
    name: 'Ananya Rao',
    trip: 'Kerala backwaters, 6 days',
    quote:
      'The houseboat booking took two minutes and the itinerary Wanderly suggested was better than what our travel agent proposed for triple the fee.',
    rating: 5,
  },
  {
    id: 't2',
    name: 'Marcus Chen',
    trip: 'Bali, 8 days',
    quote:
      'Every recommendation felt considered rather than templated — the Ubud stay alone was worth the whole trip.',
    rating: 5,
  },
  {
    id: 't3',
    name: 'Priya Nair',
    trip: 'Jaipur, long weekend',
    quote:
      'The trip planner kept our whole group on the same page. No group chat chaos, no double-booked afternoons.',
    rating: 4,
  },
  {
    id: 't4',
    name: 'Daniel Osei',
    trip: 'Dubai, 5 days',
    quote:
      'Found a desert stay through Wanderly I never would have found searching on my own. Genuinely well curated.',
    rating: 5,
  },
];

export const team = [
  {
    id: 'p1',
    name: 'Ishaan Verma',
    role: 'Founder & Creative Director',
    bio: 'Spent a decade shooting travel editorials before deciding the itineraries deserved as much craft as the photography.',
  },
  {
    id: 'p2',
    name: 'Naledi Khumalo',
    role: 'Head of Destinations',
    bio: 'Has personally scouted every stay listed on Wanderly — no listing goes live without her sign-off.',
  },
  {
    id: 'p3',
    name: 'Rohan Fernandes',
    role: 'Lead Product Designer',
    bio: 'Believes a good travel interface should feel like a well-organized notebook, not a booking dashboard.',
  },
];

export const stats = [
  { label: 'Destinations curated', value: '120+' },
  { label: 'Trips planned', value: '38,000+' },
  { label: 'Countries covered', value: '24' },
  { label: 'Average rating', value: '4.8/5' },
];

export const faqs = [
  {
    q: 'How does Wanderly choose which stays and experiences to list?',
    a: 'Every listing is reviewed by our destinations team before publishing — no paid placements, no unreviewed submissions.',
  },
  {
    q: 'Can I use the trip planner without creating an account?',
    a: 'Yes. Your itinerary saves to this browser automatically, so it\'ll be waiting when you return.',
  },
  {
    q: 'Do prices shown include flights?',
    a: 'No — prices reflect on-ground costs only (stays, experiences, and local transport). Flight costs vary too widely by origin to estimate accurately.',
  },
  {
    q: 'How do I get in touch about a specific trip?',
    a: 'Use the contact form on this page, or mention the destination directly — our team replies within one business day.',
  },
];
