"use client";

import { RoleEnum } from "@/services/api/types/role";
import withPageRequiredAuth from "@/services/auth/with-page-required-auth";
import { useTranslation } from "@/services/i18n/client";
import Container from "@mui/material/Container";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import { useMemo, useState, useCallback } from "react";
import { useGetTasksQuery } from "./queries/queries";
import { TableVirtuoso } from "react-virtuoso";
import TableCell from "@mui/material/TableCell";
import TableRow from "@mui/material/TableRow";
import LinearProgress from "@mui/material/LinearProgress";
import { styled } from "@mui/material/styles";
import TableComponents from "@/components/table/table-components";
import { useSearchParams, useRouter } from "next/navigation";
import TableSortLabel from "@mui/material/TableSortLabel";
import { Task } from "@/services/api/types/task";
import TaskFilter from "./task-filter";
import { TaskFilterType } from "./task-filter-types";
import { SortEnum } from "@/services/api/types/sort-type";
import Button from "@mui/material/Button";
import Link from "@/components/link";
import removeDuplicatesFromArrayObjects from "@/services/helpers/remove-duplicates-from-array-of-objects";
import TaskActions from "@/components/tasks/task-actions";
import { useUserRole } from "@/hooks/use-user-role";

const TableCellLoadingContainer = styled(TableCell)(() => ({
  padding: 0,
}));

type TasksKeys = keyof Task;

function TableSortCellWrapper(
  props: React.PropsWithChildren<{
    width?: number;
    orderBy: TasksKeys;
    order: SortEnum;
    column: TasksKeys;
    handleRequestSort: (
      event: React.MouseEvent<unknown>,
      property: TasksKeys
    ) => void;
  }>
) {
  return (
    <TableCell
      style={{ width: props.width }}
      sortDirection={props.orderBy === props.column ? props.order : false}
    >
      <TableSortLabel
        active={props.orderBy === props.column}
        direction={props.orderBy === props.column ? props.order : SortEnum.ASC}
        onClick={(event) => props.handleRequestSort(event, props.column)}
      >
        {props.children}
      </TableSortLabel>
    </TableCell>
  );
}

function Tasks() {
  const { t } = useTranslation("tasks");
  const { isEmployer } = useUserRole();
  const searchParams = useSearchParams();
  const router = useRouter();
  const [{ order, orderBy }, setSort] = useState<{
    order: SortEnum;
    orderBy: keyof Task;
  }>(() => {
    const searchParamsSort = searchParams.get("sort");
    if (searchParamsSort) {
      const parsed = JSON.parse(searchParamsSort);
      return {
        order: parsed.order === "ASC" ? SortEnum.ASC : SortEnum.DESC,
        orderBy: parsed.orderBy as keyof Task,
      };
    }
    return { order: SortEnum.DESC, orderBy: "id" };
  });

  const handleRequestSort = (
    event: React.MouseEvent<unknown>,
    property: keyof Task
  ) => {
    const isAsc = orderBy === property && order === SortEnum.ASC;
    const searchParams = new URLSearchParams(window.location.search);
    const newOrder = isAsc ? SortEnum.DESC : SortEnum.ASC;
    const newOrderBy = property;
    searchParams.set(
      "sort",
      JSON.stringify({ order: newOrder, orderBy: newOrderBy })
    );
    setSort({
      order: newOrder,
      orderBy: newOrderBy,
    });
    router.push(window.location.pathname + "?" + searchParams.toString());
  };

  const filter = useMemo(() => {
    const searchParamsFilter = searchParams.get("filter");
    if (searchParamsFilter) {
      return JSON.parse(searchParamsFilter) as TaskFilterType;
    }
    return undefined;
  }, [searchParams]);

  const { data, hasNextPage, isFetchingNextPage, fetchNextPage } =
    useGetTasksQuery({ filter, sort: { order, orderBy } });

  const handleScroll = useCallback(() => {
    if (!hasNextPage || isFetchingNextPage) return;
    fetchNextPage();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const result = useMemo(() => {
    const result =
      (data?.pages.flatMap((page) => page?.data) as Task[]) ?? ([] as Task[]);
    return removeDuplicatesFromArrayObjects(result, "id");
  }, [data]);

  return (
    <Container maxWidth="xl">
      <Grid container spacing={3} pt={3}>
        <Grid container spacing={3} size={{ xs: 12 }}>
          <Grid size="grow">
            <Typography variant="h3">{t("title")}</Typography>
          </Grid>
          <Grid container size="auto" wrap="nowrap" spacing={2}>
            <Grid size="auto">
              <TaskFilter />
            </Grid>
            {!!isEmployer && (
              <>
                <Grid size="auto">
                  <Button
                    variant="contained"
                    LinkComponent={Link}
                    href="/tasks/summary"
                    color="primary"
                  >
                    {t(
                      "actions.viewEmployeeTaskSummary",
                      "Employee Task Summary"
                    )}
                  </Button>
                </Grid>
                <Grid size="auto">
                  <Button
                    variant="contained"
                    LinkComponent={Link}
                    href="/tasks/create"
                    color="success"
                  >
                    {t("actions.create")}
                  </Button>
                </Grid>
              </>
            )}
          </Grid>
        </Grid>
        <Grid size={{ xs: 12 }} mb={2}>
          <TableVirtuoso
            style={{ height: 500 }}
            data={result}
            components={TableComponents}
            endReached={handleScroll}
            overscan={20}
            useWindowScroll
            increaseViewportBy={400}
            fixedHeaderContent={() => (
              <>
                <TableRow>
                  <TableSortCellWrapper
                    width={100}
                    orderBy={orderBy as keyof Task}
                    order={order as SortEnum}
                    column={"id"}
                    handleRequestSort={handleRequestSort}
                  >
                    {t("table.column1")}
                  </TableSortCellWrapper>
                  <TableCell>{t("table.column2")}</TableCell>
                  <TableCell>{t("table.column4")}</TableCell>
                  <TableSortCellWrapper
                    orderBy={orderBy as keyof Task}
                    order={order as SortEnum}
                    column="dueDate"
                    handleRequestSort={handleRequestSort}
                  >
                    {t("table.column5")}
                  </TableSortCellWrapper>
                  <TableCell>{t("table.column6")}</TableCell>
                  <TableSortCellWrapper
                    orderBy={orderBy as keyof Task}
                    order={order as SortEnum}
                    column="status"
                    handleRequestSort={handleRequestSort}
                  >
                    {t("table.column3")}
                  </TableSortCellWrapper>
                </TableRow>
                {isFetchingNextPage && (
                  <TableRow>
                    <TableCellLoadingContainer colSpan={6}>
                      <LinearProgress />
                    </TableCellLoadingContainer>
                  </TableRow>
                )}
              </>
            )}
            itemContent={(index, task) => (
              <>
                <TableCell style={{ width: 100 }}>{task.id}</TableCell>
                <TableCell>{task.title}</TableCell>
                <TableCell>{task.assignee?.firstName}</TableCell>
                <TableCell>
                  {task.dueDate
                    ? new Date(task.dueDate).toLocaleDateString()
                    : ""}
                </TableCell>
                <TableCell>{task.description}</TableCell>
                <TableCell>{!!task && <TaskActions task={task} />}</TableCell>
              </>
            )}
          />
        </Grid>
      </Grid>
    </Container>
  );
}

export default withPageRequiredAuth(Tasks, {
  roles: [RoleEnum.ADMIN, RoleEnum.EMPLOYER, RoleEnum.EMPLOYEE],
});
