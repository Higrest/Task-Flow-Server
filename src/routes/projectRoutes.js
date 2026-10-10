import express from 'express';
import { 
  getProjects, 
  getProjectById, 
  createProject, 
  deleteProject 
} from '../controllers/projectController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Применяем прослойку protect ко всем маршрутам этого файла автоматически
router.use(protect);

// 1. Получить все проекты текущего пользователя и создать новый проект
// GET  /api/projects
// POST /api/projects
router.route('/')
  .get(getProjects)
  .post(createProject);

// 2. Получить конкретный проект (для Канбан-доски) и удалить проект по его ID
// GET    /api/projects/:id
// DELETE /api/projects/:id
router.route('/:id')
  .get(getProjectById)
  .delete(deleteProject);

export default router;
