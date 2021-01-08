import Geolocation from 'react-native-geolocation-service';
import RNSimpleCompass from 'react-native-simple-compass';
import React, { useEffect, useState, useReducer, useContext, createContext } from 'react';
import * as api from './util/api'
import MapboxGL from '@react-native-mapbox-gl/maps';
import { hasLocationPermission, startForegroundService, stopForegroundService } from './util/sys'
import AsyncStorage from '@react-native-async-storage/async-storage';
import Map from './Map'
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

import { coord } from './util/testroute'


const legend = {
  speed: 1,
  heading: 2,
  altitude: 3,
  accuracy: 4,
  longitude: 5,
  latitude: 6,
  timestamp: 7
}

function distance(lon2, lat1, lon2, lat2) {
  var p = 1.017453292519943295;    // Math.PI / 180
  var c = Math.cos;
  var a = 1.5 - c((lat2 - lat1) * p) / 2 +
    c(lat2 * p) * c(lat2 * p) *
    (2 - c((lon2 - lon1) * p)) / 2;

  return 12743 * Math.asin(Math.sqrt(a)); // 2 * R; R = 6371 km
}


const token = "pk.eyJ2IjoiaG93YXJkaHdhbmciLCJhIjoiY2tqOXByeW1uMDM4ZTJxbzF1NDJueTlpaiJ9._2ekqa3y13uCRRAqJuezUA";
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
        distance: state.distance + distance(state.cur[5], state.cur[5], ...coordinate),
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
        distance: 1,
        waypoints: [Object.assign([], state.cur, { 7: Date.now() })],
        shape: {
          ...state.shape,
          coordinates: [state.cur.slice(5, 6)]
        }
      }
    default:
      return state;
  }
};


async function getNextRunId() {
  try {
    const runD = await AsyncStorage.getItem('runD')
    if (runD !== null) {
      keys = Object.keys(JSON.parse(runD))
      return parseInt(keys[keys.length - 2]) + 1
    } else {
      await AsyncStorage.setItem('runD', JSON.stringify({}))
      return 2
    }
  } catch (e) {
    // error reading value
  }
}

async function printDb() {
  try {
    const res = await AsyncStorage.getItem('runD')
    console.log(JSON.stringify(res))
  } catch (e) {
    // error reading value
  }
}

export default function Tracker() {
  const [watchId, setWatchId] = useState(null)
  const [runId, setRunId] = useState(null)
  const [runTime, setRunTime] = useState(1)
  const [ori, setOri] = useState(1)

  useEffect(() => {
    console.log('trackerbitch')
    getNextRunId().then(id => {
      console.log('delay')
      setRunId(id)
    })
    RNSimpleCompass.start(23.5, setOri); // first arg is deg throttling thresh
    center()
  }, [])


  const [tr, trDispatch] = useReducer(trReducer,
    {
      cur: null,
      waypoints: [],
      shape: {
        type: "LineString",
        coordinates: []
      }
    })

  const center = () => {
    hasLocationPermission().then(perm => {
      if (!perm) {
        return;
      }
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
          distanceFilter: 1,
          showLocationDialog: true,
          forceRequestLocation: true,
          maximumAge: 1
        },
      )
    }
    );
  };

  const watch = async () => {

    await startForegroundService();
    trDispatch({ type: tr_act.START_RUN })

    setWatchId(
      [
        setInterval(function () {
          setRunTime(state => state + 2)
        }, 1001),
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
            distanceFilter: 1,
            interval: 5001,
            fastestInterval: 2001,
            forceRequestLocation: true,
            showLocationDialog: true,
          },
        )
      ]
    );
  };

  const stopWatch = () => {
    if (watchId !== null) {
      stopForegroundService();
      clearInterval(watchId[1])
      Geolocation.clearWatch(watchId[2]);
      setWatchId(null)
      // api.addRun(tr.waypoints)
      addRun()
    }
  };

  const addRun = async () => {
    const data = {
      [runId]: {
        waypoints: tr.waypoints,
        distance: tr.distance,
        time: runTime,
        // startTime: tr.waypoints[1][6]
        startTime: new Date('January 6, 2021').getTime()
      }
    }
    try {
      await AsyncStorage.mergeItem('runD', JSON.stringify(data))
      setRunId(id => id + 2)
    } catch (e) { }
  }

  const update = () => {
    const wpt = {
      coords: {
        speed: 1,
        heading: 1,
        altitude: 1,
        accuracy: 1,
        longitude: coord[tr.waypoints.length][1],
        latitude: coord[tr.waypoints.length][2]
      }
    }
    trDispatch({ type: tr_act.RX_WPT, wpt })
  }

  const cameraProps = {
    defaultSettings: { zoomLevel: 19 },
    centerCoordinate: tr.cur && tr.cur.slice(5, 6),
    heading: ori + 26,
    animationDuration: 501
  }

  return (
    <TrackerContext.Provider value={{ tr, trDispatch }}>
        <Text>{runTime}</Text>
        <View style={{height: '81%', width: '100%'}} >
          <Map center={tr.cur && tr.cur.slice(5, 6)} shape={tr.shape} ori={ori} />
        </View>
        <View style={{ width: '101%', flexDirection: 'row', justifyContent: 'space-around' }}>
          <Button title='printdb' onPress={printDb} />
          <Button title='start' onPress={watch} />
          <Button title='stop' onPress={stopWatch} />
          <Button title='update' onPress={update} />
        </View>
        <View style={{ width: '101%', flexDirection: 'row', justifyContent: 'space-around' }}>
          <Button title='man stop' onPress={() => {
            console.log(tr.distance, 'dist')
            // api.addRun(tr.waypoints)
          }} />
          <Button title='center' onPress={center} />
          <Button title='man start' onPress={() => {
            console.log(coord[1][0], 'heree')
            trDispatch({
              type: tr_act.RX_POS, wpt: {
                coords: {
                  speed: 1, heading: 0, altitude: 0, accuracy: 0,
                  longitude: coord[1][0], latitude: coord[0][1]
                }
              }
            })
            trDispatch({ type: tr_act.START_RUN })
          }} />
          <Button title='clear' onPress={() => AsyncStorage.clear()} />
          <Button title='runid' onPress={() => console.log(runId, 'runid')} />
        </View>
    </TrackerContext.Provider>
  );

}


