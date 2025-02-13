"use client"

import type React from "react"
import { useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import {
  Box,
  Button,
  Card,
  CardHeader,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TablePagination,
  CircularProgress,
  Alert,
} from "@mui/material"
import dayjs from "dayjs"

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

async function fetchTransactions(page: number, limit: number): Promise<{ transactions: Transaction[]; total: number }> {
  const response = await fetch(`https://ezitt.whencefinancesystem.com/transactions?page=${page + 1}&limit=${limit}`)
  if (!response.ok) {
    throw new Error("Failed to fetch transactions")
  }
  const data = await response.json()
  console.log("Raw transactions response:", data)
  return { transactions: Array.isArray(data) ? data : [], total: Array.isArray(data) ? data.length : 0 }
}

async function fetchUsers(): Promise<User[]> {
  const response = await fetch("https://ezitt.whencefinancesystem.com/users")
  if (!response.ok) {
    throw new Error("Failed to fetch users")
  }
  return await response.json()
}

export default function AllTransactions() {
  const [transactions, setTransactions] = useState<EnrichedTransaction[]>([])
  const router = useRouter()
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(10)
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadTransactions = async () => {
      try {
        setLoading(true)
        const [{ transactions, total }, users] = await Promise.all([fetchTransactions(page, rowsPerPage), fetchUsers()])
        console.log("Fetched transactions:", transactions)
        console.log("Fetched users:", users)
        setTotal(total)

        const userMap = new Map(users.map((user) => [user.id, user]))

        const enrichedTransactions = transactions.map((transaction) => {
          const enriched = {
            ...transaction,
            paid_by_user: userMap.get(transaction.paid_by) || null,
            paid_to_user: userMap.get(transaction.paid_to) || null,
          }
          console.log("Enriched transaction:", enriched)
          return enriched
        })

        console.log("Final enriched transactions:", enrichedTransactions)
        setTransactions(enrichedTransactions)
        setLoading(false)
      } catch (err) {
        console.error("Error fetching data:", err)
        setError("Failed to load transactions. Please try again later.")
        setLoading(false)
      }
    }

    loadTransactions()
  }, [page, rowsPerPage])

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage)
  }

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(Number.parseInt(event.target.value, 10))
    setPage(0)
  }

  const formatName = (user: User | null, type: string | null) => {
    if (!user) return "N/A"
    const name = [user.first_name, user.last_name].filter(Boolean).join(" ") || user.organisation_name || user.email
    return `${name} (${type || user.user_type || "N/A"})` // - ID: ${user.id}
  }

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
        <CircularProgress />
      </Box>
    )
  }

  if (error) {
    return (
      <Box m={2}>
        <Alert severity="error">{error}</Alert>
      </Box>
    )
  }

  return (
    <Box>
      <Box sx={{ mb: 3 }}>
        <Button onClick={() => router.push("/dashboard")} variant="outlined">
          Back to Overview
        </Button>
      </Box>
      <Card>
        <CardHeader title="All Transactions" />
        <Divider />
        <Box sx={{ overflowX: "auto" }}>
          <Table sx={{ minWidth: 800 }}>
            <TableHead>
              <TableRow>
                <TableCell>Paid By</TableCell>
                <TableCell>Paid To</TableCell>
                <TableCell>Store</TableCell>
                <TableCell>Amount</TableCell>
                <TableCell>Transaction Type</TableCell>
                <TableCell sortDirection="desc">Date</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {transactions && transactions.length > 0 ? (
                transactions.map((transaction) => (
                  <TableRow hover key={transaction.id}>
                    <TableCell>{formatName(transaction.paid_by_user, transaction.paid_by_type)}</TableCell>
                    <TableCell>{formatName(transaction.paid_to_user, transaction.paid_to_type)}</TableCell>
                    <TableCell>{transaction.store || "N/A"}</TableCell>
                    <TableCell>${transaction.amount?.toFixed(2) ?? "N/A"}</TableCell>
                    <TableCell>{transaction.transaction_type || "N/A"}</TableCell>
                    <TableCell>
                      {transaction.time_stamp ? dayjs(transaction.time_stamp).format("MMM D, YYYY HH:mm") : "N/A"}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    {loading ? "Loading transactions..." : "No transactions found"}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </Box>
        <TablePagination
          component="div"
          count={total}
          page={page}
          onPageChange={handleChangePage}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          rowsPerPageOptions={[10, 25, 50]}
        />
      </Card>
    </Box>
  )
}

