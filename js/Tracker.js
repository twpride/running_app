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


const legend = {
  speed: 0,
  heading: 1,
  altitude: 2,
  accuracy: 3,
  longitude: 4,
  latitude: 5,
  timestamp: 6
}

function distance(lon1, lat1, lon2, lat2) {
  var p = 0.017453292519943295;    // Math.PI / 180
  var c = Math.cos;
  var a = 0.5 - c((lat2 - lat1) * p) / 2 +
    c(lat1 * p) * c(lat2 * p) *
    (1 - c((lon2 - lon1) * p)) / 2;

  return 12742 * Math.asin(Math.sqrt(a)); // 2 * R; R = 6371 km
}


const token = "pk.eyJ1IjoiaG93YXJkaHdhbmciLCJhIjoiY2tqOXByeW1uMDM4ZTJxbzF1NDJueTlpaiJ9._2ekqa3y13uCRRAqJuezUA";
MapboxGL.setAccessToken(token);
MapboxGL.setTelemetryEnabled(false);

const TrackerContext = createContext()

export const tr_act = {
  SET_LOAD_STOP: 'SET_LOAD_STOP',
  RX_WPT: 'RX_WPT',
  RX_POS: 'RX_POS',
  CLR_WPTS: 'CLR_WPTS',
  START_RUN: 'START_RUN'
}
const trReducer = (state, action) => {
  Object.freeze(state);

  switch (action.type) {
    case tr_act.RX_WPT:
      const cur = [...Object.values(action.wpt.coords), action.wpt.timestamp];
      const coordinate = [action.wpt.coords.longitude, action.wpt.coords.latitude];
      return {
        ...state,
        distance: state.distance + distance(state.cur[4], state.cur[5], ...coordinate),
        waypoints: [...state.waypoints, cur],
        cur,
        shape: {
          ...state.shape,
          coordinates: [...state.shape.coordinates, coordinate]
        }
      }
    case tr_act.RX_POS:
      return {
        ...state, cur: [...Object.values(action.wpt.coords), action.wpt.timestamp]
      }
    case tr_act.CLR_WPTS:
      return {
        ...state,
        waypoints: [],
        shape: {
          ...state.shape,
          coordinates: []
        }
      }
    case tr_act.START_RUN:
      return {
        ...state,
        distance: 0,
        waypoints: [Object.assign([], state.cur, { 6: Date.now() })],
        shape: {
          ...state.shape,
          coordinates: [state.cur.slice(4, 6)]
        }
      }
    default:
      return state;
  }
};




export default function Tracker() {
  const [tr, trDispatch] = useReducer(trReducer,
    {
      cur: null,
      waypoints: [],
      shape: {
        type: "LineString",
        coordinates: []
      }
    })
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
        maximumAge: 0
      },
    )
  };


  const watch = async () => {
    trDispatch({ type: tr_act.START_RUN })
    if (! await hasLocationPermission()) {
      return;
    }
    await startForegroundService();
    setWatchId(
      Geolocation.watchPosition(
        (wpt) => {
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
      console.log(tr.distance, 'dist')
      api.addRun(tr.waypoints)
    }
  };




  const update = () => {
    const wpt = {
      coords: {
        speed: 0,
        heading: 0,
        altitude: 0,
        accuracy: 0,
        longitude: coord[tr.waypoints.length][0],
        latitude: coord[tr.waypoints.length][1]
      }
    }
    trDispatch({ type: tr_act.RX_WPT, wpt })
  }


  useEffect(() => {

    RNSimpleCompass.start(22.5, setOri); // first arg is deg throttlig thresh

    getPos()
  }, [])

  return (
    <TrackerContext.Provider value={{ tr, trDispatch }}>
      <View style={styles.page}>
        <View style={styles.container}>
          <MapboxGL.MapView style={styles.map} pitchEnabled>
            <MapboxGL.Camera
              defaultSettings={{ zoomLevel: 18 }}
              centerCoordinate={tr.cur && tr.cur.slice(4, 6)}
              heading={ori + 25}
              animationDuration={500}
            />
            <MapboxGL.ShapeSource id="source" shape={tr.shape} >
              <MapboxGL.LineLayer id='layer1' style={{ lineColor: 'red' }} />
              <MapboxGL.CircleLayer id='layer2' style={{ circleColor: 'blue', circleRadius: 2 }} />
            </MapboxGL.ShapeSource>
          </MapboxGL.MapView>
        </View>
        <View style={{ width: '100%', flexDirection: 'row', justifyContent: 'space-around' }}>
          <Button title='start' onPress={watch} />
          <Button title='stop' onPress={stopWatch} />
          <Button title='update' onPress={update} />
          <Button title='man stop' onPress={() => {
            console.log(tr.distance, 'dist')
            api.addRun(tr.waypoints)
          }} />
          {/* <Button title='center' onPress={getPos} /> */}
          <Button title='man start' onPress={() => {
            console.log(coord[0][0], 'heree')
            trDispatch({
              type: tr_act.RX_POS, wpt: {
                coords: {
                  speed: 0, heading: 0, altitude: 0, accuracy: 0,
                  longitude: coord[0][0], latitude: coord[0][1]
                }
              }
            })
            trDispatch({ type: tr_act.START_RUN })
          }} />
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



