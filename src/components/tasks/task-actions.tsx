import { useState, useRef } from "react";
import Button from "@mui/material/Button";
import ButtonGroup from "@mui/material/ButtonGroup";
import Popper from "@mui/material/Popper";
import Grow from "@mui/material/Grow";
import Paper from "@mui/material/Paper";
import ClickAwayListener from "@mui/material/ClickAwayListener";
import MenuList from "@mui/material/MenuList";
import MenuItem from "@mui/material/MenuItem";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import { Task, TaskStatusEnum } from "@/services/api/types/task";
import { usePatchTaskStatusService } from "@/services/api/services/tasks";
import { useSnackbar } from "@/hooks/use-snackbar";
import { useQueryClient } from "@tanstack/react-query";
import { tasksQueryKeys } from "@/app/[language]/tasks/queries/queries";
import { useTranslation } from "@/services/i18n/client";
import { useUserRole } from "@/hooks/use-user-role";

function TaskActions({ task }: { task: Task }) {
  const [open, setOpen] = useState(false);
  const anchorRef = useRef<HTMLDivElement>(null);
  const patchTaskStatus = usePatchTaskStatusService();
  const { enqueueSnackbar } = useSnackbar();
  const queryClient = useQueryClient();
  const { t } = useTranslation("tasks");
  const { user } = useUserRole();
  const canUpdate = user?.id === task.assignee?.id;

  const handleToggle = () => {
    setOpen((prevOpen) => !prevOpen);
  };

  const handleClose = (event: Event) => {
    if (
      anchorRef.current &&
      anchorRef.current.contains(event.target as HTMLElement)
    ) {
      return;
    }
    setOpen(false);
  };

  const handleStatusChange = async (status: TaskStatusEnum) => {
    setOpen(false);
    if (status === task.status) return;
    const { status: responseStatus } = await patchTaskStatus({
      id: task.id,
      data: { status },
    });
    if (responseStatus === 200 || responseStatus === 201) {
      enqueueSnackbar(
        t("statusUpdateSuccess", { defaultValue: "Status updated!" }),
        { variant: "success" }
      );
      queryClient.invalidateQueries({ queryKey: tasksQueryKeys.list().key });
    } else {
      enqueueSnackbar(
        t("statusUpdateError", { defaultValue: "Failed to update status." }),
        { variant: "error" }
      );
    }
  };

  return (
    <div ref={anchorRef} style={{ display: "inline-block" }}>
      <ButtonGroup
        variant="contained"
        ref={anchorRef}
        aria-label="split button"
        size="small"
      >
        <Button color="info">{task.status}</Button>
        {!!canUpdate && (
          <Button
            size="small"
            aria-controls={open ? "split-button-menu" : undefined}
            aria-expanded={open ? "true" : undefined}
            aria-label="select status"
            aria-haspopup="menu"
            onClick={handleToggle}
          >
            <ArrowDropDownIcon />
          </Button>
        )}
      </ButtonGroup>
      <Popper
        sx={{ zIndex: 1 }}
        open={open}
        anchorEl={anchorRef.current}
        role={undefined}
        transition
        disablePortal
      >
        {({ TransitionProps, placement }) => (
          <Grow
            {...TransitionProps}
            style={{
              transformOrigin:
                placement === "bottom" ? "center top" : "center bottom",
            }}
          >
            <Paper>
              <ClickAwayListener onClickAway={handleClose}>
                <MenuList id="split-button-menu" autoFocusItem>
                  {Object.values(TaskStatusEnum).map((status) => (
                    <MenuItem
                      key={status}
                      selected={status === task.status}
                      onClick={() => handleStatusChange(status)}
                    >
                      {status}
                    </MenuItem>
                  ))}
                </MenuList>
              </ClickAwayListener>
            </Paper>
          </Grow>
        )}
      </Popper>
    </div>
  );
}

export default TaskActions;
