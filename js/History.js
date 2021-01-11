import React, { useContext, useEffect, useReducer, useState } from 'react';
import { Button, Text, View, TouchableHighlight } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

import Map from './Map'
import Svg, {
  Line, Rect, G
} from 'react-native-svg';
import { convertSecsToMins, distance } from './util/dataProc';

const MS_IN_DAY = 24 * 60 * 60 * 1000;
const TODAY = new Date();
const START_DATE_MS = TODAY.setHours(0, 0, 0, 0) - (TODAY.getDay() + 51 * 7) * MS_IN_DAY

const WEEKS = 52;
const COLORS = ['lightgrey', 'green']
const SIZE = 6;
const PITCH = 7.3;
import { coord } from './util/testroute'

var initBuckets = new Array(WEEKS);
for (var i = 0; i < initBuckets.length; i++) {
  initBuckets[i] = Array(7).fill(0);
}


function getIndex(date_ms) {
  const idx = Math.floor((date_ms - START_DATE_MS) / MS_IN_DAY)
  return [Math.floor(idx / 7), idx % 7]
}


export default function History({ runD, setRunD, usingMiles }) {

  const [buckets, setBuckets] = useState(null)
  const [runView, setRunView] = useState(null)

  useEffect(() => {
    AsyncStorage.getItem('runD').then(str => {
      const obj = JSON.parse(str) || {};
      setRunD(obj);
    })
  }, [])

  useEffect(() => {
    if (!runD) return;
    setBuckets(Object.values(runD).reduce(
      (acc, ele) => {
        const [i, j] = getIndex(ele.startTime)
        acc[i][j] = 1
        return acc
      },
      initBuckets)
    );
  }, [runD])

  return (
    <>
      <Svg height="100" width="380"
        onStartShouldSetResponder={e => console.log(e.nativeEvent)}
      >
        {
          buckets && buckets.map((eli, i) => (
            eli.map((elj, j) => (
              <Rect
                key={i.toString() + j.toString()}
                x={i * PITCH}
                y={j * PITCH}
                height={SIZE}
                width={SIZE}
                fill={COLORS[buckets[i][j]]}
              />
            ))
          ))
        }
      </Svg>
      <View style={{ height: '40%', width: '100%' }} >
        <Map center={runView && runView[0]} shape={runView} ori={90} />
      </View>
      {
        runD && Object.keys(runD).map((key, idx) => (
          <View key={key}
            style={{ width: '80%', display: 'flex', flexDirection: 'row', justifyContent: 'space-between' }}>
            <Text
              onPress={
                () => {
                  const filteredRun = runD[key].waypoints.filter((el) => el).map(
                    ele => ele.slice(4, 6)
                  )
                  console.log(
                    filteredRun.reduce(
                      (acc, ele, idx, coord) => {
                        if (idx == 0) return 0;
                        return acc + distance(...coord[idx], ...coord[idx - 1])
                      }, 0
                    ) / 1.609344, 'dist'
                  )
                  setRunView(filteredRun)
                }
              }
            >{(runD[key].distance / (usingMiles ? 1.609344 : 1)).toFixed(2)} </Text>
            <Text> {convertSecsToMins(runD[key].time)} </Text>
            <Text>
              {
                convertSecsToMins(
                  runD[key].time / (
                    runD[key].distance / (usingMiles ? 1.609344 : 1)
                  )
                )
              }
            </Text>
          </View>
        ))
      }
      <Button title='testroute' onPress={
        () => {
          setRunView(coord)
        }
      } />
    </>
  );
}



