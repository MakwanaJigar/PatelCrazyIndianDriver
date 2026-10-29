/**
 * Smart Route: nearest-first stop order and the Google Maps link.
 */

jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(async () => null),
  setItem: jest.fn(async () => {}),
}));
jest.mock('../src/data/orders', () => ({
  PICKUP_ADDRESS: '420 Grand Junction Road, Clearview SA 5085',
}));

import {
  distanceKm,
  orderStops,
  planRoute,
  routeDirectionsUrl,
} from '../src/utils/smartRoute';

const PICKUP = { lat: -34.8475089, lng: 138.613348 };

// 4 deliveries around Clearview, deliberately not in route order
const ORDERS = [
  { id: 'B', address: '17 Walkerville Tce, Gilberton', lat: -34.903, lng: 138.614 },
  { id: 'D', address: '1B Dunbarton St, Windsor Gardens', lat: -34.866, lng: 138.649 },
  { id: 'A', address: '12 Hampstead Rd, Manningham', lat: -34.874, lng: 138.62 },
  { id: 'C', address: '5 Main North Rd, Prospect', lat: -34.885, lng: 138.598 },
];

const toStops = orders =>
  orders.map(order => ({ order, position: { lat: order.lat, lng: order.lng } }));

describe('orderStops', () => {
  it('visits the nearest delivery first, then the nearest to that one', () => {
    const route = orderStops(PICKUP, toStops(ORDERS));
    expect(route.map(s => s.order.id)).toEqual(['A', 'C', 'B', 'D']);

    // Every stop is the closest one still left from the previous stop
    let current = PICKUP;
    const left = toStops(ORDERS);
    route.forEach(stop => {
      const closest = Math.min(...left.map(s => distanceKm(current, s.position)));
      expect(distanceKm(current, stop.position)).toBeCloseTo(closest, 6);
      left.splice(left.findIndex(s => s.order.id === stop.order.id), 1);
      current = stop.position;
    });
  });

  it('keeps every order', () => {
    expect(orderStops(PICKUP, toStops(ORDERS))).toHaveLength(ORDERS.length);
  });
});

describe('routeDirectionsUrl', () => {
  it('starts at the pickup and has every delivery as a stop, in route order', () => {
    const route = orderStops(PICKUP, toStops(ORDERS));
    const url = new URL(routeDirectionsUrl(route));
    console.log(`Google Maps link:\n${url.href}`);

    expect(url.origin + url.pathname).toBe('https://www.google.com/maps/dir/');
    expect(url.searchParams.get('api')).toBe('1');
    expect(url.searchParams.get('travelmode')).toBe('driving');
    expect(url.searchParams.get('origin')).toBe(
      '420 Grand Junction Road, Clearview SA 5085',
    );
    // Stops 1-3 as waypoints, stop 4 as the destination
    expect(url.searchParams.get('waypoints').split('|')).toEqual([
      '-34.874,138.62',
      '-34.885,138.598',
      '-34.903,138.614',
    ]);
    expect(url.searchParams.get('destination')).toBe('-34.866,138.649');
  });
});

describe('planRoute', () => {
  afterEach(() => {
    delete global.fetch;
  });

  it('routes all orders nearest first, with road km from OSRM', async () => {
    global.fetch = jest.fn(async () => ({
      ok: true,
      json: async () => ({
        routes: [
          {
            distance: 12200,
            duration: 1800,
            legs: [1, 2, 3, 4].map(() => ({ distance: 3050, duration: 450 })),
            geometry: { coordinates: [[138.613348, -34.8475089]] },
          },
        ],
      }),
    }));

    const route = await planRoute(PICKUP, ORDERS);
    expect(route.stops.map(s => s.order.id)).toEqual(['A', 'C', 'B', 'D']);
    expect(route.unlocated).toEqual([]);
    expect(route.totalKm).toBeCloseTo(12.2);
    expect(route.totalMin).toBeCloseTo(30);
    expect(route.path).toEqual([[-34.8475089, 138.613348]]);
  });

  it('still plans the route when the road service is down', async () => {
    global.fetch = jest.fn(async () => {
      throw new Error('offline');
    });

    const route = await planRoute(PICKUP, ORDERS);
    expect(route.stops.map(s => s.order.id)).toEqual(['A', 'C', 'B', 'D']);
    expect(route.path).toBeNull();
  });
});
