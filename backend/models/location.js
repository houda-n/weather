module.exports = (sequelize, DataTypes) => {
  const Location = sequelize.define('Location', {
    city_name: DataTypes.STRING,
    country: DataTypes.STRING
  }, {});

  Location.associate = function(models) {
    Location.belongsTo(models.User, { foreignKey: 'user_id' });
    Location.hasMany(models.WeatherData, { foreignKey: 'location_id' });
  };
  return Location;
};
