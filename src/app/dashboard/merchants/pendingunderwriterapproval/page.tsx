"use client"

import { useState, useEffect } from "react"
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Typography,
  Box,
  CircularProgress,
} from "@mui/material"
import { useUser } from "@/hooks/use-user"
import Stack from '@mui/material/Stack'

const API_BASE_URL = "https://ezitt.whencefinancesystem.com"

interface Merchant {
  id: number
  user_id: string
  merchant_code: string
  underwriter_status: string
  underwriter_id: number | null // Updated to number | null
}

interface User {
  id: string
  first_name: string
  last_name: string
}

interface Underwriter {
  id: number
  user_id: string
  transactions: any // You might want to define a more specific type here
}

export default function MerchantRecords() {
  const [merchants, setMerchants] = useState<Merchant[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [underwriters, setUnderwriters] = useState<Underwriter[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filter, setFilter] = useState<string | null>(null)
  const { user } = useUser()

  useEffect(() => {
    const fetchData = async () => {
      if (!user) {
        setError("User not authenticated")
        setLoading(false)
        return
      }

      try {
        const [merchantsResponse, usersResponse, underwritersResponse] = await Promise.all([
          fetch(`${API_BASE_URL}/merchants`),
          fetch(`${API_BASE_URL}/users`),
          fetch(`${API_BASE_URL}/underwriters`),
        ])

        if (!merchantsResponse.ok || !usersResponse.ok || !underwritersResponse.ok) {
          throw new Error("Failed to fetch data")
        }

        const [merchantsData, usersData, underwritersData] = await Promise.all([
          merchantsResponse.json(),
          usersResponse.json(),
          underwritersResponse.json(),
        ])

        setMerchants(merchantsData)
        setUsers(usersData)
        setUnderwriters(underwritersData)
        setLoading(false)
      } catch (err) {
        console.error("Error fetching data:", err)
        setError("Failed to load data. Please try again later.")
        setLoading(false)
      }
    }

    fetchData()
  }, [user])

  const getUnderwriterName = (underwriterId: number | null) => {
    if (!underwriterId) return "N/A";

    // Find the underwriter by id
    const underwriter = underwriters.find((u) => u.id === underwriterId);
    if (!underwriter) return "Unknown";

    // Find the user by user_id in the underwriter
    const user = users.find((u) => u.id === underwriter.user_id);
    return user ? `${user.first_name} ${user.last_name}` : "Unknown";
  }

  const filteredMerchants = filter ? merchants.filter((merchant) => merchant.underwriter_status === filter) : merchants

  if (loading) return <CircularProgress />
  if (error) return <Typography color="error">{error}</Typography>

  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        Merchants pending Underwriter Approval
      </Typography>

      <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
        <Button onClick={() => setFilter(null)} variant={filter === null ? "contained" : "outlined"}>
          All
        </Button>
        <Button onClick={() => setFilter("approved")} variant={filter === "approved" ? "contained" : "outlined"}>
          Approved
        </Button>
        <Button onClick={() => setFilter("pending")} variant={filter === "pending" ? "contained" : "outlined"}>
          Pending
        </Button>
        <Button onClick={() => setFilter("declined")} variant={filter === "declined" ? "contained" : "outlined"}>
          Declined
        </Button>
      </Stack>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Merchant ID</TableCell>
              <TableCell>Merchant Code</TableCell>
              <TableCell>Underwriter Status</TableCell>
              <TableCell>Underwriter Name</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredMerchants.map((merchant) => (
              <TableRow key={merchant.id}>
                <TableCell>{merchant.id}</TableCell>
                <TableCell>{merchant.merchant_code}</TableCell>
                <TableCell>{merchant.underwriter_status}</TableCell>
                <TableCell>{getUnderwriterName(merchant.underwriter_id)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  )
}