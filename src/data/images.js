// All photography sourced from Unsplash (unsplash.com) — free to use under the Unsplash License.
// Each entry stores the base CDN asset; helper below appends sizing/format params on demand.
const BASE = 'https://images.unsplash.com/photo-';

const ids = {
  goa: '1727276884218-ec3be46cda91',
  kerala: '1785932413547-cdd1159e1f1e',
  manali: '1677820915334-d7ceba1e844a',
  jaipur: '1722577359782-265eb6282c26',
  bali: '1557093793-d149a38a1be8',
  dubai: '1748626083682-611d0a66cb50',
  scuba: '1682687982049-b3d433368cd1',
  trekking: '1760716190527-c36474a2dd2f',
  kayaking: '1436162716854-dcb9157bfac1',
  foodTour: '1750949135629-0345e050c353',
  wildlife: '1575445829782-63457401b336',
  resortGoa: '1763402084622-c7da69907b81',
  resortBali: '1753724933350-c2e0e2990445',
  clouds: '1514843295067-dc777a28a510',
};

/**
 * Build a sized Unsplash URL.
 * @param {keyof typeof ids} key
 * @param {{w?: number, h?: number, crop?: string}} opts
 */
export function img(key, opts = {}) {
  const { w = 1600, h, crop = 'entropy' } = opts;
  const params = new URLSearchParams({
    auto: 'format',
    fit: 'crop',
    q: '80',
    w: String(w),
    crop,
  });
  if (h) params.set('h', String(h));
  return `${BASE}${ids[key]}?${params.toString()}`;
}

export default ids;
