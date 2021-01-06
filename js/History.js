import React, { useEffect, useState } from 'react';
import { Button, Text, View, TouchableHighlight } from 'react-native';



import AsyncStorage from '@react-native-async-storage/async-storage';

import Svg, {
  Line, Rect, G
} from 'react-native-svg';

const MS_IN_DAY = 24 * 60 * 60 * 1000;
const TODAY = new Date();
const START_DATE_MS = TODAY.setHours(0, 0, 0, 0) - (TODAY.getDay() + 51 * 7) * MS_IN_DAY

import { Dimensions } from 'react-native';
const windowWidth = Dimensions.get('window').width;
console.log(windowWidth, "ww")

var x = new Array(52);

for (var i = 0; i < x.length; i++) {
  x[i] = Array(7).fill('lightgrey');
}

function getIndex(date_ms) {
  const idx = Math.floor((date_ms - START_DATE_MS) / MS_IN_DAY)
  return [Math.floor(idx / 7), idx % 7]
}

async function wrapper() {
  // const resp = await AsyncStorage.getItem('runD');
  return 1;
}

const History = ({ }) => {
  const [runD, setRunD] = useState()

  // const [sc, setSc] = useState([null,null])
  const [sc, setSc] = useState(x)

  useEffect(() => {

    (async () => {
      console.log('before await');
      const resp = await AsyncStorage.getItem('runD');
      // const resp = await wrapper()
      console.log('after');
      
      const obj = JSON.parse(resp);
      console.log(obj);
      setRunD(obj)
    })();



  }, [])
  const ll = 6;
  const pitch = 7.3;
  return (
    <>
      <Text>somehting</Text>
      <Svg height="600" width="380"
      // onStartShouldSetResponder={
      //   e => console.log(e.nativeEvent)
      // }
      >
        {[...Array(52)].map((eli, i) => (
          [...Array(7)].map((elj, j) => (
            <Rect
              key={i.toString() + j.toString()}
              x={i * pitch}
              y={j * pitch}

              height={ll}
              width={ll}

              fill={i == 51 ? 'green' : sc[i][j]}
            />
          ))
        )
        )}
      </Svg>

      {runD && Object.keys(runD).map((key, idx) => (
        <Text key={idx}>{runD[key].distance} {runD[key].time} </Text>
      )
      )}
    </>
  );
}




export default History;