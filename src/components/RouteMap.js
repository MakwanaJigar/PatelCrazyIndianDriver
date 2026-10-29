import React, { useMemo } from 'react';
import { Linking, StyleSheet } from 'react-native';
import { WebView } from 'react-native-webview';
import { showAlert } from './AppAlert';
import { API_BASE_URL } from '../api/client';
import { MAX_NAV_STOPS, routeDirectionsUrl } from '../utils/smartRoute';

// ============================================================
// ROUTE MAP
// ------------------------------------------------------------
// Leaflet + OpenStreetMap map of a smart route: the pickup
// (green "P") and numbered stops (red) joined in visiting order,
// along the roads when `path` is given (route.path), otherwise by
// dashed straight lines.
//
//   <RouteMap start={start} stops={route.stops} path={route.path} />
//
// Also exports the Google Maps helpers shared by Home and the
// Smart Route screen:
//   openInMaps(url)
//   startRouteNavigation(stops)  pickup -> all stops, in order
// ============================================================

const RED = '#E92025';
const GREEN = '#078B53';

const buildMapHtml = (start, positions, road) => `
<!DOCTYPE html>
<html>
  <head>
    <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
    <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
    <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
    <style>
      html, body, #map { margin: 0; padding: 0; height: 100%; }
      .pin {
        width: 26px; height: 26px; border-radius: 13px;
        background: ${RED}; color: #fff; border: 2px solid #fff;
        font: 800 13px sans-serif; display: flex;
        align-items: center; justify-content: center;
        box-shadow: 0 2px 6px rgba(0,0,0,.35);
      }
      .me { background: ${GREEN}; }
    </style>
  </head>
  <body>
    <div id="map"></div>
    <script>
      var start = ${JSON.stringify(start)};
      var stops = ${JSON.stringify(positions)};
      var road = ${JSON.stringify(road)};
      var map = L.map('map', { zoomControl: false });
      L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; OpenStreetMap'
      }).addTo(map);

      var icon = function (html, cls) {
        return L.divIcon({
          html: '<div class="pin ' + cls + '">' + html + '</div>',
          className: '', iconSize: [26, 26], iconAnchor: [13, 13]
        });
      };

      var path = [[start.lat, start.lng]];
      L.marker(path[0], { icon: icon('P', 'me') }).addTo(map);
      stops.forEach(function (p, i) {
        path.push([p.lat, p.lng]);
        L.marker([p.lat, p.lng], { icon: icon(i + 1, '') }).addTo(map);
      });
      if (road && road.length) {
        L.polyline(road, { color: '${RED}', weight: 5, opacity: .85 }).addTo(map);
        path = path.concat(road);
      } else {
        L.polyline(path, { color: '${RED}', weight: 4, opacity: .8, dashArray: '8 8' }).addTo(map);
      }
      map.fitBounds(path, { padding: [30, 30], maxZoom: 15 });
    </script>
  </body>
</html>
`;

const RouteMap = ({ start, stops, path, style }) => {
  // Rebuilt only when a position changes, so the map doesn't reload
  // on every orders refresh (path only changes when the route is
  // re-planned)
  const positionsKey = JSON.stringify([start, stops.map(s => s.position)]);
  const html = useMemo(() => {
    const [s, positions] = JSON.parse(positionsKey);
    return buildMapHtml(s, positions, path || null);
  }, [positionsKey, path]);

  return (
    <WebView
      originWhitelist={['*']}
      source={{ html, baseUrl: API_BASE_URL }}
      style={[styles.map, style]}
      scrollEnabled={false}
      nestedScrollEnabled
    />
  );
};

export default RouteMap;

export const openInMaps = url =>
  Linking.openURL(url).catch(() =>
    showAlert('Unable to open maps', 'Please install Google Maps.', [], {
      type: 'error',
    }),
  );

export const startRouteNavigation = stops => {
  const url = routeDirectionsUrl(stops);
  if (stops.length > MAX_NAV_STOPS) {
    showAlert(
      'Long route',
      `Google Maps can show ${MAX_NAV_STOPS} stops at a time. It will guide you through the first ${MAX_NAV_STOPS}; start again for the rest.`,
      [{ text: 'Start', onPress: () => openInMaps(url) }],
      { type: 'info' },
    );
    return;
  }
  openInMaps(url);
};

const styles = StyleSheet.create({
  map: {
    flex: 1,
  },
});
