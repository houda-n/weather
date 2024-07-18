import React, { useState } from 'react';
import { View, TextInput, Button, StyleSheet, Text } from 'react-native';

const SearchScreen = () => {
  const [city, setCity] = useState('');
  const [searchResult, setSearchResult] = useState('');

  const handleSearch = () => {
    setSearchResult(`Résultat de la recherche pour : ${city}`);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.text}>Page de recherche</Text>
      <TextInput
        style={styles.input}
        placeholder="Rechercher une ville"
        value={city}
        onChangeText={setCity}
      />
      <Button title="Rechercher" onPress={handleSearch} />
      {searchResult ? <Text style={styles.result}>{searchResult}</Text> : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  text: {
    fontSize: 24,
    marginBottom: 20,
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 20,
    paddingLeft: 8,
    width: '80%',
  },
  result: {
    marginTop: 20,
    fontSize: 18,
    color: 'blue',
  },
});

export default SearchScreen;
