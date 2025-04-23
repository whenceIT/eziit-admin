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
  TextField,
} from '@mui/material';
import { useRouter } from 'next/navigation';

export interface Employer {
  id: string;
  requester_first_name: string;
  requester_last_name: string;
  requester_type: string;
  recipient_first_name: string;
  recipient_last_name: string;
  recipient_type: string;
  relationship_type: string;
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
  const [searchTerm, setSearchTerm] = React.useState('');

  const filteredItems = React.useMemo(() => {
    if (!searchTerm.trim()) return items;

    const term = searchTerm.toLowerCase().trim();
    return items.filter((employer) => {
      const searchString = [
        employer.id,
        employer.requester_first_name,
        employer.requester_last_name,
        employer.requester_type,
        employer.recipient_first_name,
        employer.recipient_last_name,
        employer.recipient_type,
        employer.relationship_type,
        employer.status,
      ].join(' ').toLowerCase();

      return searchString.includes(term);
    });
  }, [items, searchTerm]);

  return (
    <Card>
      <Box sx={{ p: 2 }}>
        <TextField
          fullWidth
          variant="outlined"
          label="Search"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search by any field..."
          sx={{ mb: 2 }}
        />
      </Box>
      
      <TableContainer component={Paper}>
        <Table sx={{ minWidth: 800 }} aria-label="employers table">
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Requester</TableCell>
              <TableCell>Requester Type</TableCell>
              <TableCell>Recipient</TableCell>
              <TableCell>Recipient Type</TableCell>
              <TableCell>Relationship Type</TableCell>
              <TableCell>Status</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredItems.length > 0 ? (
              filteredItems
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((employer) => (
                  <TableRow hover key={employer.id}>
                    <TableCell>{employer.id}</TableCell>
                    <TableCell>{`${employer.requester_first_name} ${employer.requester_last_name}`}</TableCell>
                    <TableCell>{employer.requester_type}</TableCell>
                    <TableCell>{`${employer.recipient_first_name} ${employer.recipient_last_name}`}</TableCell>
                    <TableCell>{employer.recipient_type}</TableCell>
                    <TableCell>{employer.relationship_type}</TableCell>
                    <TableCell>
                      <Chip 
                        label={employer.status} 
                        color={
                          employer.status === 'approved' ? 'success' : 
                          employer.status === 'pending' ? 'warning' : 'error'
                        } 
                      />
                    </TableCell>
                  </TableRow>
                ))
            ) : (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  No matching employers found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
        component="div"
        count={filteredItems.length}
        onPageChange={onPageChange}
        onRowsPerPageChange={onRowsPerPageChange}
        page={page}
        rowsPerPage={rowsPerPage}
        rowsPerPageOptions={[5, 10, 25]}
      />
    </Card>
  );
};