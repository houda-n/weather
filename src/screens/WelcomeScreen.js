import React from 'react';
import { View, Text, Button } from 'react-native';

const WelcomeScreen = ({ navigation }) => {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text>Welcome to WeatherGuru!</Text>
      <Button
        title="Go to Search"
        onPress={() => navigation.navigate('Search')}
      />
    </View>
  );
};

export default WelcomeScreen;
