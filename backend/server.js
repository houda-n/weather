require('dotenv').config();
const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const axios = require('axios');
const { Sequelize, DataTypes } = require('sequelize');
const suggestionsRoutes = require('./routes/suggestions'); // Import des routes de suggestions

// Initialisation d'Express
const app = express();
app.use(express.json()); // Middleware pour parser les JSON

// Configuration de la base de données
const sequelize = new Sequelize(process.env.DATABASE_NAME, process.env.DATABASE_USER, process.env.DATABASE_PASSWORD, {
  host: process.env.DATABASE_HOST,
  dialect: 'postgres',
});

// Définir le modèle User
const User = sequelize.define('User', {
  email: { type: DataTypes.STRING, allowNull: false, unique: true },
  password: { type: DataTypes.STRING, allowNull: false },
});

// Routes
app.use('/suggestions', suggestionsRoutes); // Ajout des routes suggestions

// Route d'inscription
app.post('/signup', async (req, res) => {
  const { email, password } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({ email, password: hashedPassword });
    res.status(201).json({ message: 'Utilisateur créé avec succès' });
  } catch (error) {
    res.status(400).json({ error: 'Erreur lors de l’inscription' });
  }
});

// Route de connexion
app.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ where: { email } });
    if (!user) return res.status(404).json({ error: 'Utilisateur non trouvé' });

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) return res.status(401).json({ error: 'Mot de passe incorrect' });

    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.json({ token });
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de la connexion' });
  }
});

// Route pour les suggestions
app.post('/suggestions', async (req, res) => {
  console.log('Requête reçue sur /suggestions:', req.body);

  const { temperature = 'non spécifiée', condition = 'non spécifiée', userPreferences = 'aucune' } = req.body;

  const prompt = `
    Je suis un assistant IA spécialisé en météo. Voici les conditions :
    - Température actuelle : ${temperature}°C.
    - Condition météo : ${condition}.
    - Préférences utilisateur : ${userPreferences}.
    Propose-moi une suggestion vestimentaire adaptée et pratique, en une ou deux phrases.
  `;

  console.log('Prompt envoyé à OpenAI:', prompt);

  try {
    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-3.5-turbo',
        messages: [
          { role: 'system', content: 'Vous êtes un assistant spécialisé en météo.' },
          { role: 'user', content: prompt },
        ],
        max_tokens: 150,
        temperature: 0.7,
      },
      {
        headers: {
                  Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        },
      }
    );

    const suggestion = response.data.choices[0].message.content.trim();
    res.json({ suggestion });
  } catch (error) {
    console.error('Erreur avec l’API OpenAI :', error.response?.data || error.message);
    res.status(500).json({ error: 'Impossible de générer une suggestion.' });
  }
});

// Synchroniser la base de données
sequelize.sync().then(() => {
  app.listen(3001, () => console.log('Serveur démarré sur le port 3001'));
});
