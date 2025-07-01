import { Task, Employee, TaskStatusEnum } from "@/services/api/types/task";
import { SortEnum } from "@/services/api/types/sort-type";

export type TaskFilterType = {
  assignees?: Employee[];
  statuses?: { value: TaskStatusEnum }[];
};

export type TaskSortType = {
  orderBy: keyof Task;
  order: SortEnum;
};
