import React from 'react';
import MapboxGL from '@react-native-mapbox-gl/maps';

const Map = ({ center, shape, ori }) => {
  return (
    <MapboxGL.MapView style={{ flex: 1 }} pitchEnabled>
      {/* <MapboxGL.Camera
        defaultSettings={{ zoomLevel: 18 }}
        centerCoordinate={center}
        heading={ori + 25}
        animationDuration={500}
      />
      <MapboxGL.ShapeSource id="source" shape={shape} >
        <MapboxGL.LineLayer id='layer1' style={{ lineColor: 'green' }} />
        <MapboxGL.CircleLayer id='layer2' style={{ circleColor: 'green', circleRadius: 2 }} />
      </MapboxGL.ShapeSource> */}
    </MapboxGL.MapView>
  );
}

export default Map;