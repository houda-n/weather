const request = require('supertest');
const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { sequelize, User, WeatherData } = require('./setupTestDb');

beforeAll(async () => {
  await sequelize.sync({ force: true }); // Réinitialise la base avant tous les tests
});

beforeEach(async () => {
  // Nettoyer la base entre chaque test
  await User.destroy({ where: {} });
  await WeatherData.destroy({ where: {} });
});

afterAll(async () => {
  await sequelize.close(); // Fermer la connexion après tous les tests
});


const app = express();
app.use(express.json());

// Ajoutez vos routes ici
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
app.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(404).json({ error: 'Utilisateur non trouvé' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Mot de passe incorrect' });
    }

    const token = jwt.sign({ id: user.id }, 'votre_clé_secrète', { expiresIn: '1h' });
    res.status(200).json({ token });
  } catch (error) {
    console.error('Erreur lors de la connexion :', error);
    res.status(500).json({ error: 'Erreur serveur lors de la connexion' });
  }
});


// Test pour l'inscription
describe('API Tests', () => {
  beforeAll(async () => {
    await sequelize.sync({ force: true }); // Réinitialiser la base de données
  });

  test('Inscription réussie', async () => {
    const response = await request(app).post('/signup').send({
      email: 'test@example.com',
      password: 'password123',
    });

    expect(response.status).toBe(201);
    expect(response.body.message).toBe('Utilisateur créé avec succès');

    const user = await User.findOne({ where: { email: 'test@example.com' } });
    expect(user).toBeTruthy();
  });

  test('Connexion réussie', async () => {
    try {
      const hashedPassword = await bcrypt.hash('password123', 10);
      await User.create({ email: 'test@example.com', password: hashedPassword });

      const response = await request(app).post('/login').send({
        email: 'test@example.com',
        password: 'password123',
      });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('token');
    } catch (error) {
      console.error('Test Connexion réussie erreur :', error);
      throw error;
    }
  });
  test('Connexion avec mot de passe incorrect', async () => {
    const hashedPassword = await bcrypt.hash('password123', 10);
    await User.create({ email: 'test@example.com', password: hashedPassword });

    const response = await request(app).post('/login').send({
      email: 'test@example.com',
      password: 'wrongpassword',
    });

    expect(response.status).toBe(401);
    expect(response.body.error).toBe('Mot de passe incorrect');
  });
});


