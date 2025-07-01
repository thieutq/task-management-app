"use client";

import { RoleEnum } from "@/services/api/types/role";
import { useGetTaskSummaryService } from "@/services/api/services/tasks";
import withPageRequiredAuth from "@/services/auth/with-page-required-auth";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import CircularProgress from "@mui/material/CircularProgress";
import Alert from "@mui/material/Alert";
import { useEffect, useState } from "react";
import { TaskSummary } from "@/services/api/types/task";
import { useTheme } from "@mui/material/styles";
import HTTP_CODES_ENUM from "@/services/api/types/http-codes";
import { ValidationErrors } from "@/services/api/types/validation-errors";

function SummaryTasks() {
  const getSummary = useGetTaskSummaryService();
  const [data, setData] = useState<TaskSummary[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const theme = useTheme();

  useEffect(() => {
    setLoading(true);
    setError(null);
    getSummary()
      .then((res) => {
        if (
          res.status === HTTP_CODES_ENUM.OK ||
          res.status === HTTP_CODES_ENUM.CREATED
        ) {
          setData(res.data as unknown as TaskSummary[]);
        } else if (res.status === HTTP_CODES_ENUM.NO_CONTENT) {
          setData([]);
        } else if (res.status === HTTP_CODES_ENUM.UNPROCESSABLE_ENTITY) {
          setError(
            (res as ValidationErrors).data?.errors?.toString() ||
              "Validation error"
          );
        } else {
          setError("Failed to load summary");
        }
        setLoading(false);
      })
      .catch((err) => {
        setError(err?.message || "Failed to load summary");
        setLoading(false);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>
        Employee Task Summary
      </Typography>
      {loading && (
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            margin: theme.spacing(4),
          }}
        >
          <CircularProgress />
        </div>
      )}
      {error && <Alert severity="error">{error}</Alert>}
      {!loading && !error && data && data.length === 0 && (
        <Alert severity="info">No employee task summary available.</Alert>
      )}
      {!loading && !error && data && data.length > 0 && (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Employee</TableCell>
                <TableCell align="right">Total Tasks</TableCell>
                <TableCell align="right">Completed Tasks</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {data.map((row, index) => (
                <TableRow key={row.id ?? index}>
                  <TableCell>{row.firstName}</TableCell>
                  <TableCell align="right">{row.totalTasks}</TableCell>
                  <TableCell align="right">{row.completedTasks}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Container>
  );
}

export default withPageRequiredAuth(SummaryTasks, {
  roles: [RoleEnum.ADMIN, RoleEnum.EMPLOYER, RoleEnum.EMPLOYEE],
});
