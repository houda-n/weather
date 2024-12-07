const { sequelize } = require('./models'); // Assurez-vous que le chemin vers `models` est correct
const express = require('express');
const app = express();
const PORT = process.env.PORT || 3001;

// Synchroniser la base de données
sequelize.sync({ alter: true })
  .then(() => {
    console.log("Database synchronized successfully.");
  })
  .catch((error) => {
    console.error("Error synchronizing database:", error);
  });

// Démarrer le serveur (optionnel)
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
