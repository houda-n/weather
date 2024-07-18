import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Button, Text } from 'react-native-paper';

const WelcomeScreen = ({ navigation }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.text} variant="headlineLarge">Welcome to WeatherGuru!</Text>
      <Button mode="contained" onPress={() => navigation.navigate('Search')} style={styles.button}>
        Go to Search
      </Button>
      <Button mode="contained" onPress={() => navigation.navigate('Favorites')} style={styles.button}>
        Go to Favorites
      </Button>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#f5f5f5',
  },
  text: {
    fontSize: 24,
    marginBottom: 20,
    textAlign: 'center',
  },
  button: {
    marginVertical: 10,
    width: '80%',
  },
});

export default WelcomeScreen;
