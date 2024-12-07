import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, FlatList, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { TextInput, Button, Text, List, IconButton, Provider as PaperProvider } from 'react-native-paper';
import axios from 'axios';

const FavoritesScreen = () => {
  const [city, setCity] = useState('');
  const [favorites, setFavorites] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadFavorites = async () => {
      try {
        const storedFavorites = await AsyncStorage.getItem('favorites');
        if (storedFavorites) {
          setFavorites(JSON.parse(storedFavorites));
        }
      } catch (error) {
        console.error(error);
      }
    };
    loadFavorites();
  }, []);

  const handleCityChange = async (text) => {
    setCity(text);
    if (text.length > 2) {
      try {
        setLoading(true);
        const response = await axios.get(`https://nominatim.openstreetmap.org/search`, {
          params: { q: text, format: 'json', addressdetails: 1, limit: 5 },
          headers: { 'User-Agent': 'WeatherGuruApp/1.0 (contact: your_email@example.com)' },
        });
        setSuggestions(response.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    } else {
      setSuggestions([]);
    }
  };

  const handleSuggestionPress = (suggestion) => {
    setCity(suggestion.display_name);
    setSuggestions([]);
  };

  const addFavorite = async () => {
    if (city) {
      try {
        const response = await axios.get(`https://nominatim.openstreetmap.org/search`, {
          params: { q: city, format: 'json' },
          headers: { 'User-Agent': 'WeatherGuruApp/1.0 (contact: your_email@example.com)' },
        });

        if (response.data.length === 0) {
          setError('Ville non trouvée');
          return;
        }

        const newFavorites = [...favorites, city];
        setFavorites(newFavorites);
        await AsyncStorage.setItem('favorites', JSON.stringify(newFavorites));
        setCity('');
        setError(null);
      } catch (error) {
        setError('Erreur lors de l\'ajout de la ville aux favoris');
      }
    }
  };

  const removeFavorite = async (cityToRemove) => {
    try {
      const newFavorites = favorites.filter((item) => item !== cityToRemove);
      setFavorites(newFavorites);
      await AsyncStorage.setItem('favorites', JSON.stringify(newFavorites));
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <PaperProvider>
      <View style={styles.container}>
        <Text style={styles.text}>Favorites</Text>
        <TextInput
          mode="outlined"
          label="Add City"
          value={city}
          onChangeText={handleCityChange}
          style={styles.input}
        />
        {loading ? (
          <ActivityIndicator size="large" color="#6200ee" />
        ) : (
          <>
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
            {error && <Text style={styles.error}>{error}</Text>}
            <Button mode="contained" onPress={addFavorite} style={styles.button}>
              Add to Favorites
            </Button>
          </>
        )}
        <FlatList
          data={favorites}
          keyExtractor={(item) => item}
          renderItem={({ item }) => (
            <List.Item
              title={item}
              left={(props) => <List.Icon {...props} icon="city" />}
              right={(props) => (
                <IconButton
                  {...props}
                  icon="delete"
                  onPress={() => removeFavorite(item)}
                />
              )}
            />
          )}
        />
      </View>
    </PaperProvider>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f5f5f5',
  },
  text: {
    fontSize: 24,
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    height: 40,
    marginBottom: 20,
    width: '80%',
  },
  button: {
    marginVertical: 10,
    width: '80%',
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

export default FavoritesScreen;
