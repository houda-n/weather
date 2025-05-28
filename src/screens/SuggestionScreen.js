import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import Geolocation from 'react-native-geolocation-service';
import { Button } from 'react-native-paper';
import axios from 'axios';

const SuggestionScreen = () => {
  const [suggestion, setSuggestion] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchSuggestion = async (latitude, longitude) => {
    setLoading(true);
    try {
      // Récupérer les données météo pour la localisation actuelle
      const weatherResponse = await axios.get('https://api.open-meteo.com/v1/forecast', {
        params: {
          latitude,
          longitude,
          current_weather: true,
          timezone: 'auto',
        },
      });

      const weatherData = weatherResponse.data;
      const temperature = weatherData.current_weather?.temperature || 20;
      const condition = weatherData.current_weather?.weather_code || 'clear';

      // Appeler l'API backend pour obtenir la suggestion
      const response = await axios.post('http://10.0.2.2:3001/suggestions', {
        latitude,
        longitude,
        temperature,
        condition,
        userPreferences: 'casual',
      });

      setSuggestion(response.data.suggestion);
      setError('');
    } catch (err) {
      console.error('Erreur lors de la récupération des suggestions :', err);
      setError('Impossible de récupérer une suggestion pour le moment.');
    } finally {
      setLoading(false);
    }
  };

  const getCurrentLocation = () => {
    setLoading(true);
    Geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        fetchSuggestion(latitude, longitude);
      },
      (error) => {
        console.error('Erreur de localisation :', error);
        setError('Impossible de récupérer la localisation.');
        setLoading(false);
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
    );
  };

  useEffect(() => {
    getCurrentLocation();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Suggestions basées sur votre localisation</Text>
      {loading ? (
        <ActivityIndicator size="large" color="#6200ee" />
      ) : error ? (
        <Text style={styles.error}>{error}</Text>
      ) : (
        <Text style={styles.suggestion}>{suggestion}</Text>
      )}
      <Button mode="contained" onPress={getCurrentLocation} style={styles.button}>
        Recharger les suggestions
      </Button>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  suggestion: {
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 20,
  },
  error: {
    color: 'red',
    fontSize: 16,
    marginBottom: 20,
  },
  button: {
    marginTop: 20,
    width: '80%',
  },
});

export default SuggestionScreen;