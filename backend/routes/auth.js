const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { Users } = require('./models'); // Modèle Users connecté à votre base PostgreSQL
const router = express.Router();

// Clé secrète pour JWT (à sécuriser dans une variable d'environnement)
const JWT_SECRET = process.env.JWT_SECRET || 'votreCleSecreteJWT';

// Route d'inscription
router.post('/signup', async (req, res) => {
  const { name, email, password } = req.body;

  try {
    // Vérifier si l'utilisateur existe déjà
    const existingUser = await Users.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: 'Email déjà utilisé' });
    }

    // Hasher le mot de passe
    const hashedPassword = await bcrypt.hash(password, 10);

    // Créer un nouvel utilisateur
    const user = await Users.create({ name, email, password: hashedPassword });

    return res.status(201).json({ message: 'Utilisateur créé avec succès', user });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Erreur interne du serveur' });
  }
});

// Route de connexion
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    // Vérifier si l'utilisateur existe
    const user = await Users.findOne({ where: { email } });
    if (!user) {
      return res.status(400).json({ message: 'Utilisateur non trouvé' });
    }

    // Vérifier le mot de passe
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Mot de passe incorrect' });
    }

    // Générer un token JWT
    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '1h' });

    return res.status(200).json({ message: 'Connexion réussie', token });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Erreur interne du serveur' });
  }
});

// Route pour les suggestions
router.post('/suggestions', async (req, res) => {
  console.log('Requête reçue sur /suggestions:', req.body);
  const { temperature, condition, userPreferences } = req.body;

  // Construisez un prompt pour ChatGPT
  const prompt = `
    Je suis un assistant IA spécialisé en météo. Voici les conditions :
    - Température actuelle : ${temperature}°C.
    - Condition météo : ${condition}.
    - Préférences utilisateur : ${userPreferences || 'aucune'}.
    Propose-moi une suggestion vestimentaire adaptée et pratique, en une ou deux phrases.
  `;

  try {
    const response = await axios.post(
      'https://api.openai.com/v1/completions',
      {
        model: 'text-davinci-003',
        prompt: prompt,
        max_tokens: 150,
        temperature: 0.7,
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        },
      }
    );

    const suggestion = response.data.choices[0].text.trim();
    res.json({ suggestion });
  } catch (error) {
    console.error('Erreur avec l’API OpenAI :', error.response?.data || error.message);
    res.status(500).json({ error: 'Impossible de générer une suggestion.' });
  }
});

module.exports = router;
