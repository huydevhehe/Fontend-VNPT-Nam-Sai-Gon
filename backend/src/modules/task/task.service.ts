import { query, run } from "../../database/db.js";

export interface TaskRow {
  id: string;
  title: string;
  related_target: string;
  assignee: string;
  due_date: string;
  priority: string;
  status: string;
  notes: string;
}

export interface TaskRecordDto {
  id: string;
  title: string;
  relatedTarget: string;
  assignee: string;
  dueDate: string;
  priority: string;
  status: string;
  notes?: string;
}

export interface CreateTaskInput {
  title: string;
  relatedTarget: string;
  assignee: string;
  dueDate: string;
  priority?: string;
  status?: string;
  notes?: string;
}

const DEFAULT_TASK_PRIORITY = "Vừa";
const DEFAULT_TASK_STATUS = "Mới";

const TASK_STATUSES = ["Mới", "Đang làm", "Hoàn tất", "Quá hạn"] as const;

function toTaskRecord(row: TaskRow): TaskRecordDto {
  return {
    id: row.id,
    title: row.title,
    relatedTarget: row.related_target,
    assignee: row.assignee,
    dueDate: row.due_date,
    priority: row.priority,
    status: row.status,
    notes: row.notes,
  };
}

export class TaskService {
  async getAll(): Promise<TaskRecordDto[]> {
    const rows = await query<TaskRow>("SELECT * FROM tasks ORDER BY created_at DESC");
    return rows.map(toTaskRecord);
  }

  async create(data: CreateTaskInput): Promise<TaskRecordDto> {
    if (!data.title || !data.relatedTarget || !data.assignee || !data.dueDate) {
      throw new Error("Thiếu thông tin bắt buộc để tạo công việc");
    }

    const id = `TASK-${Date.now()}`;
    await run(
      `INSERT INTO tasks (
        id, title, related_target, assignee, due_date, priority, status, notes
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        data.title,
        data.relatedTarget,
        data.assignee,
        data.dueDate,
        data.priority || DEFAULT_TASK_PRIORITY,
        data.status || DEFAULT_TASK_STATUS,
        data.notes || "",
      ]
    );

    const created = await query<TaskRow>("SELECT * FROM tasks WHERE id = ?", [id]);
    return toTaskRecord(created[0]);
  }

  async updateStatus(id: string, status: string): Promise<TaskRecordDto> {
    if (!status) {
      throw new Error("Thiếu trạng thái cần cập nhật");
    }

    if (!TASK_STATUSES.includes(status as (typeof TASK_STATUSES)[number])) {
      throw new Error("Trạng thái không hợp lệ");
    }

    const existing = await query<TaskRow>("SELECT * FROM tasks WHERE id = ?", [id]);
    if (!existing.length) {
      throw new Error("Không tìm thấy công việc");
    }

    await run(
      "UPDATE tasks SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
      [status, id]
    );

    const updated = await query<TaskRow>("SELECT * FROM tasks WHERE id = ?", [id]);
    return toTaskRecord(updated[0]);
  }
}
