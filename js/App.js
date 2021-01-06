import React, { useReducer, useState } from 'react';
import { Button, ImagePropTypes, Text, View } from 'react-native';

import Tracker from './Tracker'
import History from './History'



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
    comp: () => <View><Text>Tab3</Text></View>,
    icon: null,
    iconName: 'Tab 3',
    title: null
  },
}



export default function App() {

  
  const [tabKey, setTabKey] = useState('HISTORY');

  const Tab = TabD[tabKey].comp;
  return (
    <View style={{ flex: 1, alignItems:'center'}}>
      <Tab />
      <View style={{ width: '100%', flexDirection: 'row', justifyContent: 'space-around' }}>
        {Object.keys(TabD).map((tk, idx) => (
          <Button title={TabD[tk].iconName} key={idx}
            onPress={() => setTabKey(TabD[tk].id)}
          />
        ))}
      </View>
    </View>
  )
}
