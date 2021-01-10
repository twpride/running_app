import React, { useState } from 'react';
import { View, TouchableOpacity } from 'react-native';

import Tracker from './Tracker'
import History from './History'
import Tab3 from './Tab3'



const TabD = {
  TRACKER: {
    id: 'TRACKER',
    comp: Tracker,
    icon: null,
    iconName: 'Record',
    title: null
  },
  HISTORY: {
    id: 'HISTORY',
    comp: History,
    icon: null,
    iconName: 'History',
    title: null
  },
  TAB3: {
    id: 'TAB3',
    comp: Tab3,
    icon: null,
    iconName: 'Tab 3',
    title: null
  },
}



export default function App() {

  const [tabKey, setTabKey] = useState('HISTORY');
  const [modalKey, setModalKey] = useState(null);
  const [runD, setRunD] = useState()
  const [usingMiles, setUsingMiles] = useState(true)
  const Tab = TabD[tabKey].comp;

  return (
    <View style={{ flex: 1, alignItems: 'center', position: 'relative' }}>
      <Tab {...{ runD, setRunD,usingMiles }}></Tab>

      {
        {
          TRACKER: <Tracker close={() => setModalKey(null)} {...{ runD, setRunD, usingMiles }}/>
        }[modalKey]
      }

      <TouchableOpacity
        activeOpacity={.8} //The opacity of the button when it is pressed
        style={{
          width: 56, height: 56, borderRadius: 56, backgroundColor: 'orange',
          position: 'absolute', zIndex: 5
        }}
        onPress={() => setModalKey('TRACKER')}
      ></TouchableOpacity>

      {/* <View style={{ width: '100%', flexDirection: 'row', justifyContent: 'space-around' }}>
        {Object.keys(TabD).map((tk, idx) => (
          <Button title={TabD[tk].iconName} key={idx}
            onPress={() => setTabKey(TabD[tk].id)}
          />
        ))}
        <Button title='test' 
          onPress={() => console.log(runD)}
        />
      </View> */}
    </View >
  )
}
