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
} from '@mui/material';

export interface Merchant {
  id: number;
  user_id: number;
  merchant_code: string;
  transactions: string;
  stores: string;
  ratings: string;
  comments: string;
  clients: string;
  employers: string;
  status: string;
}

interface MerchantsTableProps {
  count: number;
  items: Merchant[];
  onPageChange: (event: unknown, newPage: number) => void;
  onRowsPerPageChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  page: number;
  rowsPerPage: number;
}

export const MerchantsTable: React.FC<MerchantsTableProps> = ({
  count,
  items,
  onPageChange,
  onRowsPerPageChange,
  page,
  rowsPerPage,
}) => {
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
        return 'success';
      case 'pending':
        return 'warning';
      default:
        return 'default';
    }
  };

  return (
    <Card>
      <TableContainer component={Paper}>
        <Table sx={{ minWidth: 800 }} aria-label="merchants table">
          <TableHead>
            <TableRow>
              <TableCell>Merchant Code</TableCell>
              <TableCell>Transactions</TableCell>
              <TableCell>Stores</TableCell>
              <TableCell>Ratings</TableCell>
              <TableCell>Comments</TableCell>
              <TableCell>Clients</TableCell>
              <TableCell>Employers</TableCell>
              <TableCell>Status</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {items.map((merchant) => (
              <TableRow hover key={merchant.id}>
                <TableCell>{merchant.merchant_code}</TableCell>
                <TableCell>{merchant.transactions}</TableCell>
                <TableCell>{merchant.stores}</TableCell>
                <TableCell>{merchant.ratings}</TableCell>
                <TableCell>{merchant.comments}</TableCell>
                <TableCell>{merchant.clients}</TableCell>
                <TableCell>{merchant.employers}</TableCell>
                <TableCell>
                  <Chip
                    label={merchant.status}
                    color={getStatusColor(merchant.status)}
                    size="small"
                  />
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