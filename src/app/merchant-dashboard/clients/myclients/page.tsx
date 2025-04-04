"use client"

import * as React from "react"
import Grid from "@mui/material/Unstable_Grid2"
import Typography from "@mui/material/Typography"
import Paper from "@mui/material/Paper"
import TablePagination from "@mui/material/TablePagination"
import CircularProgress from "@mui/material/CircularProgress"
import Alert from "@mui/material/Alert"
import { MerchantClientsTable } from "@/components/dashboard/merchant/merchant-clients-table"
import { useUser } from "@/hooks/use-user"
import { useRouter } from "next/navigation"

const API_BASE_URL = "https://ezitt.whencefinancesystem.com";

export interface MerchantClient {
  id: number               
  userId: string          
  name: string
  email: string
  phone: string | null
  float: number
  ratings: number | null
}

export default function MerchantClients(): React.JSX.Element {
  const [clients, setClients] = React.useState<MerchantClient[]>([])
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)
  const [page, setPage] = React.useState(0)
  const [rowsPerPage, setRowsPerPage] = React.useState(10)
  const { user } = useUser()
  const router = useRouter()

  const handleViewDetails = (clientId: number) => {
    router.push(`/merchant-dashboard/clients/${clientId}`);
  };

  React.useEffect(() => {
    const fetchClients = async () => {
      if (!user?.id) {
        setError("User not authenticated")
        setLoading(false)
        return
      }

      try {
        const response = await fetch(`${API_BASE_URL}/users/${user.id}/clients`)
        if (!response.ok) throw new Error(`Failed to fetch client relationships: ${response.statusText}`)
        
        const data = await response.json()
        console.log("Relationship API Response:", data)

        if (!data.clients || data.clients.length === 0) {
          setClients([])
          setLoading(false)
          return
        }

        const clientDetails = await Promise.all(
          data.clients.map(async (rel: any) => {
            try {
              const clientUserId = rel.recipient_type === 'client' 
                ? rel.recipient_id 
                : rel.requester_id;

              const userResponse = await fetch(`${API_BASE_URL}/user/${clientUserId}`)
              if (!userResponse.ok) throw new Error("User not found")
              const userData = await userResponse.json()

              const clientResponse = await fetch(`${API_BASE_URL}/clients?user_id=${clientUserId}`)
              if (!clientResponse.ok) throw new Error("Client record not found")
              const clientData = await clientResponse.json()
              
              const clientRecord = Array.isArray(clientData) 
                ? clientData.find((c: any) => c.user_id === clientUserId)
                : clientData;

              if (!clientRecord) throw new Error("No matching client record found")

              return {
                id: clientRecord.id,          
                userId: userData.id,         
                name: `${userData.first_name} ${userData.last_name}`,
                email: userData.email,
                phone: userData.phone || "N/A",
                float: Number(clientRecord.float) || 0,
                ratings: clientRecord.ratings
              }
            } catch (err) {
              console.error(`Error loading client details:`, err)
              return null
            }
          })
        )

        setClients(clientDetails.filter(Boolean) as MerchantClient[])
        setLoading(false)
      } catch (err) {
        console.error("Error fetching clients:", err)
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

  return (
    <Grid container spacing={3}>
      <Grid xs={12}>
        <Typography variant="h4" gutterBottom>
          My Clients
        </Typography>
        {clients.length === 0 ? (
          <Alert severity="info">No clients found</Alert>
        ) : (
          <Paper sx={{ width: "100%", overflow: "hidden" }}>
            <MerchantClientsTable 
              clients={clients.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)} 
              count={clients.length}
              page={page}
              rowsPerPage={rowsPerPage}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
              onViewDetails={handleViewDetails}
            />
          </Paper>
        )}
      </Grid>
    </Grid>
  )
}