import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  PermissionsAndroid,
  Platform,
  Alert,
  ActivityIndicator,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Geolocation from 'react-native-geolocation-service';
import { Button, Text, PaperProvider } from 'react-native-paper';
import axios from 'axios';
import WeatherCard from './WeatherCard';
import WeatherChart from './WeatherChart';

const WelcomeScreen = ({ navigation }) => {
  const [location, setLocation] = useState(null);
  const [weatherData, setWeatherData] = useState(null);
  const [error, setError] = useState(null);
  const [cityName, setCityName] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogout = async () => {
      try {
        await AsyncStorage.removeItem('token'); // Suppression du token
        navigation.replace('Login'); // Redirection vers l'écran de connexion
      } catch (err) {
        Alert.alert('Erreur', "Une erreur s'est produite lors de la déconnexion.");
        console.error('Erreur de déconnexion:', err);
      }
  };

  useEffect(() => {
    const fetchTokenAndRequestLocation = async () => {
      try {
        // Récupérer le token depuis AsyncStorage
        const token = await AsyncStorage.getItem('token');
        if (!token) {
          Alert.alert('Session expirée', 'Veuillez vous reconnecter.');
          navigation.navigate('Login'); // Rediriger vers la page de connexion
          return;
        }

        // Ajouter le token aux requêtes par défaut
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

        // Demander la permission de localisation
        if (Platform.OS === 'android') {
          const granted = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
            {
              title: 'Permission de localisation',
              message: "L'application a besoin d'accéder à votre localisation",
              buttonNeutral: 'Demander plus tard',
              buttonNegative: 'Annuler',
              buttonPositive: 'OK',
            }
          );
          if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
            setError('Permission de localisation refusée');
            return;
          }
        }
        getCurrentLocation();
      } catch (err) {
        console.error('Erreur lors de la récupération du token:', err);
        setError('Erreur de session. Veuillez vous reconnecter.');
        navigation.navigate('Login');
      }
    };

    fetchTokenAndRequestLocation();
  }, []);

  const getCurrentLocation = () => {
    setLoading(true);
    Geolocation.getCurrentPosition(
      (position) => {
        console.log('Position obtenue :', position.coords);
        setLocation(position.coords);
        fetchWeather(position.coords.latitude, position.coords.longitude);
      },
      (error) => {
        console.error('Erreur de localisation :', error.message);
        setError(error.message);
      },
      { enableHighAccuracy: true, timeout: 30000, maximumAge: 10000 }
    );
  };

  const fetchWeather = async (latitude, longitude) => {
    try {
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
      setWeatherData(response.data);
      fetchCityName(latitude, longitude);
    } catch (err) {
      console.error('Erreur lors de la récupération des données météo:', err);
      setError('Erreur lors de la récupération des données météorologiques');
    } finally {
      setLoading(false);
    }
  };

  const fetchCityName = async (latitude, longitude) => {
    try {
      const response = await axios.get('https://nominatim.openstreetmap.org/reverse', {
        params: { lat: latitude, lon: longitude, format: 'json' },
        headers: { 'User-Agent': 'WeatherGuruApp/1.0 (contact: example@weatherguru.com)' },
      });
      setCityName(response.data.address.city || response.data.address.town || response.data.address.village);
    } catch (err) {
      console.error('Erreur lors de la récupération du nom de la ville:', err);
      setError('Erreur lors de la récupération du nom de la ville');
    }
  };

  return (
    <PaperProvider>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.logoutContainer}>
           <Button mode="text" onPress={handleLogout} labelStyle={{ color: '#d9534f' }}>
              Déconnexion
           </Button>
        </View>
        <View style={styles.container}>
          <Text style={styles.welcomeText}>Bienvenue sur WeatherGuru!</Text>
          {loading ? (
            <ActivityIndicator size="large" color="#6200ee" />
          ) : (
            weatherData && (
              <>
                <WeatherCard weatherData={weatherData} cityName={cityName} />
                <WeatherChart weatherData={weatherData} />
              </>
            )
          )}

          {error && <Text style={styles.error}>{error}</Text>}
          <Button mode="contained" onPress={() => navigation.navigate('Search')} style={styles.button}>
            Rechercher des villes
          </Button>
          <Button mode="outlined" onPress={() => navigation.navigate('Favorites')} style={styles.button}>
            Voir les favoris
          </Button>
        </View>
      </ScrollView>
    </PaperProvider>
  );
};

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
    alignItems: 'center',
  },
  logoutContainer: {
      width: '100%',
      alignItems: 'flex-end',
      backgroundColor: '#fff',
      marginBottom: 5,
  },
  welcomeText: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  button: {
    marginTop: 10,
    width: '80%',
  },
  error: {
    color: 'red',
    marginTop: 10,
  },
});

export default WelcomeScreen;
