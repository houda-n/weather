module.exports = (sequelize, DataTypes) => {
  const WeatherData = sequelize.define('WeatherData', {
    temperature: DataTypes.FLOAT,
    humidity: DataTypes.FLOAT,
    recorded_at: DataTypes.DATE
  }, {});

  WeatherData.associate = function(models) {
    WeatherData.belongsTo(models.Location, { foreignKey: 'location_id' });
  };
  return WeatherData;
};
