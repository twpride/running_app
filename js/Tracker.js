import Geolocation from 'react-native-geolocation-service';
import RNSimpleCompass from '@kevinsperrine/react-native-simple-compass';
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
  TouchableHighlight
} from 'react-native';

import { XIcon } from './Svgs'

import { coord } from './util/testroute'
import prettyFormat from 'pretty-format'
import { convertSecsToMins, distance } from './util/dataProc';
import BackgroundTimer from 'react-native-background-timer';



export default function Tracker({ setRunD, runD, close }) {
  const [watchId, setWatchId] = useState(null)
  const [runTime, setRunTime] = useState(0)
  const [ori, setOri] = useState(0)

  useEffect(() => {

    RNSimpleCompass.start(22.5, (res)=>setOri(res.degree)); // first arg is deg throttling thresh
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


  const [tr, trDispatch] = useReducer(trReducer, {})

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
        BackgroundTimer.setInterval(function () {
          setRunTime(state => state + 1)
        }, 1000),
        Geolocation.watchPosition(
          (wpt) => {
            console.log(wpt)
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
      BackgroundTimer.clearInterval(watchId[0])
      Geolocation.clearWatch(watchId[1]);
      setWatchId(null)
      // api.addRun(tr.waypoints)
      addRun()
    }
  };

  const addRun = async () => {
    // data is Object rather than Array because 
    // async storage does not have built in array push method, only obj merge
    const data = {
      [Object.keys(runD).length]: {
        waypoints: tr.waypoints,
        distance: tr.distance,
        time: runTime,
        // startTime: tr.waypoints[0][6]
        startTime: new Date('January 1, 2021').getTime()
      }
    }
    try {
      setRunD(state => ({ ...state, ...data }))
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
    <View style={{ position: 'absolute', width: '100%', height: '100%' }}>
      <View style={{ height: '80%', width: '100%' }} >
        <Map center={tr.cur && tr.cur.slice(4, 6)} shape={tr.shape} ori={ori+25} />
      </View>
      <View style={{ width: '100%', flexDirection: 'column', justifyContent: 'space-around' }}>
        <Text>{convertSecsToMins(runTime)}</Text>
        <Text>{tr.distance}</Text>
      </View>
      <View style={{ width: '100%', flexDirection: 'row', justifyContent: 'space-around' }}>
        <Button title='start' onPress={watch} />
        <Button title='stop' onPress={stopWatch} />
        <Button title='center' onPress={center} />
      </View>
      <View style={{ width: '100%', flexDirection: 'row', justifyContent: 'space-around' }}>
        {/* <Button title='update' onPress={update} /> */}
        {/* <Button title='man stop' onPress={() => {
          console.log(tr.distance, 'dist')
          // api.addRun(tr.waypoints)
          addRun()
        }} /> */}
        {/* <Button title='man start' onPress={() => {
          trDispatch({
            type: tr_act.RX_POS, wpt: {
              coords: {
                speed: 0, heading: 0, altitude: 0, accuracy: 0,
                longitude: coord[0][0], latitude: coord[0][1]
              }
            }
          })
          trDispatch({ type: tr_act.START_RUN })
        }} /> */}
        <Button title='clear' onPress={() => AsyncStorage.clear()} />
        <Button title='testori' onPress={()=> console.log(ori)} />
      </View>
      <TouchableHighlight style={{ position: "absolute", top: 50, left: 50 }}
        onPress={close}
      >
        <XIcon {...{ scale: 1, size: "32px" }} />
      </TouchableHighlight>
    </View>
  );

}



const legend = {
  speed: 0,
  heading: 1,
  altitude: 2,
  accuracy: 3,
  longitude: 4,
  latitude: 5,
  timestamp: 6
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



async function printDb() {
  try {
    const res = await AsyncStorage.getItem('runD')
    // console.log(JSON.stringify(JSON.parse(res),null,2))
    console.log(prettyFormat(JSON.parse(res), { maxDepth: 2 }))
    // console.dir(JSON.parse(res),{depth:1})
  } catch (e) {
    console.log(e)
  }
}