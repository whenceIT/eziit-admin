"use client";

import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Stack,
  TablePagination,
} from "@mui/material";
import { useRouter } from "next/navigation";

export interface Employer {
  id: number;
  user_id: number | null;
  name: string;
  email: string;
  phone: number;
  ratings: number | null;
}

interface EmployersTableProps {
  employers: Employer[];
  count: number;
  page: number;
  rowsPerPage: number;
  onPageChange: (event: unknown, newPage: number) => void;
  onRowsPerPageChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onViewDetails?: (employerId: number) => void;
}

export const EmployersTable: React.FC<EmployersTableProps> = ({
  employers,
  count,
  page,
  rowsPerPage,
  onPageChange,
  onRowsPerPageChange,
  onViewDetails,
}) => {
  const router = useRouter();

  const handleDetailsClick = (employerId: number) => {
    if (onViewDetails) {
      onViewDetails(employerId);
    } else {
      router.push(`/dashboard/employers/${employerId}`);
    }
  };

  return (
    <Paper>
      <TableContainer>
        <Table sx={{ minWidth: 650 }} aria-label="employers table">
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Name</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Phone</TableCell>
              <TableCell>Organization</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {employers.length > 0 ? (
              employers.map((employer) => (
                <TableRow 
                  key={employer.id}
                  sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
                >
                  <TableCell>{employer.id}</TableCell>
                  <TableCell>{employer.name}</TableCell>
                  <TableCell>{employer.email}</TableCell>
                  <TableCell>{employer.phone || "N/A"}</TableCell>
                  {/*<TableCell>{employer.organisation_name}</TableCell>*/}
                  <TableCell>
                    <Stack direction="row" spacing={1}>
                      <Button
                        variant="contained"
                        color="primary"
                        size="small"
                        onClick={() => handleDetailsClick(employer.id)}
                      >
                        View Details
                      </Button>
                    </Stack>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  No Employers Found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
      
      <TablePagination
        component="div"
        count={count}
        page={page}
        rowsPerPage={rowsPerPage}
        onPageChange={onPageChange}
        onRowsPerPageChange={onRowsPerPageChange}
        rowsPerPageOptions={[5, 10, 25]}
      />
    </Paper>
  );
};