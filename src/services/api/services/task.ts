import {
  Task,
  TaskStatusEnum,
  CreateTaskDto,
  UpdateTaskStatusDto,
  QueryTaskDto,
  EmployeeTaskSummaryDto,
} from "../types/task";
import { User } from "../types/user";

// Fake users (2 employers, 3 employees)
const users: User[] = [
  {
    id: "1",
    email: "employer1@example.com",
    firstName: "Alice",
    lastName: "Employer",
    role: { id: 3, name: "Employer" },
  },
  {
    id: "2",
    email: "employer2@example.com",
    firstName: "Bob",
    lastName: "Employer",
    role: { id: 3, name: "Employer" },
  },
  {
    id: "3",
    email: "carol@example.com",
    firstName: "Carol",
    lastName: "Employee",
    role: { id: 4, name: "Employee" },
  },
  {
    id: "4",
    email: "dave@example.com",
    firstName: "Dave",
    lastName: "Employee",
    role: { id: 4, name: "Employee" },
  },
  {
    id: "5",
    email: "eve@example.com",
    firstName: "Eve",
    lastName: "Employee",
    role: { id: 4, name: "Employee" },
  },
];

// Fake tasks
const tasks: Task[] = [
  {
    id: 1,
    title: "Prepare report",
    description: "Prepare the monthly report",
    status: TaskStatusEnum.PENDING,
    createdAt: new Date("2024-06-01T09:00:00Z"),
    dueDate: new Date("2024-06-10T09:00:00Z"),
    assignee: users[2],
    createdBy: users[0],
  },
  {
    id: 2,
    title: "Update website",
    status: TaskStatusEnum.IN_PROGRESS,
    createdAt: new Date("2024-06-02T10:00:00Z"),
    dueDate: new Date("2024-06-12T09:00:00Z"),
    assignee: users[3],
    createdBy: users[1],
  },
  {
    id: 3,
    title: "Fix bugs",
    status: TaskStatusEnum.COMPLETED,
    createdAt: new Date("2024-06-03T11:00:00Z"),
    assignee: users[4],
    createdBy: users[0],
  },
];

// Helper: get user by id
function getUserById(id: number) {
  return users.find((u) => Number(u.id) === Number(id));
}

// GET /api/v1/tasks
export function getTasks(query: QueryTaskDto, currentUser: User): Task[] {
  let result = tasks;
  // Employee: only see their tasks
  if (currentUser.role?.id === 4) {
    result = result.filter(
      (t) => t.assignee && t.assignee.id === currentUser.id
    );
  } else if (query.assigneeId) {
    result = result.filter(
      (t) => t.assignee && Number(t.assignee.id) === Number(query.assigneeId)
    );
  }
  if (query.status) {
    result = result.filter((t) => t.status === query.status);
  }
  // Sorting
  if (query.sortBy) {
    result = result.slice().sort((a, b) => {
      const aValue = a[query.sortBy!];
      const bValue = b[query.sortBy!];
      if (aValue instanceof Date && bValue instanceof Date) {
        return query.order === "DESC"
          ? bValue.getTime() - aValue.getTime()
          : aValue.getTime() - bValue.getTime();
      }
      if (typeof aValue === "string" && typeof bValue === "string") {
        return query.order === "DESC"
          ? bValue.localeCompare(aValue)
          : aValue.localeCompare(bValue);
      }
      return 0;
    });
  }
  // Pagination
  if (query.page && query.limit) {
    const start = (query.page - 1) * query.limit;
    result = result.slice(start, start + query.limit);
  }
  return result;
}

// PATCH /api/v1/tasks/:id
export function updateTaskStatus(
  id: number,
  dto: UpdateTaskStatusDto,
  currentUser: User
): Task | null {
  const task = tasks.find((t) => t.id === id);
  if (!task) return null;
  // Only assignee (employee) can update status
  if (currentUser.role?.id === 4 && task.assignee?.id !== currentUser.id)
    return null;
  task.status = dto.status;
  return task;
}

// POST /api/v1/tasks
export function createTask(dto: CreateTaskDto, currentUser: User): Task {
  const assignee = getUserById(dto.assigneeId);
  if (!assignee) throw new Error("Assignee not found");
  const newTask: Task = {
    id: tasks.length ? Math.max(...tasks.map((t) => t.id)) + 1 : 1,
    title: dto.title,
    description: dto.description,
    status: TaskStatusEnum.PENDING,
    createdAt: new Date(),
    dueDate: dto.dueDate ? new Date(dto.dueDate) : undefined,
    assignee,
    createdBy: currentUser,
  };
  tasks.push(newTask);
  return newTask;
}

// GET /api/v1/tasks/summary
export function getEmployeeTaskSummary(): EmployeeTaskSummaryDto[] {
  const employees = users.filter((u) => u.role?.id === 4);
  return employees.map((emp) => {
    const empTasks = tasks.filter(
      (t) => t.assignee && t.assignee.id === emp.id
    );
    const completed = empTasks.filter(
      (t) => t.status === TaskStatusEnum.COMPLETED
    ).length;
    return {
      employeeId: Number(emp.id),
      totalTasks: empTasks.length,
      completedTasks: completed,
    };
  });
}
