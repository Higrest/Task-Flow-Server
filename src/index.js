import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/authRoutes.js';
import projectRoutes from './routes/projectRoutes.js';
import taskRoutes from './routes/taskRoutes.js';

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/projects/:projectId/tasks', taskRoutes);

app.get('/', (req, res) => {
  res.json({ message: 'TaskFlow API работает стабильно!' });
});

const PORT = process.env.PORT || 5089;
app.listen(PORT, () => {
  console.log(`🚀 Сервер успешно запущен на порту ${PORT}`);
});
