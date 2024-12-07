import React from 'react';
import { View, Dimensions, StyleSheet } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { Text } from 'react-native-paper';

const screenWidth = Dimensions.get("window").width;

const WeatherChart = ({ weatherData }) => {
  if (!weatherData) return null;

  // Récupération des données de température et d'humidité
  const labels = weatherData.hourly.time.slice(0, 24).map(time => new Date(time).getHours()); // Heures de la journée
  const temperatures = weatherData.hourly.temperature_2m.slice(0, 24);
  const humidity = weatherData.hourly.relative_humidity_2m.slice(0, 24);

  return (
    <View style={styles.chartContainer}>
      <Text style={styles.chartTitle}>Évolution de la Température (°C)</Text>
      <LineChart
        data={{
          labels: labels,
          datasets: [{ data: temperatures }]
        }}
        width={screenWidth - 40} // Largeur du graphique
        height={220} // Hauteur du graphique
        yAxisSuffix="°C"
        chartConfig={chartConfig}
        bezier
        style={styles.chart}
      />

      <Text style={styles.chartTitle}>Évolution de l'Humidité (%)</Text>
      <LineChart
        data={{
          labels: labels,
          datasets: [{ data: humidity }]
        }}
        width={screenWidth - 40}
        height={220}
        yAxisSuffix="%"
        chartConfig={chartConfig}
        bezier
        style={styles.chart}
      />
    </View>
  );
};

const chartConfig = {
  backgroundGradientFrom: "#fff",
  backgroundGradientTo: "#fff",
  color: (opacity = 1) => `rgba(34, 128, 176, ${opacity})`,
  labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
  strokeWidth: 2, // Épaisseur des lignes
  propsForDots: {
    r: "3",
    strokeWidth: "2",
    stroke: "#22a1b6"
  }
};

const styles = StyleSheet.create({
  chartContainer: {
    alignItems: 'center',
    marginVertical: 20,
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  chart: {
    marginVertical: 8,
    borderRadius: 8,
  },
});

export default WeatherChart;
