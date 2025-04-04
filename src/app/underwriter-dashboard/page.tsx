"use client"

import * as React from "react"
import Grid from "@mui/material/Unstable_Grid2"
import CircularProgress from "@mui/material/CircularProgress"
import Alert from "@mui/material/Alert"
import Box from "@mui/material/Box"
import Card from "@mui/material/Card"
import CardContent from "@mui/material/CardContent"
import Typography from "@mui/material/Typography"
import Stack from "@mui/material/Stack"
import Avatar from "@mui/material/Avatar"

import { TotalCustomers } from "@/components/dashboard/underwriterOverview/totalClients"
import { TotalEmployers } from "@/components/dashboard/underwriterOverview/totalEmployers"
import { Outstanding } from "@/components/dashboard/underwriterOverview/outstandingPayments"
import { useUser } from "@/hooks/use-user"
import { User, Transaction } from "@/types/user"

// Import icons (assuming you're using phosphor icons like in clientstable.tsx)
//import { Store as StoreIcon } from "@phosphor-icons/react/dist/ssr/Store"
import { ChartLine as ChartLineIcon } from "@phosphor-icons/react/dist/ssr/ChartLine"

type CountData = {
  count: number
  userId: string
  message: string
}

async function fetchLinkedCounts(user: User | null): Promise<{
  clients: CountData
  merchants: CountData
  employers: CountData
}> {
  if (!user) {
    console.error("User not authenticated")
    throw new Error("User not authenticated")
  }

  try {
    const [clientsRes, merchantsRes, employersRes] = await Promise.all([
      fetch(`http://localhost:5000/users/${user.id}/clients`),
      fetch(`http://localhost:5000/users/${user.id}/merchants`),
      fetch(`http://localhost:5000/users/${user.id}/employers`)
    ])

    if (!clientsRes.ok) throw new Error(`Clients API failed: ${clientsRes.status}`)
    if (!merchantsRes.ok) throw new Error(`Merchants API failed: ${merchantsRes.status}`)
    if (!employersRes.ok) throw new Error(`Employers API failed: ${employersRes.status}`)

    const clients = await clientsRes.json()
    const merchants = await merchantsRes.json()
    const employers = await employersRes.json()

    return { clients, merchants, employers }
  } catch (error) {
    console.error("Error in fetchLinkedCounts:", error)
    throw error
  }
}

async function fetchTransactions(user: User | null): Promise<Transaction[]> {
  if (!user) throw new Error("User not authenticated")

  const url = `http://localhost:5000/transactions?limit=6&underwriterId=${user.id}`

  const response = await fetch(url)
  if (!response.ok) {
    throw new Error("Failed to fetch transactions")
  }
  return await response.json()
}

// Simple card component for the fourth grid item
function TotalRelationships({ 
  value, 
  title, 
  sx 
}: { 
  value: number; 
  title: string; 
  sx?: any 
}) {
  return (
    <Card sx={sx}>
      <CardContent>
        <Stack spacing={2}>
          <Stack direction="row" sx={{ alignItems: "flex-start", justifyContent: "space-between" }} spacing={3}>
            <Stack spacing={1}>
              <Typography color="text.secondary" variant="overline">
                {title}
              </Typography>
              <Typography variant="h4">{value}</Typography>
            </Stack>
            <Avatar sx={{ backgroundColor: "var(--mui-palette-primary-main)", height: "56px", width: "56px" }}>
              <ChartLineIcon fontSize="var(--icon-fontSize-lg)" />
            </Avatar>
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  )
}

// Simple transactions table component
function TransactionsTable({ 
  transactions, 
  sx, 
  title 
}: { 
  transactions: Transaction[]; 
  sx?: any; 
  title: string 
}) {
  return (
    <Card sx={sx}>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          {title}
        </Typography>
        {transactions.length === 0 ? (
          <Typography color="text.secondary">No transactions found</Typography>
        ) : (
          <Stack spacing={2}>
            {transactions.map((transaction, index) => (
              <Box key={index} sx={{ p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
                <Typography variant="subtitle2">
                  Transaction ID: {transaction.id}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Amount: ${transaction.amount}
                </Typography>
              </Box>
            ))}
          </Stack>
        )}
      </CardContent>
    </Card>
  )
}

export default function UnderwriterDashboard(): React.JSX.Element {
  const [counts, setCounts] = React.useState<{
    clients: number
    merchants: number
    employers: number
  }>({ clients: 0, merchants: 0, employers: 0 })
  const [transactions, setTransactions] = React.useState<Transaction[]>([])
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)
  const { user } = useUser()

  React.useEffect(() => {
    if (user) {
      // Fetch counts
      fetchLinkedCounts(user)
        .then(({ clients, merchants, employers }) => {
          setCounts({
            clients: clients.count,
            merchants: merchants.count,
            employers: employers.count
          })
        })
        .catch((err) => {
          console.error("Error fetching counts:", err)
          setError("Failed to load relationship counts")
        })

      // Fetch transactions
      fetchTransactions(user)
        .then((data) => {
          setTransactions(data)
        })
        .catch((err) => {
          console.error("Error fetching transactions:", err)
          setError("Failed to load transactions")
        })
        .finally(() => {
          setLoading(false)
        })
    }
  }, [user])

  if (!user) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', pt: 4 }}>
        <Alert severity="warning">Please log in to view your dashboard</Alert>
      </Box>
    )
  }

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', pt: 4 }}>
        <CircularProgress />
      </Box>
    )
  }

  return (
    <Grid container spacing={3}>
      <Grid lg={3} sm={6} xs={12}>
        <TotalCustomers 
          diff={0} 
          trend="up" 
          sx={{ height: "100%" }} 
          title="Linked Clients"
        />
      </Grid>
      <Grid lg={3} sm={6} xs={12}>
        <TotalEmployers 
          diff={0} 
          trend="up" 
          sx={{ height: "100%" }} 
          title="Linked Employers"
        />
      </Grid>
      
      <Grid lg={3} sm={6} xs={12}>
        <TotalRelationships 
          value={counts.clients + counts.merchants + counts.employers}
          title="Total Merchants"
          sx={{ height: "100%" }}
        />
      </Grid>
      <Grid lg={3} sm={6} xs={12}>
        <Outstanding 
          sx={{ height: "100%" }} 
          value={counts.merchants} 
          title="Outstanding" 
          trend="up" 
        />
      </Grid>
      {/*<Grid lg={12} md={12} xs={12}>
        {error ? (
          <Alert severity="error">{error}</Alert>
        ) : (
          <TransactionsTable 
            transactions={transactions} 
            sx={{ height: "100%" }} 
            title="Latest Transactions" 
          />
        )}
      </Grid>*/}
    </Grid>
  )
}