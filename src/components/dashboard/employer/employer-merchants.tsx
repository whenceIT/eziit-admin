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
  Button 
} from "@mui/material"
//
export interface Merchant {
  id: number
  user_id: string | null
  merchant_code: string
  transactions: string | null
  stores: string | null
  ratings: number | null
  comments: string | null
  clients: string | null
  employers: string | null
  status: string
  underwriter_status: string
  underwriter_id: string | null
  name: string
  email: string
  phone: string | null
  float?: number | null
  
}

interface EmployerMerchantsTableProps {
  merchants: Merchant[]
  onViewDetails: (merchantId: number) => void
  count?: number;
    page: number;
    rowsPerPage: number;
    onPageChange: (event: unknown, newPage: number) => void;
    onRowsPerPageChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

export const EmployerMerchantsTable: React.FC<EmployerMerchantsTableProps> = ({ 
  merchants, 
  onViewDetails,
  count = 0,
  page = 0,
  rowsPerPage = 10,
  onPageChange = () => {},
  onRowsPerPageChange = () => {} 
}) => {
  return (
    <TableContainer component={Paper}>
      <Table sx={{ minWidth: 650 }} aria-label="employer merchants table">
        <TableHead>
          <TableRow>
            <TableCell>Name</TableCell>
            <TableCell>Email</TableCell>
            <TableCell>Phone</TableCell>
            <TableCell>Merchant Code</TableCell>
            <TableCell>Status</TableCell>
            <TableCell>Float</TableCell>
            <TableCell>Action</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {merchants.map((merchant) => (
            <TableRow key={merchant.id} sx={{ "&:last-child td, &:last-child th": { border: 0 } }}>
              <TableCell component="th" scope="row">
                {merchant.name}
              </TableCell>
              <TableCell>{merchant.email}</TableCell>
              <TableCell>{merchant.phone || 'N/A'}</TableCell>
              <TableCell>{merchant.merchant_code}</TableCell>
              <TableCell>
                <Chip 
                  label={merchant.status} 
                  color={
                    merchant.status === 'active' ? 'success' : 
                    merchant.status === 'pending' ? 'warning' : 'default'
                  } 
                />
              </TableCell>
              <TableCell>{merchant.float?.toLocaleString() || '0'}</TableCell>
              <TableCell>
                <Button 
                  variant="outlined" 
                  size="small"
                  onClick={() => onViewDetails(merchant.id)}
                >
                  View Details
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  )
}//