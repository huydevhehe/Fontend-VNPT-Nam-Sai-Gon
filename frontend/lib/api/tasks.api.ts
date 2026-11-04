import { apiFetch } from "./client";
import { TaskRecord, TaskStatus } from "@/lib/crm/types/crm.types";

export type CreateTaskInput = Omit<TaskRecord, "id">;

export function getTasks(): Promise<TaskRecord[]> {
  return apiFetch<TaskRecord[]>("/tasks");
}

export function createTask(data: CreateTaskInput): Promise<TaskRecord> {
  return apiFetch<TaskRecord>("/tasks", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function updateTaskStatus(id: string, status: TaskStatus): Promise<TaskRecord> {
  return apiFetch<TaskRecord>(`/tasks/${id}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  });
}
