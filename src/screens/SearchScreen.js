import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { TextInput, Button, Card, Title, Text, Provider as PaperProvider, List } from 'react-native-paper';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';


const SearchScreen = ({ navigation }) => {
  const [city, setCity] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [weatherData, setWeatherData] = useState(null);
  const [error, setError] = useState(null);

  const handleCityChange = async (text) => {
    setCity(text);
    if (text.length > 2) {
      try {
        const response = await axios.get(`https://nominatim.openstreetmap.org/search`, {
          params: {
            q: text,
            format: 'json',
            addressdetails: 1,
            limit: 5,
          },
          headers: {
            'User-Agent': 'WeatherGuruApp/1.0 (contact: elbaznourelhouda0@gmail.com)',
          },
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
    try {
      // Requête à l'API Nominatim pour obtenir les coordonnées de la ville
      const geoResponse = await axios.get(`https://nominatim.openstreetmap.org/search`, {
        params: {
          q: city,
          format: 'json',
        },
        headers: {
          'User-Agent': 'WeatherGuruApp/1.0 (contact: your_email@example.com)',
        },
      });

      if (geoResponse.data.length === 0) {
        setError('Ville non trouvée');
        setWeatherData(null);
        return;
      }

      const { lat, lon } = geoResponse.data[0];

      console.log("Coordonnées obtenues:", { lat, lon }); // Ajoutez ce log pour vérifier les coordonnées

      // Vérifier les valeurs lat et lon avant de procéder à l'appel de l'API Open-Meteo
      if (!lat || !lon) {
        setError("Coordonnées invalides obtenues");
        return;
      }

      // Requête à l'API Open-Meteo pour obtenir les données météo basées sur les coordonnées
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

      const weather = weatherResponse.data;
      console.log("Données météo obtenues:", weather); // Ajoutez ce log pour vérifier la réponse de l'API

      setWeatherData(weather);
      setError(null);
      setSuggestions([]);
    } catch (err) {
      console.error("Erreur lors de la récupération des données météorologiques:", err);
      setError('Erreur lors de la récupération des données météorologiques');
      setWeatherData(null);
    }
  };



  const handleSuggestionPress = (suggestion) => {
    setCity(suggestion.display_name);
    setSuggestions([]);
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
      console.log('Favorites après ajout:', favorites); // Ajouter ce log
      Alert.alert('Succès', 'Ville ajoutée aux favoris');
    } catch (err) {
      console.error(err);
      Alert.alert('Erreur', 'Impossible d\'ajouter la ville aux favoris');
    }
  };

  return (
    <PaperProvider>
      <ScrollView contentContainerStyle={styles.container}>
        <Title style={styles.text}>Page de recherche</Title>
        <TextInput
          mode="outlined"
          label="Rechercher une ville"
          value={city}
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
          <Card style={styles.resultContainer}>
            <Card.Content>
              <Title>Météo actuelle pour {city} :</Title>
              <Text>Température : {weatherData.current_weather.temperature}°C / {(weatherData.current_weather.temperature * 9/5 + 32).toFixed(2)}°F</Text>
              <Text>Min : {weatherData.daily.temperature_2m_min[0]}°C / {(weatherData.daily.temperature_2m_min[0] * 9/5 + 32).toFixed(2)}°F</Text>
              <Text>Max : {weatherData.daily.temperature_2m_max[0]}°C / {(weatherData.daily.temperature_2m_max[0] * 9/5 + 32).toFixed(2)}°F</Text>
              <Text>Humidité relative : {weatherData.hourly.relative_humidity_2m[0]}%</Text>

              <Button mode="contained" onPress={addToFavorites} style={styles.button}>
                Ajouter aux favoris
              </Button>

              <Title>Prévisions météo :</Title>
              {weatherData.daily.time.slice(1).map((date, index) => (
                <View key={index} style={styles.forecast}>
                  <Text>{new Date(date).toLocaleDateString()} :</Text>
                  <Text>Température Min : {weatherData.daily.temperature_2m_min[index + 1]}°C / {(weatherData.daily.temperature_2m_min[index + 1] * 9/5 + 32).toFixed(2)}°F</Text>
                  <Text>Température Max : {weatherData.daily.temperature_2m_max[index + 1]}°C / {(weatherData.daily.temperature_2m_max[index + 1] * 9/5 + 32).toFixed(2)}°F</Text>
                  <Text>Précipitations : {weatherData.daily.precipitation_sum[index + 1]} mm</Text>
                </View>
              ))}
            </Card.Content>
          </Card>
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
  forecast: {
    marginTop: 10,
  },
  error: {
    color: 'red',
    marginTop: 20,
  },
});

export default SearchScreen;
