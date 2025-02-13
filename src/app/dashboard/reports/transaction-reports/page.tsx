"use client"

import { useState, useEffect } from "react"
import {
  Box,
  TextField,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  MenuItem,
} from "@mui/material"

interface Transaction {
  id: number
  paid_by: string
  paid_to: string
  amount: number
  time_stamp: string
}

interface User {
  id: string
  name: string
}

export default function TransactionsReport() {
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [employers, setEmployers] = useState<User[]>([])
  const [merchants, setMerchants] = useState<User[]>([])
  const [selectedEmployer, setSelectedEmployer] = useState<string>("")
  const [selectedMerchant, setSelectedMerchant] = useState<string>("")

  useEffect(() => {
    fetchUsers("employer")
    fetchUsers("merchant")
  }, [])

  const fetchUsers = async (userType: "employer" | "merchant") => {
    const response = await fetch(`https://ezitt.whencefinancesystem.com/users?user_type=${userType}`)
    if (response.ok) {
      const data = await response.json()
      if (userType === "employer") {
        setEmployers(data)
      } else {
        setMerchants(data)
      }
    } else {
      console.error(`Failed to fetch ${userType}s`)
    }
  }

  const fetchTransactions = async () => {
    if (!startDate || !endDate) return

    let url = `https://ezitt.whencefinancesystem.com/transactions?start_date=${startDate}&end_date=${endDate}`

    if (selectedEmployer) {
      url += `&employer_id=${selectedEmployer}`
    }

    if (selectedMerchant) {
      url += `&merchant_id=${selectedMerchant}`
    }

    const response = await fetch(url)
    if (response.ok) {
      const data = await response.json()
      setTransactions(data)
    } else {
      console.error("Failed to fetch transactions")
    }
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 2, mb: 3 }}>
        <TextField
          type="date"
          label="Start Date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          InputLabelProps={{ shrink: true }}
          sx={{ width: "200px" }}
        />
        <TextField
          type="date"
          label="End Date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          InputLabelProps={{ shrink: true }}
          sx={{ width: "200px" }}
        />
        <TextField
          select
          label="Employer"
          value={selectedEmployer}
          onChange={(e) => setSelectedEmployer(e.target.value)}
          sx={{ width: "200px" }}
        >
          <MenuItem value="">All Employers</MenuItem>
          {employers.map((employer) => (
            <MenuItem key={employer.id} value={employer.id}>
              {employer.name}
            </MenuItem>
          ))}
        </TextField>
        <TextField
          select
          label="Merchant"
          value={selectedMerchant}
          onChange={(e) => setSelectedMerchant(e.target.value)}
          sx={{ width: "200px" }}
        >
          <MenuItem value="">All Merchants</MenuItem>
          {merchants.map((merchant) => (
            <MenuItem key={merchant.id} value={merchant.id}>
              {merchant.name}
            </MenuItem>
          ))}
        </TextField>
        <Button variant="contained" onClick={fetchTransactions} sx={{ width: "200px", whiteSpace: "nowrap" }}>
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

