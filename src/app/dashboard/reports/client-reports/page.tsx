"use client"

import { useState } from "react"
import {
  Box,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TextField,
} from "@mui/material"

interface Transaction {
  id: number
  paid_by: string
  paid_to: string
  amount: number
  time_stamp: string
}

export default function ClientsReport() {
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [transactions, setTransactions] = useState<Transaction[]>([])

  const fetchTransactions = async () => {
    if (!startDate || !endDate) return

    const response = await fetch(
      `https://ezitt.whencefinancesystem.com/transactions?start_date=${startDate}&end_date=${endDate}`,
    )
    if (response.ok) {
      const data = await response.json()
      setTransactions(data)
    } else {
      console.error("Failed to fetch transactions")
    }
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: "flex", gap: 2, mb: 3 }}>
        <TextField
          type="date"
          label="Start Date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          InputLabelProps={{ shrink: true }}
        />
        <TextField
          type="date"
          label="End Date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          InputLabelProps={{ shrink: true }}
        />
        <Button variant="contained" onClick={fetchTransactions}>
          Generate Report
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Transaction ID</TableCell>
              <TableCell>Paid By</TableCell>
              <TableCell>Paid To</TableCell>
              <TableCell>Amount</TableCell>
              <TableCell>Date</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {transactions.map((transaction) => (
              <TableRow key={transaction.id}>
                <TableCell>{transaction.id}</TableCell>
                <TableCell>{transaction.paid_by}</TableCell>
                <TableCell>{transaction.paid_to}</TableCell>
                <TableCell>${transaction.amount.toFixed(2)}</TableCell>
                <TableCell>{new Date(transaction.time_stamp).toLocaleString()}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  )
}

