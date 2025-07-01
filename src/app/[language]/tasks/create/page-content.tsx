"use client";

import { RoleEnum } from "@/services/api/types/role";
import Button from "@mui/material/Button";
import { useForm, FormProvider, useFormState, useWatch } from "react-hook-form";
import Container from "@mui/material/Container";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import FormTextInput from "@/components/form/text-input/form-text-input";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import withPageRequiredAuth from "@/services/auth/with-page-required-auth";
import { useSnackbar } from "@/hooks/use-snackbar";
import Link from "@/components/link";
import Box from "@mui/material/Box";
import { useTranslation } from "@/services/i18n/client";
import { useRouter } from "next/navigation";
import {
  usePostTaskService,
  useGetEmployeesService,
  type Employee,
} from "@/services/api/services/tasks";
import { useMemo } from "react";
import { useEffect, useState } from "react";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";

type CreateFormData = {
  title: string;
  description: string;
  assigneeId: string;
  dueDate: string;
};

const useValidationSchema = () => {
  const { t } = useTranslation("tasks-create");
  return yup.object().shape({
    title: yup.string().required(t("inputs.title.validation.required")),
    description: yup.string().required(t("inputs.description.label")),
    assigneeId: yup.string().required(t("inputs.assignee.validation.required")),
    dueDate: yup.string().required(t("inputs.dueDate.label")),
  });
};

function CreateTaskFormActions() {
  const { t } = useTranslation("tasks-create");
  const { isSubmitting } = useFormState();
  // useLeavePage(isDirty); // Uncomment if you want leave page protection
  return (
    <Button
      variant="contained"
      color="primary"
      type="submit"
      disabled={isSubmitting}
    >
      {t("actions.submit")}
    </Button>
  );
}

type EmployeeSelectProps = {
  methods: ReturnType<typeof useForm<CreateFormData>>;
  employeeOptions: Employee[];
  t: (key: string) => string;
};

function EmployeeSelect({ methods, employeeOptions, t }: EmployeeSelectProps) {
  const assigneeIdValue = useWatch({
    control: methods.control,
    name: "assigneeId",
  });
  return (
    <FormControl fullWidth error={!!methods.formState.errors.assigneeId}>
      <InputLabel id="assignee-label">{t("inputs.assignee.label")}</InputLabel>
      <Select
        labelId="assignee-label"
        id="assignee-select"
        label={t("inputs.assignee.label")}
        value={assigneeIdValue}
        onChange={(e) => methods.setValue("assigneeId", e.target.value)}
        onBlur={() => methods.trigger("assigneeId")}
        data-testid="assigneeId"
        name="assigneeId"
        inputRef={methods.register("assigneeId").ref}
      >
        {employeeOptions.map((option) => (
          <MenuItem key={option.id} value={option.id.toString()}>
            {option.firstName} {option.lastName}
          </MenuItem>
        ))}
      </Select>
      {methods.formState.errors.assigneeId && (
        <Box color="error.main" mt={0.5} fontSize={13}>
          {methods.formState.errors.assigneeId.message as string}
        </Box>
      )}
    </FormControl>
  );
}

function FormCreateTask() {
  const router = useRouter();
  const { enqueueSnackbar } = useSnackbar();
  const { t } = useTranslation("tasks-create");
  const validationSchema = useValidationSchema();
  const postTask = usePostTaskService();
  const fetchEmployees = useGetEmployeesService();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const methods = useForm<CreateFormData>({
    resolver: yupResolver(validationSchema),
    defaultValues: {
      title: "",
      description: "",
      assigneeId: "",
      dueDate: (() => {
        const date = new Date();
        date.setFullYear(date.getFullYear() + 1);
        return date.toISOString().slice(0, 10);
      })(),
    },
  });
  const { handleSubmit, setError } = methods;

  const onSubmit = handleSubmit(async (formData) => {
    const { data, status } = await postTask({
      title: formData.title,
      description: formData.description,
      assigneeId: Number(formData.assigneeId),
      dueDate: formData.dueDate ? new Date(formData.dueDate) : undefined,
    });
    if (status === 422 && data?.errors) {
      Object.keys(data.errors).forEach((key) => {
        setError(key as keyof CreateFormData, {
          type: "manual",
          message: t("alerts.task.error"),
        });
      });
      return;
    }
    if (status === 201) {
      enqueueSnackbar(t("alerts.task.success"), { variant: "success" });
      router.push("/tasks");
    } else {
      setError("title", { type: "manual", message: t("alerts.task.error") });
    }
  });

  useEffect(() => {
    (async () => {
      const { status, data } = await fetchEmployees();
      if (status === 200 && data) {
        setEmployees(data);
      }
    })();
  }, [fetchEmployees]);

  const employeeOptions = useMemo(() => employees, [employees]);

  return (
    <FormProvider {...methods}>
      <Container maxWidth="xs">
        <form onSubmit={onSubmit} autoComplete="create-new-task">
          <Grid container spacing={2} mb={3} mt={3}>
            <Grid size={{ xs: 12 }}>
              <Typography variant="h6">{t("title")}</Typography>
            </Grid>
            <Grid size={{ xs: 12 }}>
              <FormTextInput<CreateFormData>
                name="title"
                testId="task-title"
                label={t("inputs.title.label")}
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <FormTextInput<CreateFormData>
                name="description"
                testId="task-description"
                label={t("inputs.description.label")}
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <EmployeeSelect
                methods={methods}
                employeeOptions={employeeOptions}
                t={t}
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <FormTextInput<CreateFormData>
                name="dueDate"
                testId="task-due-date"
                label={t("inputs.dueDate.label")}
                type="date"
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <CreateTaskFormActions />
              <Box ml={1} component="span">
                <Button
                  variant="contained"
                  color="inherit"
                  LinkComponent={Link}
                  href="/tasks"
                >
                  {t("actions.cancel")}
                </Button>
              </Box>
            </Grid>
          </Grid>
        </form>
      </Container>
    </FormProvider>
  );
}

function CreateTask() {
  return <FormCreateTask />;
}

export default withPageRequiredAuth(CreateTask, {
  roles: [RoleEnum.ADMIN, RoleEnum.EMPLOYER, RoleEnum.EMPLOYEE],
});
