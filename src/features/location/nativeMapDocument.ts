import {
  LOCATION_MARKER_ANCHOR,
  LOCATION_MARKER_CLASS,
  LOCATION_MARKER_HTML,
  LOCATION_MARKER_SIZE,
} from './locationMapMarker';

const EUROPE_LATITUDE = 50.5;
const EUROPE_LONGITUDE = 15;

export function createNativeMapDocument() {
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
    <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
    <style>
      html, body, #map { width: 100%; height: 100%; margin: 0; }
      body { overflow: hidden; background: #f2f2f2; }
      .leaflet-container { background: #f2f2f2; font: 12px Arial, sans-serif; }
      .leaflet-control-attribution { font-size: 10px !important; }
      .leaflet-tile { filter: grayscale(1) brightness(1.03) contrast(0.96); }
      .leaflet-marker-icon.${LOCATION_MARKER_CLASS} { background: transparent; border: 0; }
      .${LOCATION_MARKER_CLASS}__glyph {
        display: block;
        color: #151515;
        font: 700 15px/16px Arial, sans-serif;
        text-align: center;
        text-shadow: 0 0 2px #FFFFFF, 0 0 4px #FFFFFF;
      }
    </style>
    <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
  </head>
  <body>
    <div id="map" aria-label="Tap the map to choose a location"></div>
    <script>
      const map = L.map('map', { zoomControl: true, attributionControl: true })
        .setView([${EUROPE_LATITUDE}, ${EUROPE_LONGITUDE}], 4);
      L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        keepBuffer: 2,
        updateWhenIdle: true,
        updateWhenZooming: false,
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      }).addTo(map);

      let marker = null;
      const showMarker = (latitude, longitude) => {
        const point = [latitude, longitude];
        if (marker) marker.setLatLng(point);
        else {
          marker = L.marker(point, {
            icon: L.divIcon({
              className: '${LOCATION_MARKER_CLASS}',
              html: '${LOCATION_MARKER_HTML}',
              iconSize: [${LOCATION_MARKER_SIZE}, ${LOCATION_MARKER_SIZE}],
              iconAnchor: [${LOCATION_MARKER_ANCHOR}, ${LOCATION_MARKER_ANCHOR}]
            })
          }).addTo(map);
        }
      };

      window.uvScoutSelectLocation = (latitude, longitude, shouldZoom) => {
        showMarker(latitude, longitude);
        if (shouldZoom) {
          map.flyTo([latitude, longitude], 14, { duration: 0.45 });
        }
      };

      map.on('click', (event) => {
        showMarker(event.latlng.lat, event.latlng.lng);
        window.ReactNativeWebView.postMessage(JSON.stringify({
          type: 'select',
          latitude: event.latlng.lat,
          longitude: event.latlng.lng
        }));
      });
    </script>
  </body>
</html>`;
}
