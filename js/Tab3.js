import React, { useEffect } from 'react';
import { Text, View } from 'react-native';

async function wrapper() {
  return 1;
}

const Tab3 = () => {
  useEffect(() => {
    (async () => {
      const resp = await wrapper()
      console.log(resp)
    })()

  }, [])
  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <Text>
        Try editing me! 🎉
      </Text>
    </View>
  );
}

export default Tab3;