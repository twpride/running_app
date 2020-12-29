import React, { useEffect, useState } from 'react';

import styled from 'styled-components'

const AppDiv = styled.div`
  display:flex;
`;




const target = {
  latitude: 0,
  longitude: 0
};

const options = {
  enableHighAccuracy: true,
  timeout: 5000,
  maximumAge: 0
};

function error(err) {
  console.warn('ERROR(' + err.code + '): ' + err.message);
}

const App = () => {

  const [location, setLocation] = useState(null)
  window.loc = location;
  function success(loc) {
    setLocation(loc)
    console.log(loc)
  }

  useEffect(() => {
    navigator.geolocation.watchPosition(success, error, options);
  }, [])


  return (
    <AppDiv>
      {location && location.coords &&
        <>
          <div>{location.coords.longitude}</div>
          <div>{location.coords.latitude}</div>
        </>
      }
    </AppDiv>
  )
};

export default App;