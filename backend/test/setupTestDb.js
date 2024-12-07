const { Sequelize, DataTypes } = require('sequelize');
const sequelize = new Sequelize('sqlite::memory:', {
   logging: false,
   dialect: 'sqlite',
 });

const User = sequelize.define('User', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  email: { type: DataTypes.STRING, allowNull: false, unique: true },
  password: { type: DataTypes.STRING, allowNull: false },
});


const WeatherData = sequelize.define('WeatherData', {
  cityName: { type: DataTypes.STRING, allowNull: false },
  date: { type: DataTypes.DATE, allowNull: false },
  temperature_max: { type: DataTypes.FLOAT, allowNull: false },
  temperature_min: { type: DataTypes.FLOAT, allowNull: false },
  precipitation: { type: DataTypes.FLOAT, allowNull: false },
});

module.exports = { sequelize, User, WeatherData };
