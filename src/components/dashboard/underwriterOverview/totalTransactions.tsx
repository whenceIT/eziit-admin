"use client"

import { useEffect, useState } from "react"
import Card from "@mui/material/Card"
import CardContent from "@mui/material/CardContent"
import Stack from "@mui/material/Stack";
import Avatar from "@mui/material/Avatar";
import CardHeader from "@mui/material/CardHeader"
import Divider from "@mui/material/Divider"
import CircularProgress from "@mui/material/CircularProgress"
import { Users as UsersIcon } from "@phosphor-icons/react/dist/ssr/Users";
import Alert from "@mui/material/Alert"
import Typography from "@mui/material/Typography"
import { useUser } from "@/hooks/use-user"

const API_BASE_URL = "https://ezitt.whencefinancesystem.com"

type Transaction = {
  id: number
  amount: number
  paid_by: number
  paid_to: number
}

type Merchant = {
  id: number
  user_id: number
}

export function TotalTransactions({ sx }: { sx?: any }) {
  const { user } = useUser()
  const [totalAmount, setTotalAmount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchTotalAmount = async () => {
      if (!user) return
      setLoading(true)
      setError(null)
      
      try {
        // Fetch merchants under the logged-in underwriter
        const merchantsResponse = await fetch(`${API_BASE_URL}/merchants?underwriter_id=${user.id}`)
        if (!merchantsResponse.ok) throw new Error("Failed to fetch merchants")
        const merchants: Merchant[] = await merchantsResponse.json()

        // Fetch all transactions
        const transactionsResponse = await fetch(`${API_BASE_URL}/transactions`)
        if (!transactionsResponse.ok) throw new Error("Failed to fetch transactions")
        const allTransactions: Transaction[] = await transactionsResponse.json()

        // Filter transactions involving the underwriter's merchants
        const merchantIds = merchants.map((merchant) => merchant.user_id)
        const relevantTransactions = allTransactions.filter(
          (transaction) => merchantIds.includes(transaction.paid_by) || merchantIds.includes(transaction.paid_to),
        )

        // Calculate total amount
        const total = relevantTransactions.reduce((sum, transaction) => sum + transaction.amount, 0)
        setTotalAmount(total)
      } catch (error) {
        console.error("Error fetching transactions:", error)
        setError("Failed to load data. Please try again later.")
      } finally {
        setLoading(false)
      }
    }

    fetchTotalAmount()
  }, [user])

 {/*} return (
    <Card sx={sx}>
      <CardHeader title="Total Transactions Amount" />
      <Divider />
      <CardContent>
        {loading ? (
          <CircularProgress />
        ) : error ? (
          <Alert severity="error">{error}</Alert>
        ) : (
          <Typography variant="h4" align="center">${totalAmount.toFixed(2)}</Typography>
        )}
      </CardContent>
    </Card>
  )*/}
  return (
    <Card sx={sx}>
      <CardContent>
        <Stack spacing={2}>
          <Stack direction="row" sx={{ alignItems: "flex-start", justifyContent: "space-between" }} spacing={3}>
            <Stack spacing={1}>
              <Typography color="text.secondary" variant="overline">
                Total Merchant Transactions
              </Typography>
              {loading ? (
                <CircularProgress size={24} />
              ) : error ? (
                <Typography color="error" variant="body2">
                  {error}
                </Typography>
              ) : (
                <Typography variant="h4">{totalAmount.toFixed(2)}</Typography>
              )}
            </Stack>
            <Avatar sx={{ backgroundColor: "var(--mui-palette-success-main)", height: 56, width: 56 }}>
              <UsersIcon size={32} />
            </Avatar>
          </Stack>
          
        </Stack>
      </CardContent>
    </Card>
  );


}
