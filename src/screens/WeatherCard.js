import React from 'react';
import { View, StyleSheet, Image, alert } from 'react-native';
import { Card, Button, Title, Text } from 'react-native-paper';

const weatherIcons = {
  clear: require('../assets/icons/clear.png'),
  cloudy: require('../assets/icons/cloudy.png'),
  fog: require('../assets/icons/fog.png'),
  drizzle: require('../assets/icons/drizzle.png'),
  rain: require('../assets/icons/rain.png'),
  snow: require('../assets/icons/snow.png'),
  storm: require('../assets/icons/storm.png'),
  hail: require('../assets/icons/hail.png'),
  thunderstorm: require('../assets/icons/thunderstorm.png'),
  light_rain: require('../assets/icons/light-rain.png'),
  heavy_rain: require('../assets/icons/storm.png'),
  showers: require('../assets/icons/storm.png'),
};

const weatherIconMapping = {
  0: weatherIcons.clear,         // Ciel clair / ensoleillé
  1: weatherIcons.clear,         // Principalement clair
  2: weatherIcons.cloudy,        // Partiellement nuageux
  3: weatherIcons.cloudy,        // Couvert / nuageux
  45: weatherIcons.fog,          // Brouillard
  48: weatherIcons.fog,          // Givre
  51: weatherIcons.drizzle,      // Bruine légère
  53: weatherIcons.drizzle,      // Bruine modérée
  55: weatherIcons.drizzle,      // Bruine dense
  56: weatherIcons.drizzle,      // Dépôt de bruine givrée légère
  57: weatherIcons.drizzle,      // Dépôt de bruine givrée dense
  61: weatherIcons.light_rain,   // Pluie légère
  63: weatherIcons.rain,         // Pluie modérée
  65: weatherIcons.heavy_rain,   // Pluie forte
  66: weatherIcons.light_rain,   // Pluie verglaçante légère
  67: weatherIcons.heavy_rain,   // Pluie verglaçante forte
  71: weatherIcons.snow,         // Neige légère
  73: weatherIcons.snow,         // Neige modérée
  75: weatherIcons.snow,         // Neige dense
  77: weatherIcons.snow,         // Grains de neige
  80: weatherIcons.showers,      // Averses de pluie légères
  81: weatherIcons.showers,      // Averses de pluie modérées
  82: weatherIcons.showers,      // Averses de pluie violentes
  85: weatherIcons.snow,         // Averses de neige légères
  86: weatherIcons.snow,         // Averses de neige fortes
  95: weatherIcons.thunderstorm, // Orages légers ou modérés
  96: weatherIcons.storm,        // Orages avec légère grêle
  99: weatherIcons.storm,        // Orages avec forte grêle
};

const WeatherCard = ({ weatherData, cityName }) => {
  const getWeatherIcon = (weatherCode) => {
    console.log("hello")
    console.log(weatherCode)
    return weatherIconMapping[weatherCode] || weatherIcons.cloudy;
  };
  const addToFavorites = async () => {
      try {
        if (city === '') {
          Alert.alert('Erreur', 'Veuillez entrer une ville');
          return;
        }

        let favorites = await AsyncStorage.getItem('favorites');
        favorites = favorites ? JSON.parse(favorites) : [];

        if (favorites.includes(city)) {
          Alert.alert('Erreur', 'Cette ville est déjà dans les favoris');
          return;
        }

        favorites.push(city);
        await AsyncStorage.setItem('favorites', JSON.stringify(favorites));
        Alert.alert('Succès', 'Ville ajoutée aux favoris');
      } catch (err) {
        Alert.alert('Erreur', 'Impossible d\'ajouter la ville aux favoris');
      }
  };
  return (
    <Card style={styles.resultContainer}>
      <Card.Content>
        <Title>Météo actuelle pour {cityName} :</Title>
        <Image source={getWeatherIcon(weatherData.current_weather.weathercode)} style={styles.weatherIcon} />
        <Text>Température actuelle : {weatherData.current_weather.temperature}°C</Text>
        <Text>Max : {weatherData.daily.temperature_2m_max[0]}°C / Min : {weatherData.daily.temperature_2m_min[0]}°C</Text>
        <Button mode="contained" onPress={() => navigation.navigate('Search')} style={styles.button}>
                  Rechercher des villes
        </Button>
        <Button mode="contained" onPress={addToFavorites} style={styles.button}>
                            Ajouter aux favoris
        </Button>
      </Card.Content>
    </Card>
  );
};

const styles = StyleSheet.create({
  resultContainer: {
    width: '80%',
    padding: 16,
    marginBottom: 20,
  },
  weatherIcon: {
    width: 40,
    height: 40,
    marginBottom: 5,
  },
  button: {
      marginVertical: 5,
      width: '100%',
  },
});

export default WeatherCard;
