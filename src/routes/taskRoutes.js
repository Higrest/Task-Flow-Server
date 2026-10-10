import express from 'express';
import { 
  createTask, 
  updateTaskStatus, 
  deleteTask 
} from '../controllers/taskController.js';
import { protect } from '../middleware/authMiddleware.js';

// mergeParams: true позволяет передавать :projectId из родительского роутера проектов в этот дочерний
const router = express.Router({ mergeParams: true });

// Все операции с задачами требуют обязательной авторизации
router.use(protect);

// 1. Создать новую задачу внутри конкретного проекта
// POST /api/projects/:projectId/tasks
router.route('/')
  .post(createTask);

// 2. Обновить статус задачи (перемещение по Канбан-доске) или удалить задачу по ID
// PATCH  /api/projects/:projectId/tasks/:taskId
// DELETE /api/projects/:projectId/tasks/:taskId
router.route('/:taskId')
  .patch(updateTaskStatus)
  .delete(deleteTask);

export default router;
