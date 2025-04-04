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
  Button,
  TablePagination
} from "@mui/material"
import { useRouter } from 'next/navigation'

export interface Client {
  id: number
  user_id: number | null
  name: string
  float: number | null
  ratings: number | null
  phone: number | null
  //status: "approved" | "pending" | "declined"
}

interface ClientsTableProps {
  clients: Client[]
  onViewDetails: (clientId: number) => void
  count?: number
  page?: number
  rowsPerPage?: number
  onPageChange?: (event: unknown, newPage: number) => void
  onRowsPerPageChange?: (event: React.ChangeEvent<HTMLInputElement>) => void
}

export const ClientsTable: React.FC<ClientsTableProps> = ({ 
  clients,
  onViewDetails,
  count = 0,
  page = 0,
  rowsPerPage = 10,
  onPageChange = () => {},
  onRowsPerPageChange = () => {}
}) => {
  return (
    <Paper>
      <TableContainer>
        <Table sx={{ minWidth: 650 }} aria-label="clients table">
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Name</TableCell>
              <TableCell>Float</TableCell>
              <TableCell>Ratings</TableCell>
              <TableCell>Phone</TableCell>
              <TableCell>Action</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {clients.map((client) => (
              <TableRow key={client.id} sx={{ "&:last-child td, &:last-child th": { border: 0 } }}>
                <TableCell>{client.id}</TableCell>
                <TableCell>{client.name}</TableCell>
                <TableCell>{client.float}</TableCell>
                <TableCell>{client.ratings}</TableCell>
                <TableCell>{client.phone}</TableCell>
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
    </Paper>
  )
}