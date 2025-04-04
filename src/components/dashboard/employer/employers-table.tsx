import React from 'react';
import {
  Box,
  Card,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  Paper,
  Chip,
  Button,
} from '@mui/material';
import { useRouter } from 'next/navigation';
//
export interface Employer {
  id: number;
  name: string;
  email: string;
  phone: string;
  float: number;
  ratings: number;
}

interface EmployersTableProps {
  count: number;
  items: Employer[];
  onPageChange: (event: unknown, newPage: number) => void;
  onRowsPerPageChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  page: number;
  rowsPerPage: number;
}
//
export const EmployersTable: React.FC<EmployersTableProps> = ({
  count,
  items,
  onPageChange,
  onRowsPerPageChange,
  page,
  rowsPerPage,
}) => {
  const router = useRouter();

  const handleDetailsClick = (employerId: number) => {
    router.push(`/dashboard/employers/${employerId}`);
  };

  return (
    <Card>
      <TableContainer component={Paper}>
        <Table sx={{ minWidth: 800 }} aria-label="employers table">
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Name</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Phone</TableCell>
              <TableCell>Float</TableCell>
              <TableCell>Ratings</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {Array.isArray(items) ? (
              items.map((employer) => (
                <TableRow hover key={employer.id}>
                  <TableCell>{employer.id}</TableCell>
                  <TableCell>{employer.name}</TableCell>
                  <TableCell>{employer.email}</TableCell>
                  <TableCell>{employer.phone}</TableCell>
                  <TableCell>{employer.float}</TableCell>
                  <TableCell>{employer.ratings}</TableCell>
                  <TableCell>
                    <Button
                      variant="contained"
                      color="primary"
                      size="small"
                      onClick={() => handleDetailsClick(employer.id)}
                    >
                      View Details 
                    </Button>
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
        onPageChange={onPageChange}
        onRowsPerPageChange={onRowsPerPageChange}
        page={page}
        rowsPerPage={rowsPerPage}
        rowsPerPageOptions={[5, 10, 25]}
      />
    </Card>
  );
};