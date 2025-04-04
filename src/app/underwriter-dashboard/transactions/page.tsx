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

interface Merchant {
  id: number
  user_id: string
  underwriter_id: number
}

interface Transaction {
  id: number
  paid_by: string
  paid_to: string
  store: string
  amount: number
  time_stamp: string
}

interface UserDetails {
  id: string
  first_name: string
  last_name: string
}

export default function UnderwriterTransactions(): React.JSX.Element {
  const [merchants, setMerchants] = React.useState<Merchant[]>([])
  const [transactions, setTransactions] = React.useState<Transaction[]>([])
  const [userDetails, setUserDetails] = React.useState<Record<string, UserDetails>>({})
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)
  const { user } = useUser()

  const fetchUserDetails = async (userId: string): Promise<UserDetails> => {
    const response = await fetch(`${API_BASE_URL}/users/${userId}`)
    if (!response.ok) {
      throw new Error(`Failed to fetch user details: ${response.statusText}`)
    }
    return response.json()
  }

  React.useEffect(() => {
    const fetchData = async () => {
      if (!user) {
        setError("User not authenticated")
        setLoading(false)
        return
      }

      if (user.user_type !== "underwriter") {
        setError("Access restricted: Only underwriters can view this page")
        setLoading(false)
        return
      }

      try {
        setLoading(true)

        // Step 1: Fetch all merchants under the logged-in underwriter
        const underwriterId = user.id
        const merchantsResponse = await fetch(`${API_BASE_URL}/merchants?underwriter_id=${underwriterId}`)

        if (!merchantsResponse.ok) {
          throw new Error(`Failed to fetch merchants: ${merchantsResponse.statusText}`)
        }

        const merchantsData: Merchant[] = await merchantsResponse.json()
        setMerchants(merchantsData)

        if (!merchantsData || merchantsData.length === 0) {
          setLoading(false)
          return
        }

        // Step 2: Fetch transactions for each merchant
        const transactionMap = new Map<number, Transaction>()
        const userDetailsMap: Record<string, UserDetails> = {}

        // Fetch all users to create a map of user IDs to names
        const usersResponse = await fetch(`${API_BASE_URL}/users`)
        if (!usersResponse.ok) {
          throw new Error("Failed to fetch users")
        }
        const users = await usersResponse.json()
        users.forEach((user: UserDetails) => {
          userDetailsMap[user.id] = user
        })

        // Use Promise.all to fetch transactions for all merchants in parallel
        await Promise.all(
          merchantsData.map(async (merchant) => {
            try {
              // Fetch transactions where merchant is the payer
              const paidByResponse = await fetch(`${API_BASE_URL}/transactions_paid_by/${merchant.user_id}`)

              // Fetch transactions where merchant is the recipient
              const paidToResponse = await fetch(`${API_BASE_URL}/transactions_paid_to/${merchant.user_id}`)

              if (!paidByResponse.ok) {
                console.warn(`Failed to fetch paid_by transactions for merchant ${merchant.user_id}`)
                return
              }

              if (!paidToResponse.ok) {
                console.warn(`Failed to fetch paid_to transactions for merchant ${merchant.user_id}`)
                return
              }

              const paidByTransactions: Transaction[] = await paidByResponse.json()
              const paidToTransactions: Transaction[] = await paidToResponse.json()

              // Add transactions to our Map using transaction ID as the key to prevent duplicates
              ;[...paidByTransactions, ...paidToTransactions].forEach((transaction) => {
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
              console.error(`Error fetching transactions for merchant ${merchant.user_id}:`, err)
            }
          }),
        )

        // Convert Map values to array
        const allTransactions = Array.from(transactionMap.values())

        // Sort transactions by date (newest first)
        allTransactions.sort((a, b) => new Date(b.time_stamp).getTime() - new Date(a.time_stamp).getTime())

        setTransactions(allTransactions)
        setUserDetails(userDetailsMap)
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
                Merchant Transactions
              </Typography>
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
                      <TableCell>
                        {userDetails[transaction.paid_by]?.first_name} {userDetails[transaction.paid_by]?.last_name}
                      </TableCell>
                      <TableCell>
                        {userDetails[transaction.paid_to]?.first_name} {userDetails[transaction.paid_to]?.last_name}
                      </TableCell>
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