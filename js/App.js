import React, { useReducer, useState } from 'react';
import { Text, View } from 'react-native';

import Tracker from './Tracker'



const screenD = {
  TRACKER: Tracker,
}

// export const screen_act = Object.assign({},
//   ...Object.keys(screenD).map(
//     k => ({ [k]: k })
//   )
// );

// const screenReducer = (state = null, action) => {
//   Object.freeze(state);
//   let type;
//   if (action.type=="POP") {

//   } else if (type = screen_act[action.type]) {
    
//     return {...state, type}
//   } else {
//     return state
//   }
// };








export default function App() {
  const [screen, screenDispatch] = useState('TRACKER')
  return React.createElement(screenD[screen])
  // return <Tracker></Tracker>
}
