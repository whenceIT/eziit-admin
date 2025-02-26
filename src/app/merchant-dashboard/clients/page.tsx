"use client"

import * as React from "react"
import Grid from "@mui/material/Unstable_Grid2"
import Typography from "@mui/material/Typography"
import Paper from "@mui/material/Paper"
import TablePagination from "@mui/material/TablePagination"
import CircularProgress from "@mui/material/CircularProgress"
import Alert from "@mui/material/Alert"

import { useUser } from "@/hooks/use-user"
import { MerchantClientsTable } from "@/components/dashboard/merchant/merchant-clients-table"

const API_BASE_URL = "https://ezitt.whencefinancesystem.com"

interface MerchantDetails {
  id: number
  user_id: string // This matches the logged-in user's ID
  //status: string | null
  underwriter_status: string
  merchant_code: string
  clients: { id: number }[]
  employers: { id: number }[]
}

export interface MerchantClient {
  id: number
  name: string
  email: string
  phone: string
  //status: string
  float: number
  employer: number
  ratings: number
}

export default function MerchantClients(): React.JSX.Element {
  const [clients, setClients] = React.useState<MerchantClient[]>([])
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)
  const [page, setPage] = React.useState(0)
  const [rowsPerPage, setRowsPerPage] = React.useState(10)
  const { user } = useUser()

  React.useEffect(() => {
    const fetchClients = async () => {
      if (!user?.id) {
        setError("User not authenticated")
        setLoading(false)
        return
      }

      // Debug user information
      console.log("Current User:", {
        id: user.id,
        email: user.email,
        // Add any other relevant user fields
      })

      try {
        // First, let's see all available merchants to debug
        const allMerchantsResponse = await fetch(`${API_BASE_URL}/merchants`)
        const allMerchants = await allMerchantsResponse.json()
        console.log("All Available Merchants:", allMerchants)

        // Step 1: Find the merchant where user_id matches the logged-in user's ID
        const merchantResponse = await fetch(`${API_BASE_URL}/merchants?user_id=${user.id}`)
        if (!merchantResponse.ok) {
          throw new Error(`Failed to fetch merchant details: ${merchantResponse.statusText}`)
        }
        const merchantData = await merchantResponse.json()
        console.log("Merchant Query Response:", {
          queryUserId: user.id,
          merchantData: merchantData,
        })

        if (!merchantData || merchantData.length === 0) {
          throw new Error("No merchant account found for this user")
        }

        // Debug merchant matching
        const userMerchant = merchantData.find((merchant: MerchantDetails) => {
          console.log("Comparing merchant:", {
            merchantUserId: merchant.user_id,
            loggedInUserId: user.id,
            isMatch: merchant.user_id === user.id,
          })
          return merchant.user_id === user.id
        })

        if (!userMerchant) {
          throw new Error("No merchant account found for this user")
        }

        console.log("Found Merchant:", userMerchant)

        // Step 2: Get merchant details including client list
        const merchantDetailsResponse = await fetch(`${API_BASE_URL}/merchant/${userMerchant.id}`)
        if (!merchantDetailsResponse.ok) {
          throw new Error(`Failed to fetch merchant details: ${merchantDetailsResponse.statusText}`)
        }
        const merchantDetails: MerchantDetails = await merchantDetailsResponse.json()
        console.log("Merchant Details with Clients:", merchantDetails)

        if (!merchantDetails.clients || merchantDetails.clients.length === 0) {
          setClients([])
          setLoading(false)
          return
        }

        // Step 3: Fetch details for each client
        const clientsWithDetails = await Promise.all(
          merchantDetails.clients.map(async (client) => {
            try {
              // Fetch client details
              const clientResponse = await fetch(`${API_BASE_URL}/client/${client.id}`)
              if (!clientResponse.ok) {
                throw new Error(`Failed to fetch client details`)
              }
              const clientData = await clientResponse.json()
              console.log(`Client ${client.id} Data:`, clientData)

              // Fetch user details
              const userResponse = await fetch(`${API_BASE_URL}/user/${clientData.user_id}`)
              if (!userResponse.ok) {
                throw new Error(`Failed to fetch user details`)
              }
              const userData = await userResponse.json()
              console.log(`User Data for Client ${client.id}:`, userData)

              return {
                id: clientData.id,
                name: `${userData.first_name} ${userData.last_name}`,
                email: userData.email || "N/A",
                phone: userData.phone || "N/A",
                //status: clientData.merchant_status || "pending",
                float: Number.parseFloat(clientData.float) || 0,
                employer: clientData.employer_id || 0,
                ratings: clientData.ratings || 0,
              }
            } catch (error) {
              console.error(`Error fetching details for client ${client.id}:`, error)
              return {
                id: client.id,
                name: "Error loading client",
                email: "N/A",
                phone: "N/A",
  
                float: 0,
                employer: 0,
                ratings: 0,
              }
            }
          }),
        )

        setClients(clientsWithDetails)
        setLoading(false)
      } catch (err) {
        console.error("Error fetching data:", err)
        setError(err instanceof Error ? err.message : "An unknown error occurred")
        setLoading(false)
      }
    }

    fetchClients()
  }, [user])

  const handleChangePage = (event: unknown, newPage: number) => setPage(newPage)
  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(+event.target.value)
    setPage(0)
  }

  if (loading) return <CircularProgress />
  if (error) return <Alert severity="error">{error}</Alert>

  const startIndex = page * rowsPerPage
  const endIndex = startIndex + rowsPerPage
  const paginatedClients = clients.slice(startIndex, endIndex)

  return (
    <Grid container spacing={3}>
      <Grid xs={12}>
        <Typography variant="h4" gutterBottom>
          Clients
        </Typography>
        {clients.length === 0 ? (
          <Alert severity="info">No clients found for this merchant.</Alert>
        ) : (
          <Paper sx={{ width: "100%", overflow: "hidden" }}>
            <MerchantClientsTable clients={paginatedClients} />
            <TablePagination
              rowsPerPageOptions={[10, 25, 100]}
              component="div"
              count={clients.length}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
            />
          </Paper>
        )}
      </Grid>
    </Grid>
  )
}

