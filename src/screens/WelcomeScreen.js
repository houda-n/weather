import React, { useState, useEffect } from 'react';
import { View, StyleSheet, PermissionsAndroid, Platform, Alert } from 'react-native';
import Geolocation from 'react-native-geolocation-service';
import { Button, Text, Card, Title, Provider as PaperProvider } from 'react-native-paper';
import axios from 'axios'; //bib requêtes HTTP

const WelcomeScreen = ({ navigation }) => {
  const [location, setLocation] = useState(null);
  const [weatherData, setWeatherData] = useState(null);
  const [error, setError] = useState(null);
  const [cityName, setCityName] = useState('');

  //demande de permission
  useEffect(() => {
    const requestLocationPermission = async () => {
      if (Platform.OS === 'android') {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          {
            title: 'Permission de localisation',
            message: 'L\'application a besoin d\'accéder à votre localisation',
            buttonNeutral: 'Demander plus tard',
            buttonNegative: 'Annuler',
            buttonPositive: 'OK',
          }
        );
        if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
          setError('Permission de localisation refusée');
        } else {
          getCurrentLocation();
        }
      } else {
        getCurrentLocation();
      }
    };

    requestLocationPermission();
  }, []);


  //obtenir la localisation actuelle de l'utilisateur
  const getCurrentLocation = () => {
    Geolocation.getCurrentPosition(
      (position) => {
        console.log("Position obtenue:", position.coords);
        Alert.alert("Position obtenue", `Lat: ${position.coords.latitude}, Lon: ${position.coords.longitude}`);
        setLocation(position.coords);  //mise à jour
        fetchWeather(position.coords.latitude, position.coords.longitude);
      },
      (error) => {
        console.error("Erreur lors de l'obtention de la position:", error.message);
        setError(error.message);
      },
      { enableHighAccuracy: true, timeout: 30000, maximumAge: 10000 }
    );
  };


  //recuperer les données météo en fonction des coordonnées
  const fetchWeather = async (latitude, longitude) => {  //envoyer une requête à l'API open-meteo pour obtenir les données meteoro
    try {
      console.log("Récupération des données météo pour:", latitude, longitude);
      const response = await axios.get('https://api.open-meteo.com/v1/forecast', {
        params: {
          latitude,
          longitude,
          hourly: 'temperature_2m,relative_humidity_2m',
          daily: 'temperature_2m_max,temperature_2m_min,precipitation_sum',
          current_weather: true,
          timezone: 'Europe/Berlin',
        },
      });
      console.log("Données météo obtenues:", response.data);
      setWeatherData(response.data);  //mise à jour
      fetchCityName(latitude, longitude);
    } catch (err) {
      console.error("Erreur lors de la récupération des données météorologiques:", err);
      setError('Erreur lors de la récupération des données météorologiques');
    }
  };


  //recuperer le nom de la ville en fonction des coordonnées
  const fetchCityName = async (latitude, longitude) => {
    try {
      const response = await axios.get('https://nominatim.openstreetmap.org/reverse', {
        params: {
          lat: latitude,
          lon: longitude,
          format: 'json',
        },
        headers: {
          'User-Agent': 'WeatherGuruApp/1.0 (contact: elbaznourelhouda0@gmail.com)',
        },
      });
      console.log("Nom de la ville obtenu:", response.data.address);
      setCityName(response.data.address.city || response.data.address.town || response.data.address.village);
    } catch (err) {
      console.error("Erreur lors de la récupération du nom de la ville:", err);
      setError('Erreur lors de la récupération du nom de la ville');
    }
  };

  return (
    <PaperProvider>
      <View style={styles.container}>
        {weatherData && (
          <Card style={styles.resultContainer}>
            <Card.Content>
              <Title>Météo actuelle pour {cityName} :</Title>
              <Text>Température : {weatherData.current_weather.temperature}°C / {(weatherData.current_weather.temperature * 9/5 + 32).toFixed(2)}°F</Text>
              <Text>Min : {weatherData.daily.temperature_2m_min[0]}°C / {(weatherData.daily.temperature_2m_min[0] * 9/5 + 32).toFixed(2)}°F</Text>
              <Text>Max : {weatherData.daily.temperature_2m_max[0]}°C / {(weatherData.daily.temperature_2m_max[0] * 9/5 + 32).toFixed(2)}°F</Text>
              <Text>Humidité relative : {weatherData.hourly.relative_humidity_2m[0]}%</Text>
            </Card.Content>
          </Card>
        )}
        {error && <Text style={styles.error}>{error}</Text>}
        <Text style={styles.text} variant="headlineLarge">Welcome to WeatherGuru!</Text>
        <Button mode="contained" onPress={() => navigation.navigate('Search')} style={styles.button}>
          Go to Search
        </Button>
        <Button mode="contained" onPress={() => navigation.navigate('Favorites')} style={styles.button}>
          Go to Favorites
        </Button>
      </View>
    </PaperProvider>
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
  resultContainer: {
    marginBottom: 20,
    width: '80%',
    padding: 16,
  },
  error: {
    color: 'red',
    marginTop: 20,
  },
});

export default WelcomeScreen;
