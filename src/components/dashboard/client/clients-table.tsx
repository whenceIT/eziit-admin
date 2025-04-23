"use client";

import * as React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TablePagination,
  TableRow,
  TableContainer,
  Paper,
  TextField,
  Box,
  Chip
} from "@mui/material";

export interface Client {
  id: number;
  requester_first_name: string;
  requester_last_name: string;
  requester_type: string;
  recipient_first_name: string;
  recipient_last_name: string;
  recipient_type: string;
  relationship_type: string;
  status: string;
}

interface ClientsTableProps {
  count?: number;
  rows: Client[];
  page: number;
  rowsPerPage: number;
  onPageChange: (event: unknown, newPage: number) => void;
  onRowsPerPageChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

export const ClientsTable: React.FC<ClientsTableProps> = ({
  count = 0,
  rows,
  page,
  rowsPerPage,
  onPageChange,
  onRowsPerPageChange
}) => {
  const [searchTerm, setSearchTerm] = React.useState("");

  const filteredRows = React.useMemo(() => {
    if (!searchTerm.trim()) return rows;

    const term = searchTerm.toLowerCase().trim();
    return rows.filter((client) => {
      const searchString = [
        client.id.toString(),
        client.requester_first_name,
        client.requester_last_name,
        client.requester_type,
        client.recipient_first_name,
        client.recipient_last_name,
        client.recipient_type,
        client.relationship_type,
        client.status
      ].join(" ").toLowerCase();

      return searchString.includes(term);
    });
  }, [rows, searchTerm]);

  return (
    <Paper sx={{ overflow: "hidden" }}>
      <Box sx={{ p: 2 }}>
        <TextField
          fullWidth
          variant="outlined"
          label="Search"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search clients..."
          sx={{ mb: 2 }}
        />
      </Box>

      <TableContainer>
        <Table stickyHeader>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Requester Name</TableCell>
              <TableCell>Requester Type</TableCell>
              <TableCell>Recipient Name</TableCell>
              <TableCell>Recipient Type</TableCell>
              <TableCell>Relationship Type</TableCell>
              <TableCell>Status</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredRows.length > 0 ? (
              filteredRows
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((client) => (
                  <TableRow hover key={client.id}>
                    <TableCell>{client.id}</TableCell>
                    <TableCell>
                      {`${client.requester_first_name} ${client.requester_last_name}`}
                    </TableCell>
                    <TableCell>{client.requester_type}</TableCell>
                    <TableCell>
                      {`${client.recipient_first_name} ${client.recipient_last_name}`}
                    </TableCell>
                    <TableCell>{client.recipient_type}</TableCell>
                    <TableCell>{client.relationship_type}</TableCell>
                    <TableCell>
                      <Chip
                      label={client.status}
                      color={
                        client.status === "approved" ? "success":
                        client.status === "pending" ? "warning": "error"
                      }
                      />
                      </TableCell>
                  </TableRow>
                ))
            ) : (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  No matching records found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <TablePagination
        rowsPerPageOptions={[5, 10, 25]}
        component="div"
        count={filteredRows.length}
        page={page}
        rowsPerPage={rowsPerPage}
        onPageChange={onPageChange}
        onRowsPerPageChange={onRowsPerPageChange}
      />
    </Paper>
  );
};