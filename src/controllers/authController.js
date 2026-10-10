import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../config/db.js';

// Вспомогательная функция для генерации защищенного JWT-токена на 30 дней
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
};

// @desc    Регистрация нового пользователя
// @route   POST /api/auth/register
export const registerUser = async (req, res) => {
  const { name, email, password } = req.body;

  try {
    // 1. Проверяем, заполнены ли все обязательные поля
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Пожалуйста, заполните все поля' });
    }

    // 2. Проверяем, существует ли уже пользователь с таким email
    const userExists = await prisma.user.findUnique({ where: { email } });
    if (userExists) {
      return res.status(400).json({ message: 'Пользователь с таким email уже зарегистрирован' });
    }

    // 3. Хэшируем (шифруем) пароль с помощью солевого ключа (10 раундов)
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // 4. Создаем запись нового пользователя в базе данных PostgreSQL
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
      },
    });

    // 5. Возвращаем клиенту данные созданного пользователя и JWT токен доступа
    return res.status(201).json({
      token: generateToken(user.id),
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    console.error('Ошибка при регистрации пользователя:', error);
    return res.status(500).json({ message: 'Внутренняя ошибка сервера при регистрации' });
  }
};
// @desc    Авторизация пользователя (Вход)
// @route   POST /api/auth/login
export const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    // 1. Проверяем, передал ли клиент логин и пароль
    if (!email || !password) {
      return res.status(400).json({ message: 'Пожалуйста, введите email и пароль' });
    }

    // 2. Ищем пользователя в базе данных по его email
    const user = await prisma.user.findUnique({ where: { email } });

    // 3. Если пользователь найден, сравниваем хэши из базы с введенным паролем
    if (user && (await bcrypt.compare(password, user.password))) {
      return res.json({
        token: generateToken(user.id),
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
        },
      });
    } else {
      // Специально даем размытый ответ в целях безопасности, чтобы хакеры не угадали существующие email
      return res.status(401).json({ message: 'Неверный email или пароль' });
    }
  } catch (error) {
    console.error('Ошибка при входе пользователя:', error);
    return res.status(500).json({ message: 'Внутренняя ошибка сервера при авторизации' });
  }
};
export const getMe = async (req, res) => {
  try {
    // Наш authMiddleware уже проверил токен и записал чистые данные в объект req.user
    return res.json(req.user);
  } catch (error) {
    console.error('Ошибка при получении профиля:', error);
    return res.status(500).json({ message: 'Не удалось загрузить данные профиля' });
  }
};
