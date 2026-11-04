import { Router, Request, Response } from "express";
import { requireAuth } from "../../middleware/require-auth.js";
import { TaskService } from "./task.service.js";

export const taskRouter = Router();
const taskService = new TaskService();

// GET /api/tasks
taskRouter.get("/", async (_req: Request, res: Response) => {
  try {
    const tasks = await taskService.getAll();
    res.json({ success: true, data: tasks });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/tasks
taskRouter.post("/", requireAuth, async (req: Request, res: Response) => {
  try {
    const { title, relatedTarget, assignee, dueDate, priority, status, notes } = req.body;

    const task = await taskService.create({
      title,
      relatedTarget,
      assignee,
      dueDate,
      priority,
      status,
      notes,
    });

    res.status(201).json({ success: true, data: task });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// PATCH /api/tasks/:id/status
taskRouter.patch("/:id/status", requireAuth, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const task = await taskService.updateStatus(id, status);
    res.json({ success: true, data: task });
  } catch (error: any) {
    const statusCode = error.message === "Không tìm thấy công việc" ? 404 : 400;
    res.status(statusCode).json({ success: false, message: error.message });
  }
});
