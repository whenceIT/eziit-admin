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

export interface Employer {
  id: number;
  user_id: number;
  transactions: string;
  merchants: string;
  employees: string;
  status: string;
}

interface EmployersTableProps {
  count: number;
  items: Employer[];
  onPageChange: (event: unknown, newPage: number) => void;
  onRowsPerPageChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  page: number;
  rowsPerPage: number;
}

export const EmployersTable: React.FC<EmployersTableProps> = ({
  count,
  items,
  onPageChange,
  onRowsPerPageChange,
  page,
  rowsPerPage,
}) => {
  const router = useRouter();

  const getStatusColor = (status: string) => {
    if (!status) return "default"
    switch (status.toLowerCase()) {
      case 'active':
        return 'success';
      case 'pending':
        return 'warning';
      case 'declined':
        return 'error';
      default:
        return 'default';
    }
  };

  const handleDetailsClick = (employerId: number) => {
    router.push(`/dashboard/employers/${employerId}`);
  };

  return (
    <Card>
      <TableContainer component={Paper}>
        <Table sx={{ minWidth: 800 }} aria-label="employers table">
          <TableHead>
            <TableRow>
              <TableCell>Id</TableCell>
              <TableCell>User Id</TableCell>
              <TableCell>Employees</TableCell>
              
              <TableCell>Merchants</TableCell>
              <TableCell>Transactions</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {items.map((employer) => (
              <TableRow hover key={employer.id}>
                <TableCell>{employer.id}</TableCell>
                <TableCell>{employer.user_id}</TableCell>

                <TableCell>{employer.employees}</TableCell>
                <TableCell>{employer.merchants}</TableCell>
                <TableCell>{employer.transactions}</TableCell>
                <TableCell>
                  <Chip
                    label={employer.status}
                    color={getStatusColor(employer.status)}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  <Button
                    variant="contained"
                    color="primary"
                    size="small"
                    onClick={() => handleDetailsClick(employer.id)}
                  >
                    Details
                  </Button>
                </TableCell>
              </TableRow>
            ))}
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

