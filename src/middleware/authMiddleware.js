import jwt from 'jsonwebtoken';
import prisma from '../config/db.js';

export const protect = async (req, res, next) => {
  let token;

  // 1. Сўров сарлавҳасида (headers) токен борлигини текширамиз
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // "Bearer TOKEN_STRING" кўринишидан токенни ажратиб оламиз
      token = req.headers.authorization.split(' ')[1];

      // 2. Токенни махфий калит (JWT_SECRET) орқали декод қиламиз
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // 3. Базадан фойдаланувчини ID бўйича қидирамиз (паролни хавфсизлик учун чиқариб ташлаймиз)
      req.user = await prisma.user.findUnique({
        where: { id: decoded.id },
        select: {
          id: true,
          name: true,
          email: true,
        },
      });

      // Агар бундай фойдаланувчи базада топилмаса
      if (!req.user) {
        return res.status(401).json({ message: 'Пользователь не найден, доступ отклонен' });
      }

      // Ҳаммаси жойида бўлса, кейинги контроллерга ўтказиб юборамиз
      next();
    } catch (error) {
      console.error('Ошибка проверки JWT токена:', error);
      return res.status(401).json({ message: 'Неверный или просроченный токен авторизации' });
    }
  }

  // Агар токен умуман жўнатилмаган бўлса
  if (!token) {
    return res.status(401).json({ message: 'Доступ запрещен, токен отсутствует' });
  }
};
