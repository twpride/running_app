import Geolocation from 'react-native-geolocation-service';
import RNSimpleCompass from 'react-native-simple-compass';
import React, { useEffect, useState, useReducer, useContext, createContext } from 'react';
import * as api from './api'
import MapboxGL from '@react-native-mapbox-gl/maps';
import { hasLocationPermission, startForegroundService, stopForegroundService } from './sys'
import {
  Alert,
  Button,
  Linking,
  PermissionsAndroid,
  Platform,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  ToastAndroid,
  View,
} from 'react-native';

import { coord } from './testroute'






const token = "pk.eyJ1IjoiaG93YXJkaHdhbmciLCJhIjoiY2tqOXByeW1uMDM4ZTJxbzF1NDJueTlpaiJ9._2ekqa3y13uCRRAqJuezUA";
MapboxGL.setAccessToken(token);

const TrackerContext = createContext()

export const tr_act = {
  SET_LOAD_STOP: 'SET_LOAD_STOP',
  RX_WPT: 'RX_WPT',
  RX_POS: 'RX_POS',
  CLR_WPTS: 'CLR_WPTS',
}
const trReducer = (state, action) => {
  Object.freeze(state);

  switch (action.type) {

    case tr_act.RX_WPT:
      const position = [...Object.values(action.wpt.coords), action.wpt.timestamp];
      return {
        ...state,
        waypoints: [...state.waypoints, position],
        position
      }
    case tr_act.RX_POS:
      return {
        ...state,
        position: [...Object.values(action.wpt.coords), action.wpt.timestamp]
      }
    case tr_act.CLR_WPTS:
      return {
        ...state,
        waypoints: []
      }
    default:
      return state;
  }
};





const YourApp = () => {
  const [tr, trDispatch] = useReducer(trReducer, { waypoints: [] })
  const [watchId, setWatchId] = useState(null)
  const [ori, setOri] = useState(0)

  const getPos = () => {
    Geolocation.getCurrentPosition(
      (wpt) => {
        trDispatch({ type: tr_act.RX_POS, wpt })
      },
      (error) => {
        console.log(error);
      },
      {
        accuracy: {
          android: 'high',
          ios: 'bestForNavigation',
        },
        enableHighAccuracy: true,
        distanceFilter: 0,
        showLocationDialog: true,
        forceRequestLocation: true,
      },
    )
  };


  const watch = async () => {
    if (! await hasLocationPermission()) {
      return;
    }
    await startForegroundService();
    setWatchId(
      Geolocation.watchPosition(
        (wpt) => {
          console.log(wpt.coords.heading)
          trDispatch({ type: tr_act.RX_WPT, wpt })
        },
        (error) => {
          console.log(error);
        },
        {
          accuracy: {
            android: 'high',
            ios: 'bestForNavigation',
          },
          enableHighAccuracy: true,
          distanceFilter: 0,
          interval: 5000,
          fastestInterval: 2000,
          forceRequestLocation: true,
          showLocationDialog: true,
        },
      )
    );
  };

  const stopWatch = () => {
    if (watchId !== null) {
      stopForegroundService();
      Geolocation.clearWatch(watchId);
      setWatchId(null)
      api.addRun(tr.waypoints)
      trDispatch({ type: tr_act.CLR_WPT })
    }
  };


  const [gjson, setGjson] = useState(
    {
      "type": "FeatureCollection",
      "features": [
        {
          "type": "Feature",
          "properties": {},
          "geometry": {
            "type": "LineString",
            "coordinates": []
          }
        }
      ]
    }

  )

  const update = () => {
    setGjson(state => ({
      ...state,
      features: [
        {
          ...state.features[0],
          geometry: {
            ...state.features[0].geometry,
            coordinates: [
              ...state.features[0].geometry.coordinates,
              coord[state.features[0].geometry.coordinates.length]
            ]
          }
        }
      ]
    }))
  }

  useEffect(() => {
    MapboxGL.setTelemetryEnabled(false);

    const degree_update_rate = 5; // Number of degrees changed before the callback is triggered
    RNSimpleCompass.start(degree_update_rate, (degree) => {
      console.log('You are facing', degree);
      setOri(degree)
      // RNSimpleCompass.stop();
    });

    getPos()
  }, [])

  return (
    <TrackerContext.Provider value={{ tr, trDispatch }}>
      <View style={styles.page}>
        <View style={styles.container}>
          <MapboxGL.MapView style={styles.map} pitchEnabled>
            <MapboxGL.Camera
              defaultSettings={{ zoomLevel: 18 }}
              // centerCoordinate={tr.position && tr.position.slice(4, 6)}
              centerCoordinate={coord[gjson.features[0].geometry.coordinates.length]}
              // heading={ori + 25}
              animationDuration={500}
            />
            <MapboxGL.ShapeSource id="source" shape={gjson} >
              <MapboxGL.LineLayer id='layer1' style={{ lineColor: 'blue' }} />
              <MapboxGL.CircleLayer id='layer2' style={{ circleColor: 'blue', circleRadius: 2 }} />
            </MapboxGL.ShapeSource>
          </MapboxGL.MapView>
        </View>
        <View style={{ width: '100%', flexDirection: 'row', justifyContent: 'space-around' }}>
          <Button title='start' onPress={watch} />
          <Button title='stop' onPress={stopWatch} />
          <Button title='update' onPress={update} />
        </View>
      </View>
    </TrackerContext.Provider>
  );

}

const styles = StyleSheet.create({
  page: {
    flex: 1,
  },
  container: {
    height: '80%',
    width: '100%',
    backgroundColor: 'blue',
  },
  map: {
    flex: 1,
  },
});

export default YourApp;


