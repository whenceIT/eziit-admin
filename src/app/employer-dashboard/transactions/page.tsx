"use client"

import * as React from "react"
import Avatar from "@mui/material/Avatar"
import Card from "@mui/material/Card"
import CardContent from "@mui/material/CardContent"
import Stack from "@mui/material/Stack"
import Typography from "@mui/material/Typography"
import CircularProgress from "@mui/material/CircularProgress"
import { Users as UsersIcon } from "@phosphor-icons/react/dist/ssr/Users"
import { useUser } from "@/hooks/use-user"
import Table from "@mui/material/Table"
import TableBody from "@mui/material/TableBody"
import TableCell from "@mui/material/TableCell"
import TableContainer from "@mui/material/TableContainer"
import TableHead from "@mui/material/TableHead"
import TableRow from "@mui/material/TableRow"
import Paper from "@mui/material/Paper"
import Alert from "@mui/material/Alert"

const API_BASE_URL = "https://ezitt.whencefinancesystem.com"

interface Client {
  id: number
  user_id: string
  employer_id: number
}

interface Transaction {
  id: number
  paid_by: string
  paid_to: string
  store: string
  amount: number
  time_stamp: string
}

export default function EmployerTransactions(): React.JSX.Element {
  const [clients, setClients] = React.useState<Client[]>([])
  const [transactions, setTransactions] = React.useState<Transaction[]>([])
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)
  const { user } = useUser()

  React.useEffect(() => {
    const fetchData = async () => {
      if (!user) {
        setError("User not authenticated")
        setLoading(false)
        return
      }

      if (user.user_type !== "employer") {
        setError("Access restricted: Only employers can view this page")
        setLoading(false)
        return
      }

      try {
        setLoading(true)

        // Step 1: Fetch all clients under the logged-in employer
        // Assuming the employer's ID is directly available in the user object
        const employerId = user.id

        // Fetch all clients where employer_id matches the logged-in employer's ID
        const clientsResponse = await fetch(`${API_BASE_URL}/clients?employer_id=${employerId}`)

        if (!clientsResponse.ok) {
          throw new Error(`Failed to fetch clients: ${clientsResponse.statusText}`)
        }

        const clientsData: Client[] = await clientsResponse.json()
        setClients(clientsData)

        if (!clientsData || clientsData.length === 0) {
          setLoading(false)
          return
        }

        // Step 2: Fetch transactions for each client
        const transactionMap = new Map<number, Transaction>() // Use a Map to prevent duplicates

        // Use Promise.all to fetch transactions for all clients in parallel
        await Promise.all(
          clientsData.map(async (client) => {
            try {
              // Fetch transactions where client is the payer
              const paidByResponse = await fetch(`${API_BASE_URL}/transactions_paid_by/${client.user_id}`)

              // Fetch transactions where client is the recipient
              const paidToResponse = await fetch(`${API_BASE_URL}/transactions_paid_to/${client.user_id}`)

              if (!paidByResponse.ok) {
                console.warn(`Failed to fetch paid_by transactions for client ${client.user_id}`)
                return
              }

              if (!paidToResponse.ok) {
                console.warn(`Failed to fetch paid_to transactions for client ${client.user_id}`)
                return
              }

              const paidByTransactions: Transaction[] = await paidByResponse.json()
              const paidToTransactions: Transaction[] = await paidToResponse.json()

              // Add transactions to our Map using transaction ID as the key to prevent duplicates
              ;[...paidByTransactions, ...paidToTransactions].forEach((transaction) => {
                // Only add valid transactions with all required fields
                if (
                  transaction &&
                  transaction.id &&
                  transaction.paid_by &&
                  transaction.paid_to &&
                  transaction.amount !== undefined &&
                  transaction.time_stamp
                ) {
                  transactionMap.set(transaction.id, transaction)
                }
              })
            } catch (err) {
              console.error(`Error fetching transactions for client ${client.user_id}:`, err)
            }
          }),
        )

        // Convert Map values to array
        const allTransactions = Array.from(transactionMap.values())

        // Sort transactions by date (newest first)
        allTransactions.sort((a, b) => new Date(b.time_stamp).getTime() - new Date(a.time_stamp).getTime())

        setTransactions(allTransactions)
      } catch (err) {
        console.error("Error fetching data:", err)
        setError(err instanceof Error ? err.message : "An unknown error occurred")
      } finally {
        setLoading(false)
      }
    }

    if (user) {
      fetchData()
    }
  }, [user])

  return (
    <Card>
      <CardContent>
        <Stack spacing={2}>
          <Stack direction="row" sx={{ alignItems: "flex-start", justifyContent: "space-between" }} spacing={3}>
            <Stack spacing={1}>
              <Typography color="text.secondary" variant="overline">
                Employee Transactions
              </Typography>
              {/*{clients.length > 0 && (
                <Typography variant="h6">
                  {clients.length} {clients.length === 1 ? "Employee" : "Employees"}
                </Typography>
              )}*/}
            </Stack>
            <Avatar sx={{ backgroundColor: "var(--mui-palette-success-main)", height: "56px", width: "56px" }}>
              <UsersIcon fontSize="var(--icon-fontSize-lg)" />
            </Avatar>
          </Stack>
        </Stack>

        {loading && (
          <Stack alignItems="center" spacing={2} sx={{ my: 4 }}>
            <CircularProgress />
            <Typography color="text.secondary" variant="body2">
              Loading transactions...
            </Typography>
          </Stack>
        )}

        {error && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {error}
          </Alert>
        )}

        {!loading && !error && transactions.length === 0 && (
          <Alert severity="info" sx={{ mt: 2 }}>
            No transactions found for your employees.
          </Alert>
        )}

        {/* Display Transactions Table */}
        {!loading && !error && transactions.length > 0 && (
          <Paper sx={{ marginTop: 2, overflowX: "auto" }}>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>ID</TableCell>
                    <TableCell>Paid By</TableCell>
                    <TableCell>Paid To</TableCell>
                    <TableCell>Amount</TableCell>
                    <TableCell>Store</TableCell>
                    <TableCell>Date</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {transactions.map((transaction) => (
                    <TableRow key={transaction.id}>
                      <TableCell>{transaction.id}</TableCell>
                      <TableCell>{transaction.paid_by}</TableCell>
                      <TableCell>{transaction.paid_to}</TableCell>
                      <TableCell>{transaction.amount.toFixed(2)}</TableCell>
                      <TableCell>{transaction.store}</TableCell>
                      <TableCell>{new Date(transaction.time_stamp).toLocaleDateString()}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        )}
      </CardContent>
    </Card>
  )
}

