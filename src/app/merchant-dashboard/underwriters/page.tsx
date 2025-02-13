"use client"

import * as React from "react"
import Grid from "@mui/material/Unstable_Grid2"
import Typography from "@mui/material/Typography"
import Paper from "@mui/material/Paper"
import Table from "@mui/material/Table"
import TableBody from "@mui/material/TableBody"
import TableCell from "@mui/material/TableCell"
import TableContainer from "@mui/material/TableContainer"
import TableHead from "@mui/material/TableHead"
import TablePagination from "@mui/material/TablePagination"
import TableRow from "@mui/material/TableRow"
import CircularProgress from "@mui/material/CircularProgress"
import Alert from "@mui/material/Alert"

import { useUser } from "@/hooks/use-user"

interface Column {
  id: "id" | "name" | "company" | "assignedClients" | "status"
  label: string
  minWidth?: number
  align?: "right"
}

const columns: Column[] = [
  { id: "id", label: "Underwriter ID", minWidth: 100 },
  { id: "name", label: "Name", minWidth: 170 },
  { id: "company", label: "Company", minWidth: 170 },
  { id: "assignedClients", label: "Assigned Clients", minWidth: 100, align: "right" },
  { id: "status", label: "Status", minWidth: 100 },
]

export default function MerchantUnderwriters(): React.JSX.Element {
  const [underwriters, setUnderwriters] = React.useState([])
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)
  const [page, setPage] = React.useState(0)
  const [rowsPerPage, setRowsPerPage] = React.useState(10)
  const { user } = useUser()

  React.useEffect(() => {
    if (user) {
      fetch(`https://api.example.com/underwriters?merchantId=${user.id}`)
        .then((response) => {
          if (!response.ok) {
            throw new Error("Failed to fetch underwriters")
          }
          return response.json()
        })
        .then((data) => {
          setUnderwriters(data)
          setLoading(false)
        })
        .catch((err) => {
          console.error("Error fetching underwriters:", err)
          setError("Failed to load underwriters. Please try again later.")
          setLoading(false)
        })
    }
  }, [user])

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage)
  }

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(+event.target.value)
    setPage(0)
  }

  if (loading) {
    return <CircularProgress />
  }

  if (error) {
    return <Alert severity="error">{error}</Alert>
  }

  return (
    <Grid container spacing={3}>
      <Grid xs={12}>
        <Typography variant="h4" gutterBottom>
          Underwriters
        </Typography>
        <Paper sx={{ width: "100%", overflow: "hidden" }}>
          <TableContainer sx={{ maxHeight: 440 }}>
            <Table stickyHeader aria-label="sticky table">
              <TableHead>
                <TableRow>
                  {columns.map((column) => (
                    <TableCell key={column.id} align={column.align} style={{ minWidth: column.minWidth }}>
                      {column.label}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {underwriters.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((underwriter) => {
                  return (
                    <TableRow hover role="checkbox" tabIndex={-1} key={underwriter.id}>
                      {columns.map((column) => {
                        const value = underwriter[column.id]
                        return (
                          <TableCell key={column.id} align={column.align}>
                            {value}
                          </TableCell>
                        )
                      })}
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination
            rowsPerPageOptions={[10, 25, 100]}
            component="div"
            count={underwriters.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        </Paper>
      </Grid>
    </Grid>
  )
}

