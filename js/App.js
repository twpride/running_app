import Geolocation from 'react-native-geolocation-service';
import React, { useEffect, useState } from 'react';

import { Text, View, PermissionsAndroid, ToastAndroid} from 'react-native';


const hl = async () => {


  const hasPermission = await PermissionsAndroid.check(
    PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
  );

  if (hasPermission) {
    return true;
  }
  
  const status = await PermissionsAndroid.request(
    PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
  );
  console.log(status)
  if (status === PermissionsAndroid.RESULTS.GRANTED) {
    return true;
  }

  if (status === PermissionsAndroid.RESULTS.DENIED) {
    ToastAndroid.show(
      'Location permission denied by user.',
      ToastAndroid.LONG,
    );
  } else if (status === PermissionsAndroid.RESULTS.NEVER_ASK_AGAIN) {
    ToastAndroid.show(
      'Location permission revoked by user.',
      ToastAndroid.LONG,
    );
  }

  return false;
};



const YourApp = () => {

const watch = async () => {
  const hasLocationPermission = await hl();

  if (!hasLocationPermission) {
    return;
  }
  Geolocation.watchPosition(
    (position) => {
      // console.log(position);
      setLoc(state=>[...state,position])
    },
    (error) => {
      console.log(error);
    },
    {
      accuracy: {
        android: 'balanced',
        ios: 'hundredMeters',
      },
      enableHighAccuracy: true,
      distanceFilter: 0,
      interval: 5000,
      fastestInterval: 2000,
      forceRequestLocation: true,
      showLocationDialog: true,
    },
  );
};







  const [loc, setLoc] = useState([])
return (
  <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
    <Text onPress={watch}>
      Try editing me! asdf
      </Text>

    {loc && loc.slice(loc.length-5,loc.length).map(el => (
      <View style={{flexDirection:'row', justifyContent:'space-between'}}>
      <Text style={{flex:1}}>{el.coords.accuracy.toFixed(1)}</Text>
      <Text style={{flex:1}}>{el.coords.longitude}</Text>
      <Text style={{flex:1}}>{el.coords.latitude}</Text>
      </View>
    ))}
  </View>
);
}

export default YourApp;