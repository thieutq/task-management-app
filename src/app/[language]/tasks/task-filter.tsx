"use client";

import { TaskStatusEnum } from "@/services/api/types/task";
import { useTranslation } from "@/services/i18n/client";
import Button from "@mui/material/Button";
import Container from "@mui/material/Container";
import Grid from "@mui/material/Grid";
import Popover from "@mui/material/Popover";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { TaskFilterType } from "./task-filter-types";
import {
  Employee,
  useGetEmployeesService,
} from "@/services/api/services/tasks";
import HTTP_CODES_ENUM from "@/services/api/types/http-codes";
import FormMultipleSelectInput from "@/components/form/multiple-select/form-multiple-select";

type TaskFilterFormData = TaskFilterType;

function TaskFilter() {
  const { t } = useTranslation("tasks");
  const router = useRouter();
  const searchParams = useSearchParams();

  const methods = useForm<TaskFilterFormData>({
    defaultValues: {
      assignees: [],
      statuses: [],
    },
  });

  const { handleSubmit, reset } = methods;

  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [employeesLoading, setEmployeesLoading] = useState(false);
  const [employeesError, setEmployeesError] = useState<string | null>(null);
  const getEmployees = useGetEmployeesService();

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const open = Boolean(anchorEl);
  const id = open ? "task-filter-popover" : undefined;

  useEffect(() => {
    const filter = searchParams.get("filter");
    if (filter) {
      handleClose();
      const filterParsed = JSON.parse(filter);
      reset(filterParsed);
    }
  }, [searchParams, reset]);

  useEffect(() => {
    setEmployeesLoading(true);
    setEmployeesError(null);
    getEmployees()
      .then((res) => {
        if (
          res.status === HTTP_CODES_ENUM.OK ||
          res.status === HTTP_CODES_ENUM.CREATED
        ) {
          setEmployees(res.data);
        } else {
          setEmployees([]);
          setEmployeesError("Failed to load employees");
        }
        setEmployeesLoading(false);
      })
      .catch((err) => {
        setEmployees([]);
        setEmployeesError(err?.message || "Failed to load employees");
        setEmployeesLoading(false);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const statusOptions = useMemo(
    () =>
      Object.entries(TaskStatusEnum).map(([key, value]) => ({
        key,
        value,
      })),
    []
  );

  return (
    <FormProvider {...methods}>
      <Popover
        id={id}
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "left",
        }}
      >
        <Container sx={{ minWidth: 300 }}>
          <form
            onSubmit={handleSubmit((data) => {
              const searchParams = new URLSearchParams(window.location.search);
              searchParams.set("filter", JSON.stringify(data));
              router.push(
                window.location.pathname + "?" + searchParams.toString()
              );
            })}
          >
            <Grid container spacing={2} mb={3} mt={3}>
              <Grid size={{ xs: 12 }}>
                {employeesLoading && (
                  <span>
                    {t("filter.loadingAssignees", {
                      defaultValue: "Loading employees...",
                    })}
                  </span>
                )}
                {employeesError && (
                  <span style={{ color: "red" }}>{employeesError}</span>
                )}
                <FormMultipleSelectInput<TaskFilterFormData, Employee>
                  name="assignees"
                  testId="assignees"
                  label={"Assignee"}
                  options={employees}
                  keyValue="id"
                  renderOption={(option) =>
                    `${option.firstName ?? ""} ${option.lastName ?? ""}`.trim()
                  }
                  renderValue={(values) =>
                    values.map((e) => `${e.firstName}(${e.id})`).join(", ")
                  }
                  disabled={employeesLoading || !!employeesError}
                />
              </Grid>
              <Grid size={{ xs: 12 }}>
                <FormMultipleSelectInput<
                  TaskFilterFormData,
                  { key: string; value: string }
                >
                  name="statuses"
                  testId="statuses"
                  label={t("table.column3")}
                  options={statusOptions}
                  keyValue="value"
                  renderOption={(option) => option.value}
                  renderValue={(values) =>
                    values.map((s) => s.value).join(", ")
                  }
                />
              </Grid>
              <Grid size={{ xs: 12 }}>
                <Button variant="contained" type="submit">
                  {t("filter.actions.apply")}
                </Button>
                <Button
                  variant="outlined"
                  color="inherit"
                  sx={{ ml: 1 }}
                  onClick={() => {
                    methods.reset({ assignees: [], statuses: [] });
                    const searchParams = new URLSearchParams(
                      window.location.search
                    );
                    searchParams.delete("filter");
                    router.push(
                      window.location.pathname +
                        (searchParams.toString()
                          ? "?" + searchParams.toString()
                          : "")
                    );
                    handleClose();
                  }}
                >
                  {t("tasks-create:actions.clear", { defaultValue: "Clear" })}
                </Button>
              </Grid>
            </Grid>
          </form>
        </Container>
      </Popover>
      <Button aria-describedby={id} variant="contained" onClick={handleClick}>
        {t("filter.actions.filter")}
      </Button>
    </FormProvider>
  );
}

export default TaskFilter;
