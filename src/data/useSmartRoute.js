import { useCallback, useEffect, useRef, useState } from 'react';
import { planRoute } from '../utils/smartRoute';
import { PICKUP_POSITION } from './orders';

// ============================================================
// useSmartRoute(pendingOrders)
// ------------------------------------------------------------
// Plans the nearest-first route through `pendingOrders` (see
// utils/smartRoute.js), starting from the pickup location
// (PICKUP_ADDRESS), for Home, Smart Route and Order Details.
//
//   const { phase, progress, start, route, plan } =
//     useSmartRoute(pendingOrders);
//
//   phase    'geocoding' -> 'ready'
//   progress { done, total } addresses looked up so far
//   start    pickup { lat, lng }
//   route    { stops, unlocated, totalKm } once ready
//   plan()   re-plan now (pull-to-refresh)
//
// Re-plans when an order is delivered / newly assigned. While it
// re-plans, the last route stays on screen.
// ============================================================

const start = PICKUP_POSITION;

// Changes only when the set of stops does, not on every refresh
const stopsKey = orders => orders.map(o => `${o.id}|${o.address}`).join('\n');

// Last route planned by any screen, so Order Details / Smart Route
// open with Home's route straight away instead of planning again
let lastPlan = { key: null, route: null };

export const useSmartRoute = pendingOrders => {
  const key = stopsKey(pendingOrders);
  const cached = lastPlan.key === key ? lastPlan.route : null;

  const [phase, setPhase] = useState(cached ? 'ready' : 'geocoding');
  const [progress, setProgress] = useState({ done: 0, total: 0 });
  const [route, setRoute] = useState(cached);

  // Only the newest plan may update state
  const planId = useRef(0);
  const ordersRef = useRef(pendingOrders);
  ordersRef.current = pendingOrders;

  const plan = useCallback(async () => {
    const id = ++planId.current;
    const planKey = stopsKey(ordersRef.current);
    const result = await planRoute(
      start,
      ordersRef.current,
      (done, total) => {
        if (id === planId.current) {
          setProgress({ done, total });
        }
      },
    );
    lastPlan = { key: planKey, route: result };
    if (id === planId.current) {
      setRoute(result);
      setPhase('ready');
    }
  }, []);

  useEffect(() => {
    if (lastPlan.key === key) {
      // Another screen already planned these stops
      setRoute(lastPlan.route);
      setPhase('ready');
      return;
    }
    plan();
  }, [key, plan]);

  return { phase, progress, start, route, plan };
};
