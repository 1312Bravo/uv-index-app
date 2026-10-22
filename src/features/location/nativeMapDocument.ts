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
      .leaflet-tile { filter: grayscale(1) contrast(1.12); }
      .leaflet-control-zoom {
        border: 1px solid #dddddd !important;
        border-radius: 8px !important;
        box-shadow: 0 2px 8px #0000001a !important;
        margin: 12px !important;
        overflow: hidden;
      }
      .leaflet-control-zoom a {
        background: #ffffff;
        color: #333333;
        height: 30px;
        line-height: 30px;
        width: 30px;
      }
      .leaflet-control-attribution {
        background: #ffffffe6 !important;
        border-top-left-radius: 5px;
        font-size: 9px !important;
      }
      .leaflet-marker-icon.${LOCATION_MARKER_CLASS} { background: transparent; border: 0; }
      .${LOCATION_MARKER_CLASS}__glyph {
        align-items: center;
        background: #fffffff0;
        border: 1px solid #555555;
        border-radius: 50%;
        box-shadow: 0 1px 5px #00000033;
        box-sizing: border-box;
        color: #151515;
        display: flex;
        font: 500 16px/1 Arial, sans-serif;
        height: 24px;
        justify-content: center;
        width: 24px;
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
