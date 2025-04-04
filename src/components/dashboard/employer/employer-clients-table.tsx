"use client"

import type React from "react"
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow, 
  Paper, 
  Chip,
  TablePagination 
} from "@mui/material"

export interface Client {
  id: number
  user_id: string | null
  name: string
  float: number | null
  ratings: number | null
  phone: number | null
}

interface EmployerClientsTableProps {
  clients: Client[]
  count: number
  page: number
  rowsPerPage: number
  onPageChange: (event: unknown, newPage: number) => void
  onRowsPerPageChange: (event: React.ChangeEvent<HTMLInputElement>) => void
}

export const EmployerClientsTable: React.FC<EmployerClientsTableProps> = ({ 
  clients,
  count,
  page,
  rowsPerPage,
  onPageChange,
  onRowsPerPageChange
}) => {
  return (
    <>
      <TableContainer component={Paper}>
        <Table sx={{ minWidth: 650 }} aria-label="employer clients table">
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Float</TableCell>
              <TableCell>Ratings</TableCell>
              <TableCell>Phone</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {clients.map((client) => (
              <TableRow key={client.id} sx={{ "&:last-child td, &:last-child th": { border: 0 } }}>
                <TableCell component="th" scope="row">
                  {client.name}
                </TableCell>
                <TableCell>{client.float}</TableCell>
                <TableCell>{client.ratings}</TableCell>
                <TableCell>{client.phone}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
        rowsPerPageOptions={[5, 10, 25]}
        component="div"
        count={count}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={onPageChange}
        onRowsPerPageChange={onRowsPerPageChange}
      />
    </>
  )
}