import { User } from "./user";

export enum TaskStatusEnum {
  PENDING = "Pending",
  IN_PROGRESS = "InProgress",
  COMPLETED = "Completed",
}

export type Task = {
  id: number;
  title: string;
  description?: string;
  status: TaskStatusEnum;
  createdAt: Date;
  dueDate?: Date;
  assignee?: User;
  createdBy: User;
};

export type CreateTaskDto = {
  title: string;
  description?: string;
  assigneeId: number;
  dueDate?: Date;
};

export type UpdateTaskStatusDto = {
  status: TaskStatusEnum;
};

export type QueryTaskDto = {
  assigneeId?: number;
  status?: TaskStatusEnum;
  sortBy?: "createdAt" | "dueDate" | "status";
  order?: "ASC" | "DESC";
  page?: number;
  limit?: number;
};

export type EmployeeTaskSummaryDto = {
  employeeId: number;
  totalTasks: number;
  completedTasks: number;
};
