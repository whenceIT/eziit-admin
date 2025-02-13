"use client"

import * as React from "react"
import Grid from "@mui/material/Unstable_Grid2"
import CircularProgress from "@mui/material/CircularProgress"
import Alert from "@mui/material/Alert"

import { Budget } from "@/components/dashboard/overview/budget"
import { LatestOrders } from "@/components/dashboard/overview/latest-transactionss"
import { LatestProducts } from "@/components/dashboard/overview/frequently-used-merchants"
import { Sales } from "@/components/dashboard/overview/revenue-overview"
import { TasksProgress } from "@/components/dashboard/overview/repayment-success-rate"
import { TotalCustomers } from "@/components/dashboard/overview/total-users"
import { TotalProfit } from "@/components/dashboard/overview/default-rate"
import { Traffic } from "@/components/dashboard/overview/traffic"

interface User {
  id: string
  first_name: string | null
  last_name: string | null
  email: string
  user_type: string | null
  organisation_name: string | null
}

interface Transaction {
  id: number
  paid_by: string
  paid_to: string
  store: string | null
  paid_by_type: string | null
  paid_to_type: string | null
  amount: number
  time_stamp: string
  transaction_type: string | null
}

interface EnrichedTransaction extends Transaction {
  paid_by_user: User | null
  paid_to_user: User | null
}

async function fetchTransactions(): Promise<Transaction[]> {
  const response = await fetch("https://ezitt.whencefinancesystem.com/transactions?limit=6")
  if (!response.ok) {
    throw new Error("Failed to fetch transactions")
  }
  return await response.json()
}

async function fetchUsers(): Promise<User[]> {
  const response = await fetch("https://ezitt.whencefinancesystem.com/users")
  if (!response.ok) {
    throw new Error("Failed to fetch users")
  }
  return await response.json()
}

export default function Page(): React.JSX.Element {
  const [transactions, setTransactions] = React.useState<EnrichedTransaction[]>([])
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)

  React.useEffect(() => {
    const loadTransactions = async () => {
      try {
        setLoading(true)
        const [fetchedTransactions, users] = await Promise.all([fetchTransactions(), fetchUsers()])

        const userMap = new Map(users.map((user) => [user.id, user]))

        const enrichedTransactions = fetchedTransactions.map((transaction) => ({
          ...transaction,
          paid_by_user: userMap.get(transaction.paid_by) || null,
          paid_to_user: userMap.get(transaction.paid_to) || null,
        }))

        setTransactions(enrichedTransactions)
        setLoading(false)
        // Store the initial transactions in localStorage
        localStorage.setItem("initialTransactions", JSON.stringify(enrichedTransactions))
      } catch (err) {
        console.error("Error fetching data:", err)
        setError("Failed to load transactions. Please try again later.")
        setLoading(false)
      }
    }

    loadTransactions()
  }, [])

  return (
    <Grid container spacing={3}>
      <Grid lg={3} sm={6} xs={12}>
        <Budget diff={12} trend="up" sx={{ height: "100%" }} />
      </Grid>
      <Grid lg={3} sm={6} xs={12}>
        <TotalCustomers diff={16} trend="down" sx={{ height: "100%" }} />
      </Grid>
      <Grid lg={3} sm={6} xs={12}>
        <TasksProgress sx={{ height: "100%" }} value={75.5} />
      </Grid>
      <Grid lg={3} sm={6} xs={12}>
        <TotalProfit sx={{ height: "100%" }} value="0%" />
      </Grid>
      <Grid lg={8} xs={12}>
        <Sales
          chartSeries={[
            { name: "This year", data: [18, 16, 5, 8, 3, 14, 14, 16, 17, 19, 18, 20] },
            { name: "Last year", data: [12, 11, 4, 6, 2, 9, 9, 10, 11, 12, 13, 13] },
          ]}
          sx={{ height: "100%" }}
        />
      </Grid>
      <Grid lg={4} md={6} xs={12}>
        <Traffic sx={{ height: "100%" }} />
      </Grid>
      <Grid lg={4} md={6} xs={12}>
        <LatestProducts
          products={[
            {
              id: "PRD-005",
              name: "Merchant 1",
              image: "/assets/merchant.png",
            },
            {
              id: "PRD-004",
              name: "Merchant 2",
              image: "/assets/merchant.png",
            },
            {
              id: "PRD-003",
              name: "Merchant 3",
              image: "/assets/merchant.png",
            },
            {
              id: "PRD-002",
              name: "Merchant 4",
              image: "/assets/merchant.png",
            },
            {
              id: "PRD-001",
              name: "Merchant 5",
              image: "/assets/merchant.png",
            },
          ]}
          sx={{ height: "100%" }}
        />
      </Grid>
      <Grid lg={8} md={12} xs={12}>
        {loading ? (
          <CircularProgress />
        ) : error ? (
          <Alert severity="error">{error}</Alert>
        ) : (
          <LatestOrders transactions={transactions} sx={{ height: "100%" }} />
        )}
      </Grid>
    </Grid>
  )
}

