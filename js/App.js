import React, { useReducer, useState } from 'react';
import { Button, ImagePropTypes, Text, View } from 'react-native';

import Tracker from './Tracker'



const TabD = {
  TRACKER: {
    id: 'TRACKER',
    comp: Tracker,
    icon: null,
    iconName: 'Record',
    title: null
  },
  TAB2: {
    id: 'TAB2',
    comp: () => <View><Text>Tab2</Text></View>,
    icon: null,
    iconName: 'Tab 2',
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
  const [tabKey, setTabKey] = useState('TRACKER');

  const Tab = TabD[tabKey].comp;
  return (
    <View style={{ flex: 1 }}>
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
