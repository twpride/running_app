import React, { useReducer, useState } from 'react';
import { ImagePropTypes, Text, View } from 'react-native';

import Tracker from './Tracker'



const screenD = {
  TRACKER: Tracker,
}

export const screen_act = Object.assign({},
  ...Object.keys(screenD).map(
    k => ({ [k]: k })
  )
);

const screenReducer = (state = null, action) => {
  Object.freeze(state);
  let type;
  if (action.type=="POP") {

  } else if (type = screen_act[action.type]) {
    
    return {...state, type}
  } else {
    return state
  }
};


const Test = (props) => {
  
  return <View>
    <Text>Hello</Text>
    {props.children}
  </View>
}





export default function App() {
  const [screen, screenDispatch] = useState('TRACKER')
  // return React.createElement(screenD[screen])
  // return <Tracker></Tracker>
  return <Test wtf='wtf'>
    <Text>I am a child</Text>
    <Text>so am i</Text>
  </Test>
}



const MyContext = React.createContext(initialState)

const Tab = ({components}) => {
  const [tab, setTab] = useState(myReducer, initialState)
   
  return (
    <MyContext.Provider value={value}>
      {children}
    </MyContext.Provider>
  )
}

const useSelector = (selector) => {
  const store = useContext(MyContext)
  return selector(store.getState())
}