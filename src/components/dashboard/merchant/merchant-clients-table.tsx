"use client"

import React from "react"
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow, 
  Paper, 
  Button,
  TablePagination,
  Card 
} from "@mui/material"
import { useRouter } from 'next/navigation'

export interface MerchantClient {
  id: number
  name: string
  email?: string
  phone?: string | null
  float?: number | null
  ratings?: number | null
  status?: string
}

interface MerchantClientsTableProps {
  clients: MerchantClient[]
  onViewDetails: (clientId: number) => void
  count?: number
  page?: number
  rowsPerPage?: number
  onPageChange?: (event: unknown, newPage: number) => void
  onRowsPerPageChange?: (event: React.ChangeEvent<HTMLInputElement>) => void
}

export const MerchantClientsTable: React.FC<MerchantClientsTableProps> = ({ 
  clients, 
  onViewDetails,
  count = 0,
  page = 0,
  rowsPerPage = 10,
  onPageChange = () => {},
  onRowsPerPageChange = () => {}
}) => {
  return (
    <Card>
      <TableContainer component={Paper}>
        <Table sx={{ minWidth: 650 }} aria-label="merchant clients table">
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Name</TableCell>
              <TableCell>Phone</TableCell>
              <TableCell>Float</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {clients.map((client) => (
              <TableRow key={client.id} sx={{ "&:last-child td, &:last-child th": { border: 0 } }}>
                <TableCell>{client.id}</TableCell>
                <TableCell>{client.name}</TableCell>
                <TableCell>{client.phone || "N/A"}</TableCell>
                <TableCell>K{client.float || "0.00"}</TableCell>
                <TableCell>
                  {client.status || "N/A"}
                </TableCell>
                <TableCell>
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={() => onViewDetails(client.id)}
                  >
                    View Details
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      {count > 0 && (
        <TablePagination
          component="div"
          count={count}
          page={page}
          onPageChange={onPageChange}
          onRowsPerPageChange={onRowsPerPageChange}
          rowsPerPage={rowsPerPage}
          rowsPerPageOptions={[5, 10, 25]}
        />
      )}
    </Card>
  )
}