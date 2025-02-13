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
  id: "id" | "date" | "clientName" | "amount" | "status"
  label: string
  minWidth?: number
  align?: "right"
  format?: (value: number) => string
}

const columns: Column[] = [
  { id: "id", label: "Transaction ID", minWidth: 100 },
  { id: "date", label: "Date", minWidth: 100 },
  { id: "clientName", label: "Client Name", minWidth: 170 },
  {
    id: "amount",
    label: "Amount",
    minWidth: 170,
    align: "right",
    format: (value: number) => value.toLocaleString("en-US", { style: "currency", currency: "USD" }),
  },
  { id: "status", label: "Status", minWidth: 100 },
]

export default function MerchantTransactions(): React.JSX.Element {
  const [transactions, setTransactions] = React.useState([])
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)
  const [page, setPage] = React.useState(0)
  const [rowsPerPage, setRowsPerPage] = React.useState(10)
  const { user } = useUser()

  React.useEffect(() => {
    if (user) {
      fetch(`https://api.example.com/transactions?merchantId=${user.id}`)
        .then((response) => {
          if (!response.ok) {
            throw new Error("Failed to fetch transactions")
          }
          return response.json()
        })
        .then((data) => {
          setTransactions(data)
          setLoading(false)
        })
        .catch((err) => {
          console.error("Error fetching transactions:", err)
          setError("Failed to load transactions. Please try again later.")
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
          Transactions
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
                {transactions.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((transaction) => {
                  return (
                    <TableRow hover role="checkbox" tabIndex={-1} key={transaction.id}>
                      {columns.map((column) => {
                        const value = transaction[column.id]
                        return (
                          <TableCell key={column.id} align={column.align}>
                            {column.format && typeof value === "number" ? column.format(value) : value}
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
            count={transactions.length}
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

