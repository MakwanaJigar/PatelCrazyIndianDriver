import AsyncStorage from '@react-native-async-storage/async-storage';
import { PICKUP_ADDRESS } from '../data/orders';

// ============================================================
// SMART ROUTE
// ------------------------------------------------------------
// Orders the driver's pending deliveries into one route:
//
//   pickup (PICKUP_ADDRESS) -> nearest stop (1)
//                           -> stop nearest to 1 (2)
//                           -> stop nearest to 2 (3) ...
//
// (the "nearest neighbour" rule). Straight-line (haversine) km
// pick the next stop; the road route through all of them (map
// line, km and minutes per stop) then comes from OSRM, see
// fetchRoadRoute. Turn-by-turn is Google Maps when navigating.
//
// Each order's position comes from the server (order.lat /
// order.lng) when GET /driver/orders/assigned sends it, otherwise
// its address is looked up with OpenStreetMap Nominatim and
// cached on the phone, so each address is only looked up once.
// ============================================================

// ------------------------------------------------------------
// Order positions
// ------------------------------------------------------------

// Delivery area, keeps address lookups inside the right country
const GEOCODE_COUNTRY = 'au';
const GEOCODE_URL = 'https://nominatim.openstreetmap.org/search';
const GEOCODE_CACHE_KEY = '@crazyindian/geocode_cache';
// Nominatim allows at most 1 request per second
const GEOCODE_GAP_MS = 1100;

const isCoord = value => Number.isFinite(value) && value !== 0;

let geocodeCache = null;

const loadCache = async () => {
  if (!geocodeCache) {
    try {
      geocodeCache =
        JSON.parse(await AsyncStorage.getItem(GEOCODE_CACHE_KEY)) || {};
    } catch (e) {
      geocodeCache = {};
    }
  }
  return geocodeCache;
};

const saveCache = () =>
  AsyncStorage.setItem(GEOCODE_CACHE_KEY, JSON.stringify(geocodeCache)).catch(
    () => {},
  );

const wait = ms => new Promise(resolve => setTimeout(resolve, ms));

let lastLookupAt = 0;

// Address -> { lat, lng } | null (null is cached too, so an address
// that can't be found isn't looked up again on every refresh)
const geocodeQuery = async address => {
  const key = address.trim().toLowerCase();
  if (!key) {
    return null;
  }
  const cache = await loadCache();
  if (key in cache) {
    return cache[key];
  }

  await wait(Math.max(0, lastLookupAt + GEOCODE_GAP_MS - Date.now()));
  lastLookupAt = Date.now();

  const url =
    `${GEOCODE_URL}?format=json&limit=1&countrycodes=${GEOCODE_COUNTRY}` +
    `&q=${encodeURIComponent(address)}`;
  const response = await fetch(url, {
    headers: {
      Accept: 'application/json',
      'User-Agent': 'CrazyIndianDriver/1.0',
    },
  });
  if (!response.ok) {
    // Not cached: a rate-limit / server error may work next time
    return null;
  }
  const [hit] = await response.json();
  cache[key] = hit ? { lat: Number(hit.lat), lng: Number(hit.lon) } : null;
  saveCache();
  return cache[key];
};

// Simpler versions of an address for when the full one isn't found:
//   "Unit 3, 12 Smith St, Enfield SA 5085" -> "12 Smith St, Enfield SA 5085"
//   "3/12 Smith St, Enfield SA 5085"       -> "12 Smith St, Enfield SA 5085"
const addressFallbacks = address => {
  const noUnit = address
    .replace(/^\s*(unit|apt|apartment|flat|shop|lot|suite)\s*\w+\s*[,/]?\s*/i, '')
    .replace(/^\s*\w+\s*\/\s*(?=\d)/, '');
  return noUnit !== address ? [noUnit] : [];
};

// Tries the full address first, then the simpler versions, so one
// unusual address doesn't drop the order from the route
const geocodeAddress = async address => {
  for (const query of [address, ...addressFallbacks(address)]) {
    const position = await geocodeQuery(query);
    if (position) {
      return position;
    }
  }
  return null;
};

// order -> { lat, lng } | null
const locateOrder = async order => {
  if (isCoord(order.lat) && isCoord(order.lng)) {
    return { lat: order.lat, lng: order.lng };
  }
  try {
    return await geocodeAddress(order.address || '');
  } catch (e) {
    return null;
  }
};

// ------------------------------------------------------------
// Route
// ------------------------------------------------------------

const toRad = deg => (deg * Math.PI) / 180;

// Straight-line distance between two { lat, lng } in km
export const distanceKm = (a, b) => {
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 6371 * 2 * Math.asin(Math.sqrt(h));
};

// Nearest-neighbour ordering from `start`.
// stops: [{ order, position }] -> same items in visiting order,
// each with legKm (from the previous stop) and totalKm (so far).
export const orderStops = (start, stops) => {
  const left = [...stops];
  const route = [];
  let current = start;
  let totalKm = 0;

  while (left.length) {
    let nearest = 0;
    let nearestKm = Infinity;
    left.forEach((stop, i) => {
      const km = distanceKm(current, stop.position);
      if (km < nearestKm) {
        nearest = i;
        nearestKm = km;
      }
    });

    const [stop] = left.splice(nearest, 1);
    totalKm += nearestKm;
    route.push({ ...stop, legKm: nearestKm, totalKm });
    current = stop.position;
  }

  return route;
};

// Pending orders -> { stops, unlocated, totalKm }
//   stops     : located orders in delivery order (see orderStops)
//   unlocated : orders whose address couldn't be found on the map
// onProgress(done, total) is called while addresses are looked up.
export const planRoute = async (start, orders, onProgress) => {
  const located = [];
  const unlocated = [];

  for (let i = 0; i < orders.length; i++) {
    const position = await locateOrder(orders[i]);
    if (position) {
      located.push({ order: orders[i], position });
    } else {
      unlocated.push(orders[i]);
    }
    onProgress?.(i + 1, orders.length);
  }

  const stops = orderStops(start, located);
  const road = await fetchRoadRoute(start, stops);
  return {
    stops: road
      ? stops.map((stop, i) => ({ ...stop, legKm: road.legs[i].km, legMin: road.legs[i].min }))
      : stops,
    unlocated,
    totalKm: road
      ? road.km
      : stops.length
      ? stops[stops.length - 1].totalKm
      : 0,
    totalMin: road?.min ?? null,
    // [[lat, lng], ...] along the roads, null -> straight lines
    path: road?.path ?? null,
  };
};

// ------------------------------------------------------------
// Road route (OSRM)
// ------------------------------------------------------------
// The driving route along real roads through every stop, in route
// order, from the public OSRM server (OpenStreetMap data, no key).
// Returns null if it can't be reached; the map then joins the
// stops with straight lines.

const OSRM_URL = 'https://router.project-osrm.org/route/v1/driving/';
const OSRM_TIMEOUT_MS = 10000;

const fetchRoadRoute = async (start, stops) => {
  if (!stops.length) {
    return null;
  }
  const coords = [start, ...stops.map(s => s.position)]
    .map(p => `${p.lng},${p.lat}`)
    .join(';');

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), OSRM_TIMEOUT_MS);
  try {
    const response = await fetch(
      `${OSRM_URL}${coords}?overview=full&geometries=geojson`,
      { signal: controller.signal },
    );
    if (!response.ok) {
      return null;
    }
    const [route] = (await response.json()).routes || [];
    if (!route || route.legs?.length !== stops.length) {
      return null;
    }
    return {
      km: route.distance / 1000,
      min: route.duration / 60,
      legs: route.legs.map(leg => ({
        km: leg.distance / 1000,
        min: leg.duration / 60,
      })),
      path: route.geometry.coordinates.map(([lng, lat]) => [lat, lng]),
    };
  } catch (e) {
    return null;
  } finally {
    clearTimeout(timer);
  }
};

export const formatMin = min =>
  min < 60
    ? `${Math.max(1, Math.round(min))} min`
    : `${Math.floor(min / 60)} h ${Math.round(min % 60)} min`;

export const formatKm = km =>
  km < 1 ? `${Math.round(km * 1000)} m` : `${km.toFixed(1)} km`;

// ------------------------------------------------------------
// Google Maps
// ------------------------------------------------------------

// Google Maps takes at most 10 places: the pickup + 9 stops
export const MAX_NAV_STOPS = 9;

const point = ({ lat, lng }) => `${lat},${lng}`;

// Directions from the pickup (PICKUP_ADDRESS) through every stop,
// in route order, each one a stop (A, B, C, ...) in Google Maps:
//   ...?api=1&origin=<pickup>&destination=<last stop>
//      &waypoints=<stop1>|<stop2>|...
// (The /maps/dir//a/b/c path form is not understood by the Android
// app: "Can't seem to find a way there".)
export const routeDirectionsUrl = stops => {
  const legs = stops.slice(0, MAX_NAV_STOPS).map(s => point(s.position));
  const destination = legs.pop();
  return (
    'https://www.google.com/maps/dir/?api=1&travelmode=driving' +
    `&origin=${encodeURIComponent(PICKUP_ADDRESS)}` +
    `&destination=${encodeURIComponent(destination)}` +
    (legs.length ? `&waypoints=${encodeURIComponent(legs.join('|'))}` : '')
  );
};
