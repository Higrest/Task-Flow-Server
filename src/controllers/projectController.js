import prisma from '../config/db.js';

// @desc    Получить все проекты текущего пользователя
// @route   GET /api/projects
// @access  Private
export const getProjects = async (req, res) => {
  try {
    // Вытаскиваем проекты, где ownerId равен ID авторизованного пользователя
    const projects = await prisma.project.findMany({
      where: { ownerId: req.user.id },
      orderBy: { createdAt: 'desc' },
    });

    return res.json(projects);
  } catch (error) {
    console.error('Ошибка при получении проектов:', error);
    return res.status(500).json({ message: 'Не удалось загрузить список проектов' });
  }
};
// @desc    Получить один проект со всеми его задачами (Канбан-доска)
// @route   GET /api/projects/:id
// @access  Private
export const getProjectById = async (req, res) => {
  const { id } = req.params;

  try {
    // Ищем проект и подтягиваем массив связанных с ним задач (tasks)
    const project = await prisma.project.findUnique({
      where: { id },
      include: {
        tasks: {
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    if (!project) {
      return res.status(404).json({ message: 'Проект не найден' });
    }

    // Проверяем, является ли текущий пользователь владельцем проекта
    if (project.ownerId !== req.user.id) {
      return res.status(403).json({ message: 'Доступ запрещен к чужому проекту' });
    }

    return res.json(project);
  } catch (error) {
    console.error('Ошибка при получении данных проекта:', error);
    return res.status(500).json({ message: 'Ошибка сервера при загрузке проекта' });
  }
};
// @desc    Создать новый проект
// @route   POST /api/projects
// @access  Private
export const createProject = async (req, res) => {
  const { title, description } = req.body;

  try {
    if (!title) {
      return res.status(400).json({ message: 'Название проекта обязательно' });
    }

    // Создаем проект и привязываем его к req.user.id (из authMiddleware)
    const newProject = await prisma.project.create({
      data: {
        title,
        description,
        ownerId: req.user.id,
      },
    });

    return res.status(201).json(newProject);
  } catch (error) {
    console.error('Ошибка при создании проекта:', error);
    return res.status(500).json({ message: 'Не удалось создать проект' });
  }
};
// @desc    Удалить проект (Жесткое бизнес-правило: только владелец)
// @route   DELETE /api/projects/:id
// @access  Private
export const deleteProject = async (req, res) => {
  const { id } = req.params;

  try {
    const project = await prisma.project.findUnique({ where: { id } });

    if (!project) {
      return res.status(404).json({ message: 'Проект не найден' });
    }

    // Реализация главного правила: сверяем ownerId проекта с ID вошедшего пользователя
    if (project.ownerId !== req.user.id) {
      return res.status(403).json({ message: 'Вы не являетесь владельцем. Только создатель может удалить этот проект!' });
    }

    // Если проверки прошли, каскадно удаляем проект вместе с его задачами из PostgreSQL
    await prisma.project.delete({ where: { id } });

    return res.json({ message: 'Проект и все связанные задачи успешно удалены' });
  } catch (error) {
    console.error('Ошибка при удалении проекта:', error);
    return res.status(500).json({ message: 'Не удалось удалить проект' });
  }
};
