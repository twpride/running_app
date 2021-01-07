import React, { useContext, useEffect, useState } from 'react';
import { Button, Text, View, TouchableHighlight } from 'react-native';


import AsyncStorage from '@react-native-async-storage/async-storage';

import Svg, {
  Line, Rect, G
} from 'react-native-svg';




const MS_IN_DAY = 24 * 60 * 60 * 1000;
const TODAY = new Date();
const START_DATE_MS = TODAY.setHours(0, 0, 0, 0) - (TODAY.getDay() + 51 * 7) * MS_IN_DAY

const WEEKS = 52;

const COLORS = ['lightgrey', 'green']
const SIZE = 6;
const PITCH = 7.3;

var initBuckets = new Array(WEEKS);
for (var i = 0; i < initBuckets.length; i++) {
  initBuckets[i] = Array(7).fill(0);
}


function getIndex(date_ms) {
  const idx = Math.floor((date_ms - START_DATE_MS) / MS_IN_DAY)
  return [Math.floor(idx / 7), idx % 7]
}




export default function History() {

  const { runD, setRunD } = useContext(RunDContext)
  const [buckets, setBuckets] = useState(null)

  useEffect(() => {
    setBuckets(
      Object.values(runD).reduce(
        (acc, ele) => {
          const [i, j] = getIndex(ele.startTime)
          acc[i][j] = 1
          return acc
        }, initBuckets
      )
    )
  }, [])

  return (
    <>
      <Svg height="600" width="380"
      // onStartShouldSetResponder={
      //   e => console.log(e.nativeEvent)
      // }
      >
        {buckets && buckets.map((eli, i) => (
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
        )
        )}
      </Svg>
      {
        runD && Object.keys(runD).map((key, idx) => (
          <Text key={idx}>{runD[key].distance} {runD[key].time} </Text>
        )
        )
      }
    </>
  );
}



