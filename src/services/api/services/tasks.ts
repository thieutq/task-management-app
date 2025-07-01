import { useCallback } from "react";
import useFetch from "../use-fetch";
import { API_URL } from "../config";
import wrapperFetchJsonResponse from "../wrapper-fetch-json-response";
import { Task, Employee, TaskStatusEnum, TaskSummary } from "../types/task";
import { SortEnum } from "../types/sort-type";
import { InfinityPaginationType } from "../types/infinity-pagination";
import { RequestConfigType } from "./types/request-config";

export type TasksRequest = {
  sort?: Array<{
    orderBy: keyof Task;
    order: SortEnum;
  }>;
  filters?: {
    assignees?: Employee[];
    statuses?: { value: TaskStatusEnum }[];
  };
  page: number;
  limit: number;
};

export type TasksResponse = InfinityPaginationType<Task>;

export function useGetTasksService() {
  const fetch = useFetch();

  return useCallback(
    (data: TasksRequest, requestConfig?: RequestConfigType) => {
      console.log(data, "TasksRequest");
      const requestUrl = new URL(`${API_URL}/v1/tasks`);
      requestUrl.searchParams.append("page", data.page.toString());
      requestUrl.searchParams.append("limit", data.limit.toString());
      if (data.filters) {
        requestUrl.searchParams.append("filters", JSON.stringify(data.filters));
      }
      if (data.sort) {
        requestUrl.searchParams.append("sort", JSON.stringify(data.sort));
      }
      return fetch(requestUrl, {
        method: "GET",
        ...requestConfig,
      }).then(wrapperFetchJsonResponse<TasksResponse>);
    },
    [fetch]
  );
}

export type TaskRequest = { id: Task["id"] };
export type TaskResponse = Task;

export function useGetTaskService() {
  const fetch = useFetch();
  return useCallback(
    (data: TaskRequest, requestConfig?: RequestConfigType) => {
      return fetch(`${API_URL}/v1/tasks/${data.id}`, {
        method: "GET",
        ...requestConfig,
      }).then(wrapperFetchJsonResponse<TaskResponse>);
    },
    [fetch]
  );
}

export type TaskPostRequest = {
  title: string;
  description?: string;
  assigneeId: number;
  dueDate?: Date;
};
export type TaskPostResponse = Task;

export function usePostTaskService() {
  const fetch = useFetch();
  return useCallback(
    (data: TaskPostRequest, requestConfig?: RequestConfigType) => {
      return fetch(`${API_URL}/v1/tasks`, {
        method: "POST",
        body: JSON.stringify(data),
        ...requestConfig,
      }).then(wrapperFetchJsonResponse<TaskPostResponse>);
    },
    [fetch]
  );
}

export type TaskPatchRequest = {
  id: Task["id"];
  data: {
    status: TaskStatusEnum;
  };
};

export type TaskPatchResponse = Task;

export function usePatchTaskStatusService() {
  const fetch = useFetch();
  return useCallback(
    (data: TaskPatchRequest, requestConfig?: RequestConfigType) => {
      return fetch(`${API_URL}/v1/tasks/${data.id}/status`, {
        method: "PATCH",
        body: JSON.stringify(data.data),
        ...requestConfig,
      }).then(wrapperFetchJsonResponse<TaskPatchRequest>);
    },
    [fetch]
  );
}

export type TaskSummaryResponse = TaskSummary[];

export function useGetTaskSummaryService() {
  const fetch = useFetch();
  return useCallback(
    (requestConfig?: RequestConfigType) => {
      return fetch(`${API_URL}/v1/tasks/summary`, {
        method: "GET",
        ...requestConfig,
      }).then(wrapperFetchJsonResponse<TaskSummary>);
    },
    [fetch]
  );
}

export type EmployeesResponse = Employee[];

export function useGetEmployeesService() {
  const fetch = useFetch();
  return useCallback(
    (requestConfig?: RequestConfigType) => {
      return fetch(`${API_URL}/v1/tasks/employees`, {
        method: "GET",
        ...requestConfig,
      }).then(wrapperFetchJsonResponse<EmployeesResponse>);
    },
    [fetch]
  );
}

export type { Employee } from "../types/task";
