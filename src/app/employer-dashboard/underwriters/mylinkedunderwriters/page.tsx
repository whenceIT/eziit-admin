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
  Stack,
  TablePagination,
} from "@mui/material"
import { useRouter } from "next/navigation"

export interface Underwriter {
  id: number
  user_id: string | null
  name: string
  organisation_name: string
  email: string
  phone?: string | null
  float?: number | null
  ratings?: number | null
  status?: string
}

interface UnderwriterTableProps {
  underwriters?: Underwriter[]
  count: number
  page: number
  rowsPerPage: number
  onPageChange: (event: unknown, newPage: number) => void
  onRowsPerPageChange: (event: React.ChangeEvent<HTMLInputElement>) => void
}

const UnderwriterTable: React.FC<UnderwriterTableProps> = ({
  underwriters = [],
  count,
  page,
  rowsPerPage,
  onPageChange,
  onRowsPerPageChange,
}) => {
  const router = useRouter()

  const handleDetailsClick = (underwriterId: number) => {
    router.push(`/employer-dashboard/underwriters/${underwriterId}`)
  }

  return (
    <Paper>
      <TableContainer>
        <Table sx={{ minWidth: 650 }} aria-label="underwriter table">
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Name</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Phone</TableCell>
              <TableCell>Organisation</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {underwriters.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  No Underwriters Found
                </TableCell>
              </TableRow>
            ) : (
              underwriters.map((underwriter) => (
                <TableRow key={underwriter.id}>
                  <TableCell>{underwriter.id}</TableCell>
                  <TableCell>{underwriter.name}</TableCell>
                  <TableCell>{underwriter.email}</TableCell>
                  <TableCell>{underwriter.phone || "N/A"}</TableCell>
                  <TableCell>{underwriter.organisation_name || "N/A"}</TableCell>
                  <TableCell>{underwriter.status || "N/A"}</TableCell>
                  <TableCell>
                    <Stack direction="row" spacing={1}>
                      <Button 
                        variant="contained" 
                        color="primary" 
                        size="small" 
                        onClick={() => handleDetailsClick(underwriter.id)}
                      >
                        View Details
                      </Button>
                    </Stack>
                  </TableCell>
                </TableRow>
              ))
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
  )
}

// Export the component as default for the page
export default function Page() {
  // You'll need to provide the actual props here or fetch them
  return (
    <UnderwriterTable 
      underwriters={[]}
      count={0}
      page={0}
      rowsPerPage={10}
      onPageChange={() => {}}
      onRowsPerPageChange={() => {}}
    />
  )
}