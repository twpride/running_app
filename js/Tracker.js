import Geolocation from 'react-native-geolocation-service';
import RNSimpleCompass from 'react-native-simple-compass';
import React, { useEffect, useState, useReducer } from 'react';
import * as api from './util/api'
import MapboxGL from '@react-native-mapbox-gl/maps';
import { hasLocationPermission, startForegroundService, stopForegroundService } from './util/sys'
import AsyncStorage from '@react-native-async-storage/async-storage';
import Map from './Map'
import {
  Button,
  Text,
  View,
} from 'react-native';

import { coord } from './util/testroute'


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
    case tr_act.START_RUN:
      return {
        ...state,
        distance: 0,
        waypoints: [Object.assign([], state.cur, { 6: Date.now() })],
        shape: [state.cur.slice(4, 6)]
      }
    case tr_act.RX_WPT:
      const cur = [...Object.values(action.wpt.coords), action.wpt.timestamp];
      const coordinate = [action.wpt.coords.longitude, action.wpt.coords.latitude];
      return {
        ...state,
        distance: state.distance + distance(state.cur[4], state.cur[5], ...coordinate),
        waypoints: [...state.waypoints, cur],
        shape: [...state.shape, coordinate],
        cur
      }
    case tr_act.RX_POS:
      return {
        ...state, cur: [...Object.values(action.wpt.coords), action.wpt.timestamp]
      }
    case tr_act.CLR_WPTS:
      return {
        ...state,
        waypoints: [],
        shape: []
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
      return parseInt(keys[keys.length - 1]) + 1
    } else {
      await AsyncStorage.setItem('runD', JSON.stringify({}))
      return 1
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

export default function Tracker({ setRunD }) {
  const [watchId, setWatchId] = useState(null)
  const [runId, setRunId] = useState(null)
  const [runTime, setRunTime] = useState(0)
  const [ori, setOri] = useState(0)

  useEffect(() => {


    getNextRunId().then(id => setRunId(id))
    RNSimpleCompass.start(22.5, setOri); // first arg is deg throttling thresh
    center()

    return () => {
      RNSimpleCompass.stop();
      if (watchId !== null) {
        clearInterval(watchId[0])
        Geolocation.stopObserving()
        // Geolocation.clearWatch(watchId[1]);
        setWatchId(null)
      }
    }
  }, [])


  const [tr, trDispatch] = useReducer(trReducer,{})

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
          distanceFilter: 0,
          showLocationDialog: true,
          forceRequestLocation: true,
          maximumAge: 0
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
          setRunTime(state => state + 1)
        }, 1000),
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
      ]
    );


  };

  const stopWatch = () => {
    if (watchId !== null) {
      stopForegroundService();
      clearInterval(watchId[0])
      Geolocation.clearWatch(watchId[1]);
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
        // startTime: tr.waypoints[0][6]
        startTime: new Date('January 1, 2021').getTime()
      }
    }
    try {
      setRunD(state => ({ ...state, ...data }))
      setRunId(id => id + 1)
      await AsyncStorage.mergeItem('runD', JSON.stringify(data))
    } catch (e) {
      console.log(e)
    }
  }

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


  return (
    <>
      <Text>{runTime}</Text>
      <View style={{ height: '80%', width: '100%' }} >
        <Map center={tr.cur && tr.cur.slice(4, 6)} shape={tr.shape} ori={ori} />
      </View>
      <View style={{ width: '100%', flexDirection: 'row', justifyContent: 'space-around' }}>
        <Button title='start' onPress={watch} />
        <Button title='stop' onPress={stopWatch} />
        <Button title='center' onPress={center} />
      </View>
      <View style={{ width: '100%', flexDirection: 'row', justifyContent: 'space-around' }}>
        <Button title='update' onPress={update} />
        <Button title='man stop' onPress={() => {
          console.log(tr.distance, 'dist')
          // api.addRun(tr.waypoints)
          addRun()
        }} />
        <Button title='man start' onPress={() => {
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
        <Button title='clear' onPress={() => AsyncStorage.clear()} />
        <Button title='printdb' onPress={printDb} />
        <Button title='runid' onPress={() => console.log(runId, 'runid')} />
      </View>
    </>
  );

}


