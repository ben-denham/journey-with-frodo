import React, {useEffect} from 'react';
import {createUseStyles} from 'react-jss';
import {Map, ImageOverlay, Marker, ScaleControl} from 'react-leaflet';
import L from 'leaflet';

import 'leaflet/dist/leaflet.css';
import 'leaflet-easybutton/src/easy-button.css';
import 'leaflet-easybutton/src/easy-button.js';

import map from '../images/map.jpeg';
import frodo from '../images/frodo-silhouette.png';
import home from '../images/home.svg';

const useStyles = createUseStyles({
  mapContainer: {
    position: 'relative',
    display: 'inline-block',
    maxWidth: 3200 / 4.55,
    width: '100%',
  },
  mapSpacer: {
    marginTop: ((2400 / 3200) * 100) + '%',
  },
  map: {
    background: 'url(images/parchment.jpg);',
    border: '1px solid black',
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
  },
});


function MiddleEarthMap({frodoMapYXPx}) {
  const classes = useStyles();
  const mapRef = React.createRef();

  const pxPerMile = 85 / 50; // Based on scale in image.
  const metresPerMile = 1609.344;
  const pxPerMeter = pxPerMile / metresPerMile;
  const imageHW = [2400, 3200];
  const mapBounds = [[0, 0], imageHW.map(x => x / pxPerMeter)];
  const mapCenter = mapBounds[1].map(x => x / 2);
  const initialMinZoom = -100;

  const frodoMapYXMiles = [
    (imageHW[0] - frodoMapYXPx[0]),
    frodoMapYXPx[1]
  ].map(x => x / pxPerMeter)

  const iconScale = 0.2;
  const frodoIcon = new L.Icon({
    iconUrl: frodo,
    iconSize: [200 * iconScale, 352 * iconScale],
  })

  function fitToBounds() {
    if (mapRef.current) {
      const map = mapRef.current.leafletElement;
      // Reset the minZoom to allow fitting bounds.
      map.setMinZoom(initialMinZoom);
      // Zoom and recenter map to the bounds.
      map.fitBounds(mapBounds);
      // Prevent zooming out father than the mapBounds.
      map.setMinZoom(map.getZoom());
    }
  }

  let mapSetupFlag = false;
  function setupMap() {
    fitToBounds();
    if (!mapSetupFlag && mapRef.current) {
      const map = mapRef.current.leafletElement;
      mapSetupFlag = true;
      // Add "Home view" button to map.
      L.easyButton('<img style="margin-top: 6px;" src="' + home + '">', function(btn, map) {
        fitToBounds();
      }).addTo(map);
    }
  }

  useEffect(() => {
    window.addEventListener('resize', fitToBounds);
    return () => window.removeEventListener('resize', fitToBounds);
  })

  return <div className={classes.mapContainer}>
    <div className={classes.mapSpacer}></div>
    <Map
      crs={L.CRS.Simple} center={mapCenter}
      zoom={0} maxZoom={-7} minZoom={initialMinZoom} zoomSnap={0}
      attributionControl={false}
      ref={mapRef} onlayeradd={setupMap}
      tap={!L.Browser.mobile} dragging={!L.Browser.mobile}
      className={classes.map}>
      <ImageOverlay url={map} bounds={mapBounds} />
      <ScaleControl />
      <Marker position={frodoMapYXMiles} icon={frodoIcon}></Marker>
    </Map>
  </div>
}

export default MiddleEarthMap;
