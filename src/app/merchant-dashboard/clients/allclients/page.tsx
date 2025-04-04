"use client";

import * as React from "react"
import Grid from "@mui/material/Unstable_Grid2"
import Typography from "@mui/material/Typography"
import Paper from "@mui/material/Paper"
import TablePagination from "@mui/material/TablePagination"
import CircularProgress from "@mui/material/CircularProgress"
import Alert from "@mui/material/Alert"
import { useRouter } from "next/navigation";
import { useUser } from "@/hooks/use-user"
import { MerchantClientsTable } from "@/components/dashboard/merchant/merchant-clients-table"

const API_BASE_URL = "https://ezitt.whencefinancesystem.com"

export interface Client {
  id: number
  user_id: number | null
  name: string
  float: number | null
  merchants: string | null
  transactions: string | null
  employer: string | null
  ratings: number | null
  comments: string | null
  status: "approved" | "pending" | "declined"
}

export default function AllClients(): React.JSX.Element {
  const router = useRouter();
  const [clients, setClients] = React.useState<Client[]>([])
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)
  const [page, setPage] = React.useState(0)
  const [rowsPerPage, setRowsPerPage] = React.useState(10)
  const { user } = useUser()

  React.useEffect(() => {
    const fetchAllClients = async () => {
      if (!user?.id) {
        setError("User not authenticated")
        setLoading(false)
        return
      }

      try {
        const clientsResponse = await fetch(`${API_BASE_URL}/clients`)
        if (!clientsResponse.ok) {
          throw new Error(`Failed to fetch clients: ${clientsResponse.statusText}`)
        }

        const clientsData = await clientsResponse.json()
        console.log("All Clients Data:", clientsData)

        // Process client data
        const processedClients = await Promise.all(
          clientsData.map(async (client: any) => {
            try {
              let name = "N/A"
              if (client.user_id) {
                const userResponse = await fetch(`${API_BASE_URL}/user/${client.user_id}`)
                if (userResponse.ok) {
                  const userData = await userResponse.json()
                  name = `${userData.first_name || ""} ${userData.last_name || ""}`.trim() || "N/A"
                }
              }

              return {
                id: client.id,
                user_id: client.user_id,
                name: name,
                float: client.float || 0,
                merchants: client.merchants || "N/A",
                transactions: client.transactions || "N/A",
                employer: client.employer_id ? `ID: ${client.employer_id}` : "N/A",
                ratings: client.ratings || 0,
                comments: client.comments || "",
                status: client.status || "pending",
              }
            } catch (error) {
              console.error(`Error processing client ${client.id}:`, error)
              return {
                id: client.id,
                user_id: client.user_id,
                name: "Error loading client",
                float: 0,
                merchants: "N/A",
                transactions: "N/A",
                employer: "N/A",
                ratings: 0,
                comments: "",
                status: "pending" as const,
              }
            }
          }),
        )

        setClients(processedClients)
        setLoading(false)
      } catch (err) {
        console.error("Error fetching data:", err)
        setError(err instanceof Error ? err.message : "An unknown error occurred")
        setLoading(false)
      }
    }

    fetchAllClients()
  }, [user])

  const handleChangePage = (event: unknown, newPage: number) => setPage(newPage)
  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(+event.target.value)
    setPage(0)
  }

   const handleViewDetails = (clientId: number) => {
    router.push(`/merchant-dashboard/clients/${clientId}`);
  };

  if (loading) return <CircularProgress />
  if (error) return <Alert severity="error">{error}</Alert>

  const startIndex = page * rowsPerPage
  const endIndex = startIndex + rowsPerPage
  const paginatedClients = clients.slice(startIndex, endIndex)

  return (
    <Grid container spacing={3}>
      <Grid xs={12}>
        <Typography variant="h4" gutterBottom>
          All Clients
        </Typography>
        {clients.length === 0 ? (
          <Alert severity="info">No clients found.</Alert>
        ) : (
          <Paper sx={{ width: "100%", overflow: "hidden" }}>
            <MerchantClientsTable clients={paginatedClients} onViewDetails={handleViewDetails}/>
            <TablePagination
              rowsPerPageOptions={[5, 10, 25]}
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

