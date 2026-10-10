import express from 'express';
import { registerUser, loginUser, getMe } from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// 1. Открытый маршрут для регистрации нового аккаунта
// POST http://localhost:5000/api/auth/register
router.post('/register', registerUser);

// 2. Открытый маршрут для авторизации (входа) пользователя
// POST http://localhost:5000/api/auth/login
router.post('/login', loginUser);

// 3. Защищенный маршрут для получения профиля текущего пользователя
// Сначала срабатывает прослойка protect, и если токен валиден — вызывается getMe
// GET http://localhost:5000/api/auth/me
router.get('/me', protect, getMe);

export default router;
