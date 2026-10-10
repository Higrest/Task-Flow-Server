import prisma from '../config/db.js';

export const createTask = async (req, res) => {
  const { projectId } = req.params;
  const { title, description, status, priority, deadline } = req.body;

  try {
    if (!title || !deadline) {
      return res.status(400).json({ message: 'Название и дедлайн задачи обязательны' });
    }

    const project = await prisma.project.findUnique({ where: { id: projectId } });
    if (!project || project.ownerId !== req.user.id) {
      return res.status(403).json({ message: 'Нет доступа к этому проекту' });
    }

    const newTask = await prisma.task.create({
      data: {
        title,
        description,
        status: status || 'Todo',
        priority: priority || 'Medium',
        deadline: new Date(deadline),
        projectId,
      },
    });

    return res.status(201).json(newTask);
  } catch (error) {
    console.error('Ошибка при создании задачи:', error);
    return res.status(500).json({ message: 'Не удалось создать задачу' });
  }
};

export const updateTaskStatus = async (req, res) => {
  const { projectId, taskId } = req.params;
  const { status, priority } = req.body;

  try {
    const project = await prisma.project.findUnique({ where: { id: projectId } });
    if (!project || project.ownerId !== req.user.id) {
      return res.status(403).json({ message: 'Нет доступа к этому проекту' });
    }

    const updatedTask = await prisma.task.update({
      where: { id: taskId },
      data: {
        ...(status && { status }),
        ...(priority && { priority }),
      },
    });

    return res.json(updatedTask);
  } catch (error) {
    console.error('Ошибка при обновлении задачи:', error);
    return res.status(500).json({ message: 'Не удалось обновить задачу' });
  }
};

export const deleteTask = async (req, res) => {
  const { projectId, taskId } = req.params;

  try {
    const project = await prisma.project.findUnique({ where: { id: projectId } });
    if (!project || project.ownerId !== req.user.id) {
      return res.status(403).json({ message: 'Нет доступа к этому проекту' });
    }

    await prisma.task.delete({ where: { id: taskId } });

    return res.json({ message: 'Задача успешно удалена' });
  } catch (error) {
    console.error('Ошибка при удалении задачи:', error);
    return res.status(500).json({ message: 'Не удалось удалить задачу' });
  }
};
