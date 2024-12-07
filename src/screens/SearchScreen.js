import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { TextInput, Button, Card, Title, Text, Provider as PaperProvider, List } from 'react-native-paper';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import WeatherCard from './WeatherCard';

const SearchScreen = () => {
  const [cityName, setCityName] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [weatherData, setWeatherData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleCityChange = async (text) => {
    setCityName(text);
    if (text.length > 2) {
      try {
        const response = await axios.get(`https://nominatim.openstreetmap.org/search`, {
          params: { q: text, format: 'json', addressdetails: 1, limit: 5 },
          headers: { 'User-Agent': 'WeatherGuruApp/1.0 (contact: your_email@example.com)' },
        });
        setSuggestions(response.data);
      } catch (err) {
        console.error(err);
      }
    } else {
      setSuggestions([]);
    }
  };

  const handleSearch = async () => {
    setLoading(true); // Démarre le spinner (indicateur de chargement)
    try {
      const geoResponse = await axios.get(`https://nominatim.openstreetmap.org/search`, {
        params: { q: cityName, format: 'json' },
        headers: { 'User-Agent': 'WeatherGuruApp/1.0 (contact: your_email@example.com)' },
      });

      if (geoResponse.data.length === 0) {
        setError('Ville non trouvée');
        setWeatherData(null);
        return;
      }

      const { lat, lon } = geoResponse.data[0];
      if (!lat || !lon) {
        setError("Coordonnées invalides obtenues");
        return;
      }

      const weatherResponse = await axios.get(`https://api.open-meteo.com/v1/forecast`, {
        params: {
          latitude: lat,
          longitude: lon,
          hourly: 'temperature_2m,relative_humidity_2m',
          daily: 'temperature_2m_max,temperature_2m_min,precipitation_sum',
          current_weather: true,
          timezone: 'Europe/Berlin',
        },
      });

      setWeatherData(weatherResponse.data);
      console.log("testtette")
      console.log(weatherResponse.data)
      setError(null);
      setSuggestions([]);
    } catch (err) {
      setError('Erreur lors de la récupération des données météorologiques');
      setWeatherData(null);
    } finally {
      setLoading(false);  
    }
  };

  const handleSuggestionPress = (suggestion) => {
    setCityName(suggestion.display_name);
    setSuggestions([]);
  };

  return (
    <PaperProvider>
      <ScrollView contentContainerStyle={styles.container}>
        {loading ? (
          <ActivityIndicator size="large" color="#6200ee" />
        ) : (
          <>
            <Title style={styles.text}>Page de recherche</Title>
            <TextInput
              mode="outlined"
              label="Rechercher une ville"
              value={cityName}
              onChangeText={handleCityChange}
              style={styles.input}
            />
            {suggestions.length > 0 && (
              <ScrollView style={styles.suggestionsContainer}>
                {suggestions.map((suggestion) => (
                  <List.Item
                    key={suggestion.place_id}
                    title={suggestion.display_name}
                    onPress={() => handleSuggestionPress(suggestion)}
                  />
                ))}
              </ScrollView>
            )}
            <Button mode="contained" onPress={handleSearch} style={styles.button}>
              Rechercher
            </Button>
            {error && <Text style={styles.error}>{error}</Text>}
            {weatherData && (
                              <WeatherCard
                                weatherData={weatherData}
                                cityName={cityName}
                              />
            )}
          </>
        )}
      </ScrollView>
    </PaperProvider>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  text: {
    fontSize: 24,
    marginBottom: 20,
  },
  input: {
    marginBottom: 20,
    width: '80%',
  },
  button: {
    marginTop: 10,
    width: '80%',
  },
  resultContainer: {
    marginTop: 20,
    width: '80%',
    padding: 16,
  },
  suggestionsContainer: {
    width: '80%',
    maxHeight: 200,
  },
  error: {
    color: 'red',
    marginTop: 20,
  },
});

export default SearchScreen;
