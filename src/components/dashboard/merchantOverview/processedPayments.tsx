"use client"

import * as React from "react"
import Avatar from "@mui/material/Avatar"
import Card from "@mui/material/Card"
import CardContent from "@mui/material/CardContent"
import Stack from "@mui/material/Stack"
import type { SxProps } from "@mui/material/styles"
import Typography from "@mui/material/Typography"
import CircularProgress from "@mui/material/CircularProgress"
import { ArrowDown as ArrowDownIcon } from "@phosphor-icons/react/dist/ssr/ArrowDown"
import { ArrowUp as ArrowUpIcon } from "@phosphor-icons/react/dist/ssr/ArrowUp"
import { CurrencyDollar as CurrencyDollarIcon } from "@phosphor-icons/react/dist/ssr/CurrencyDollar"
import { useUser } from "@/hooks/use-user"

const API_BASE_URL = "https://ezitt.whencefinancesystem.com"

interface Transaction {
  amount: number
  merchant: number // Assuming this is the merchant ID in the transaction
}

interface Merchant {
  id: number
  user_id: string
}

async function fetchMerchantId(userId: string): Promise<number | null> {
  const response = await fetch(`${API_BASE_URL}/merchants?user_id=${userId}`)
  if (!response.ok) {
    throw new Error("Failed to fetch merchant data")
  }
  const merchants: Merchant[] = await response.json()
  return merchants.length > 0 ? merchants[0].id : null
}

async function fetchTransactions(merchantId: number): Promise<Transaction[]> {
  const response = await fetch(`${API_BASE_URL}/transactions`)
  if (!response.ok) {
    throw new Error("Failed to fetch transactions")
  }
  const allTransactions: Transaction[] = await response.json()
  return allTransactions.filter((transaction) => transaction.merchant === merchantId)
}

export interface ProcessedProps {
  diff?: number
  trend: "up" | "down"
  sx?: SxProps
  title: string
}

export function Processed({ diff, trend, sx }: ProcessedProps): React.JSX.Element {
  const [totalFees, setTotalFees] = React.useState<number | null>(null)
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)
  const { user } = useUser()

  React.useEffect(() => {
    const calculateFees = async () => {
      if (!user) {
        setError("User not authenticated")
        setLoading(false)
        return
      }

      try {
        const merchantId = await fetchMerchantId(user.id)
        if (!merchantId) {
          setError("No merchant account found for this user")
          setLoading(false)
          return
        }

        const transactions = await fetchTransactions(merchantId)
        const fees = transactions.reduce((total, transaction) => {
          return total + transaction.amount * 0.05 // 5% fee
        }, 0)
        setTotalFees(fees)
        setLoading(false)
      } catch (err) {
        console.error("Error fetching data:", err)
        setError("Failed to calculate fees")
        setLoading(false)
      }
    }

    calculateFees()
  }, [user])

  const TrendIcon = trend === "up" ? ArrowUpIcon : ArrowDownIcon
  const trendColor = trend === "up" ? "var(--mui-palette-success-main)" : "var(--mui-palette-error-main)"

  return (
    <Card sx={sx}>
      <CardContent>
        <Stack spacing={3}>
          <Stack direction="row" sx={{ alignItems: "flex-start", justifyContent: "space-between" }} spacing={3}>
            <Stack spacing={1}>
              <Typography color="text.secondary" variant="overline">
                Processed Payments
              </Typography>
              {loading ? (
                <CircularProgress size={24} />
              ) : error ? (
                <Typography color="error" variant="body2">
                  {error}
                </Typography>
              ) : (
                <Typography variant="h4">K{totalFees?.toFixed(2)}</Typography>
              )}
            </Stack>
            <Avatar sx={{ backgroundColor: "#CBA328", height: "56px", width: "56px" }}>
              <CurrencyDollarIcon fontSize="var(--icon-fontSize-lg)" />
            </Avatar>
          </Stack>
          {diff && !loading && !error ? (
            <Stack sx={{ alignItems: "center" }} direction="row" spacing={2}>
              
             
            </Stack>
          ) : null}
        </Stack>
      </CardContent>
    </Card>
  )
}

