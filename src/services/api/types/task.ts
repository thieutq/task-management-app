import { User } from "./user";

export enum TaskStatusEnum {
  PENDING = "Pending",
  IN_PROGRESS = "InProgress",
  COMPLETED = "Completed",
}

export type Employee = Pick<User, "id" | "firstName" | "lastName">;
export type Employer = Pick<User, "id" | "firstName" | "lastName">;

export type Task = {
  id: number;
  title: string;
  description?: string;
  status: TaskStatusEnum;
  createdAt: Date;
  dueDate?: Date;
  assignee?: Employee;
  createdBy: Employer;
};

export type TaskSummary = Employee & {
  totalTasks: number;
  completedTasks: number;
};
