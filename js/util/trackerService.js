import { tr_act } from '../Tracker'
import Geolocation from 'react-native-geolocation-service';


module.exports = async (trDispatch, setWatchId, setRunTime) => {
  trDispatch({ type: tr_act.START_RUN })

  setWatchId(
    [
      setInterval(function () {
        setRunTime(state => state + 1)
      }, 1000),
      Geolocation.watchPosition(
        (wpt) => {
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