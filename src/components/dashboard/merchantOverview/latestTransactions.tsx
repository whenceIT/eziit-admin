"use client"

import type * as React from "react"
import { useEffect, useState } from "react"
import Link from "next/link"
import Box from "@mui/material/Box"
import Button from "@mui/material/Button"
import Card from "@mui/material/Card"
import CardActions from "@mui/material/CardActions"
import CardHeader from "@mui/material/CardHeader"
import Divider from "@mui/material/Divider"
import type { SxProps } from "@mui/material/styles"
import Table from "@mui/material/Table"
import TableBody from "@mui/material/TableBody"
import TableCell from "@mui/material/TableCell"
import TableHead from "@mui/material/TableHead"
import TableRow from "@mui/material/TableRow"
import { ArrowRight as ArrowRightIcon } from "@phosphor-icons/react/dist/ssr/ArrowRight"
import dayjs from "dayjs"
import { useUser } from "@/hooks/use-user"

const API_BASE_URL = "https://ezitt.whencefinancesystem.com"

export interface Transaction {
  paid_by: string
  paid_to: string
  store: number | null
  paid_by_type: string | null
  paid_to_type: string | null
  amount: number
  time_stamp: string
  id: number
}

interface User {
  id: string
  user_type: string
  first_name: string
  last_name: string
}

interface Store {
  id: number
  location: string
}

export interface LatestOrdersProps {
  transactions: Transaction[];
  sx?: SxProps
  title: string
}

export function LatestOrders({ sx }: LatestOrdersProps): React.JSX.Element {
  const { user } = useUser()
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [stores, setStores] = useState<Store[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return

      setIsLoading(true)
      setError(null)

      try {
        const [transactionsResponse, usersResponse, storesResponse] = await Promise.all([
          fetch(`${API_BASE_URL}/transactions`),
          fetch(`${API_BASE_URL}/users`),
          fetch(`${API_BASE_URL}/stores`),
        ])

        if (!transactionsResponse.ok || !usersResponse.ok || !storesResponse.ok) {
          throw new Error("Failed to fetch data")
        }

        const [allTransactions, allUsers, allStores] = await Promise.all([
          transactionsResponse.json(),
          usersResponse.json(),
          storesResponse.json(),
        ])

        //filter fetching transactions for logged in user
        const userTransactions = allTransactions.filter(
          (transaction: Transaction) => transaction.paid_by === user.id || transaction.paid_to === user.id,
        )

        //sort usng timestamp
        userTransactions.sort(
          (a: Transaction, b: Transaction) => new Date(b.time_stamp).getTime() - new Date(a.time_stamp).getTime(),
        )

        //only the latest 5 transactions
        setTransactions(userTransactions.slice(0, 5))
        setUsers(allUsers)
        setStores(allStores)
      } catch (error) {
        console.error("Error fetching data:", error)
        setError("Failed to load data. Please try again later.")
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [user])

  const getUserName = (userId: string) => {
    const user = users.find((u) => u.id === userId)
    return user ? `${user.first_name} ${user.last_name}` : "Unknown User"
  }

  const getStoreLocation = (storeId: number | null) => {
    if (!storeId) return "N/A"
    const store = stores.find((s) => s.id === storeId)
    return store ? store.location : "Unknown Location"
  }

  if (isLoading) {
    return (
      <Card sx={sx}>
        <CardHeader title="Loading transactions..." />
      </Card>
    )
  }

  if (error) {
    return (
      <Card sx={sx}>
        <CardHeader title={error} />
      </Card>
    )
  }

  return (
    <Card sx={sx}>
      <Box sx={{ p: 3 }}>
        <h3>Latest Transactions</h3>
      </Box>
      <Divider />
      <Box sx={{ overflowX: "auto" }}>
        <Table sx={{ minWidth: 800 }}>
          <TableHead sx={{ backgroundColor: "#CBA328" }}>
            <TableRow>
              <TableCell>Paid By</TableCell>
              <TableCell>Paid To</TableCell>
              <TableCell>Store</TableCell>
              <TableCell>Store Location</TableCell>
              <TableCell>Amount</TableCell>
              <TableCell sortDirection="desc">Date</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {transactions.map((transaction) => (
              <TableRow hover key={transaction.id}>
                <TableCell>{`${getUserName(transaction.paid_by)} (${transaction.paid_by_type || "N/A"})`}</TableCell>
                <TableCell>{`${getUserName(transaction.paid_to)} (${transaction.paid_to_type || "N/A"})`}</TableCell>
                <TableCell>{transaction.store || "N/A"}</TableCell>
                <TableCell>{getStoreLocation(transaction.store)}</TableCell>
                <TableCell>{transaction.amount.toFixed(2)}</TableCell>
                <TableCell>{dayjs(transaction.time_stamp).format("MMM D, YYYY HH:mm")}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Box>
      <Divider />
      <CardActions sx={{ justifyContent: "flex-end" }}>
        <Link href="/merchant-dashboard/transactions" passHref>
          <Button
            color="inherit"
            endIcon={<ArrowRightIcon fontSize="var(--icon-fontSize-md)" />}
            size="small"
            variant="text"
          >
            View all Transactions
          </Button>
        </Link>
      </CardActions>
    </Card>
  )
}

