import { useGetTasksService } from "@/services/api/services/tasks";
import HTTP_CODES_ENUM from "@/services/api/types/http-codes";
import { createQueryKeys } from "@/services/react-query/query-key-factory";
import { useInfiniteQuery } from "@tanstack/react-query";
import { TaskFilterType, TaskSortType } from "../task-filter-types";

export const tasksQueryKeys = createQueryKeys(["tasks"], {
  list: () => ({
    key: [],
    sub: {
      by: ({
        sort,
        filter,
      }: {
        filter: TaskFilterType | undefined;
        sort?: TaskSortType | undefined;
      }) => ({
        key: [sort, filter],
      }),
    },
  }),
});

export const useGetTasksQuery = ({
  sort,
  filter,
}: {
  filter?: TaskFilterType | undefined;
  sort?: TaskSortType | undefined;
} = {}) => {
  const fetch = useGetTasksService();

  const query = useInfiniteQuery({
    queryKey: tasksQueryKeys.list().sub.by({ sort, filter }).key,
    initialPageParam: 1,
    queryFn: async ({ pageParam, signal }) => {
      const { status, data } = await fetch(
        {
          page: pageParam,
          limit: 10,
          filters: filter,
          sort: sort ? [sort] : undefined,
        },
        {
          signal,
        }
      );

      if (status === HTTP_CODES_ENUM.OK) {
        return {
          data: data.data,
          nextPage: data.hasNextPage ? pageParam + 1 : undefined,
        };
      }
    },
    getNextPageParam: (lastPage) => {
      return lastPage?.nextPage;
    },
    gcTime: 0,
  });

  return query;
};
