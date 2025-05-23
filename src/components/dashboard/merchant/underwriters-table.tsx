"use client";
//

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

export interface Underwriter {
  id: number;
  name: string;
  organisation_name: string; 
  email: string;
  phone?: string | null; 
  //user_type: string;
  
}

interface UnderwritersTableProps {
  underwriters: Underwriter[];
  onViewDetails: (id: number) => void;
  count: number;
  page: number;
  rowsPerPage: number;
  onPageChange: (event: unknown, newPage: number) => void;
  onRowsPerPageChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
}


export const UnderwritersTable: React.FC<UnderwritersTableProps> = ({
  underwriters,
  onViewDetails,
  count,
  page,
  rowsPerPage,
  onPageChange,
  onRowsPerPageChange,
}) => {
  {/*const router = useRouter();

  const handleDetailsClick = (underwriterId: number) => { 
    router.push(`/merchant-dashboard/underwriters/${underwriterId}`);
  };*/}

  return (
    <Paper>
      <TableContainer>
        <Table sx={{ minWidth: 650 }} aria-label="underwriters table">
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Name</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Phone</TableCell>
              <TableCell>Organisation</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {underwriters.length > 0 ? (
              underwriters.map((underwriter) => (
                <TableRow key={underwriter.id} sx={{ "&:last-child td, &:last-child th": { border: 0 } }}>
                  <TableCell>{underwriter.id}</TableCell>
                  <TableCell>{underwriter.name}</TableCell>
                  <TableCell>{underwriter.email}</TableCell>
                  <TableCell>{underwriter.phone ?? "N/A"}</TableCell>
                  <TableCell>{underwriter.organisation_name ?? "N/A"}</TableCell>
                  <TableCell>
                    <Stack direction="row" spacing={1}>
                      <Button 
                        variant="contained" 
                        color="primary" 
                        size="small"
                        onClick={() => onViewDetails(underwriter.id)}
                      >
                        View Details
                      </Button>
                    </Stack>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  No Underwriters Found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Table Pagination should be outside TableContainer */}
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
 